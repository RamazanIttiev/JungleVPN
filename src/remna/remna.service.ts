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
    method?: 'GET' | 'POST' | 'PATCH';
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

  async getAllUsers() {
    return await this.fetch<CreateUserResponseDto[]>({
      url: '/users',
      method: 'GET',
    });
  }

  async createUser(payload: Pick<UserDto, 'username' | 'telegramId'>) {
    const expiryTime = new Date();
    expiryTime.setDate(expiryTime.getDate() + (Number(process.env.TRIAL_PERIOD) || 60));

    const body: CreateUserRequestDto = {
      username: payload.username,
      telegramId: payload.telegramId,
      expireAt: expiryTime.toISOString(),
      activeInternalSquads: [process.env.REMNA_INTERNAL_SQUAD || ''],
      trafficLimitStrategy: 'MONTH',
      status: 'ACTIVE',
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

  async getUserByTgId(id: number) {
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

  async revokeSub(uuid: string) {
    const data = await this.fetch<CreateUserResponseDto>({
      url: `/users/${uuid}/actions/revoke`,
    });

    return data.subscriptionUrl;
  }
}
