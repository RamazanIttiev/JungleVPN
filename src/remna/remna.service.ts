import axios, { AxiosError, AxiosInstance } from 'axios';
import { CreateUserDTO, RemnaResponse, User } from './remna.model';

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
    method?: 'GET' | 'POST';
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

  async createUser(data: CreateUserDTO): Promise<User> {
    const expiryTime = new Date();
    expiryTime.setDate(expiryTime.getDate() + 90);

    const body = {
      expireAt: expiryTime.toISOString(),
      activeInternalSquads: [process.env.REMNA_INTERNAL_SQUAD],
      status: 'ACTIVE',
      ...data,
    };

    try {
      const data = await this.fetch<User>({ url: '/users', body });
      if (!data) {
        throw new AxiosError('REQUEST ERROR. createUser', data);
      }

      return data;
    } catch (error) {
      console.error(error);
      throw new AxiosError('SERVER ERROR. createUser');
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
