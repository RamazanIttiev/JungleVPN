import { Injectable } from '@nestjs/common';
import { User } from '@user/user.model';
import { isValidUsername } from '@utils/utils';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { CreateUserDTO, RemnaResponse, UpdateUserDTO } from './remna.model';

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
  }): Promise<Data | undefined> {
    try {
      const res = await this.backend.request({
        method,
        url,
        data: body,
      });
      const data: RemnaResponse<Data> = res.data;

      if (data) return data.response;

      throw new AxiosError('REQUEST ERROR', url);
    } catch (error) {
      console.log(error);
      console.log('SERVER ERROR', url);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const data = await this.fetch<{
        total: number;
        users: User[];
      }>({
        url: '/users',
        method: 'GET',
      });

      if (!data) {
        throw new AxiosError('REQUEST ERROR. getAllUsers', data);
      }

      return data.users;
    } catch (error) {
      console.error(error);
      throw new AxiosError('SERVER ERROR. getAllUsers');
    }
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const expiryTime = new Date();
    expiryTime.setDate(expiryTime.getDate() + Number(process.env.TRIAL_PERIOD) || 60);

    const body = {
      ...data,
      username: isValidUsername(data.username)
        ? `${data.username}_${data.telegramId}`
        : `${data.telegramId}`,
      expireAt: expiryTime.toISOString(),
      activeInternalSquads: [process.env.REMNA_INTERNAL_SQUAD],
      trafficLimitStrategy: 'MONTH',
      status: 'ACTIVE',
    };

    const user = await this.fetch<User>({ url: '/users', body });
    if (!user) {
      throw new AxiosError('REQUEST ERROR. createUser');
    }

    return user;
  }

  async updateUser(body: Partial<UpdateUserDTO>): Promise<User> {
    try {
      const data = await this.fetch<User>({ method: 'PATCH', url: '/users', body });
      if (!data) {
        throw new AxiosError('REQUEST ERROR. updateUser', data);
      }

      return data;
    } catch (error) {
      console.error(error);
      throw new AxiosError('SERVER ERROR. updateUser');
    }
  }

  async getUserByTgId(id: number): Promise<User | null> {
    try {
      const data = await this.fetch<User[]>({
        url: `/users/by-telegram-id/${id}`,
        method: 'GET',
      });

      if (!data) {
        return null;
      }

      return data[0];
    } catch (error) {
      console.error(error);
      throw new AxiosError('SERVER ERROR. getUserByTgId');
    }
  }

  async revokeSub(uuid: string): Promise<string> {
    try {
      const data = await this.fetch<User>({ url: `/users/${uuid}/actions/revoke` });
      if (!data) {
        throw new AxiosError('REQUEST ERROR. revokeSub', data);
      }

      return data.subscriptionUrl;
    } catch (error) {
      console.error(error);
      throw new AxiosError('SERVER ERROR. revokeSub');
    }
  }
}
