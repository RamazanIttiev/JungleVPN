import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { RemnaError } from '@remna/remna.error';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserRequestDto,
  UserDto,
} from '@user/user.model';
import axios, { AxiosInstance } from 'axios';
import { addDays } from 'date-fns';
import { RemnaResponse } from './remna.model';

@Injectable()
export class RemnaService {
  private backend: AxiosInstance = axios.create({
    baseURL: process.env.REMNA_URL,
    withCredentials: true,
    validateStatus: () => true,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REMNA_TOKEN}`,
    },
  });

  private async fetch<Data>({
    method = 'POST',
    url,
    body,
  }: {
    url: string;
    sessionCookie?: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  }): Promise<Data> {
    try {
      const res = await this.backend.request({
        method,
        url,
        data: body,
      });

      const data: RemnaResponse<Data> = res.data;

      if (res.status === 404) {
        return null as Data;
      }

      if (!data) {
        throw new RemnaError(`Invalid response from Remna: ${url}`, res.status, res.data);
      }

      return data.response;
    } catch (e: any) {
      const status = e.response?.status;
      const payload = e.response?.data;

      console.error('REMNA REQUEST ERROR', {
        url,
        method,
        status,
        payload,
        message: e.message,
      });

      throw new RemnaError(`Remna request failed: ${url}`, status, payload);
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    const pageSize = 1000;
    const allUsers: UserDto[] = [];
    let start = 0;

    for (;;) {
      const { total, users } = await this.fetch<{
        total: number;
        users: UserDto[];
      }>({
        url: `/users?size=${pageSize}&start=${start}`,
        method: 'GET',
      });

      allUsers.push(...users);

      if (users.length === 0) break;
      if (allUsers.length >= total) break;
      if (users.length < pageSize) break;

      start += pageSize;
    }

    return allUsers;
  }

  async createUser(payload: Pick<CreateUserRequestDto, 'username' | 'telegramId' | 'description'>) {
    const expiryTime = addDays(new Date(), Number(process.env.TRIAL_PERIOD_IN_DAYS));

    const body: CreateUserRequestDto = {
      username: payload.username,
      telegramId: payload.telegramId,
      expireAt: expiryTime.toISOString(),
      activeInternalSquads: JSON.parse(process.env.REMNA_INTERNAL_SQUADS || ''),
      trafficLimitStrategy: 'MONTH',
      status: 'ACTIVE',
      description: payload.description,
    };

    return this.fetch<CreateUserResponseDto>({ url: '/users', body });
  }

  async updateUser(body: UpdateUserRequestDto) {
    return this.fetch<UserDto>({
      method: 'PATCH',
      url: '/users',
      body,
    });
  }

  async getUserByTgId(id: number): Promise<UserDto | null> {
    try {
      const user = await this.fetch<CreateUserResponseDto[] | null>({
        url: `/users/by-telegram-id/${id}`,
        method: 'GET',
      });

      if (!user) return null;
      return user[0];
    } catch (e: any) {
      if (e instanceof RemnaError && e.status === 404) return null;
      throw e;
    }
  }

  async deleteUser(uuid: string) {
    await this.fetch({ url: `/users/${uuid}`, method: 'DELETE' });
  }

  async revokeSub(uuid: string) {
    const data = await this.fetch<CreateUserResponseDto>({
      url: `/users/${uuid}/actions/revoke`,
    });

    return data.subscriptionUrl;
  }
}
