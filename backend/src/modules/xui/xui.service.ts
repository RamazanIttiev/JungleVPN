import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class XuiService {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.XUI_BASE_URL || '';
    this.http = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
      validateStatus: () => true,
    });
  }

  async login(username: string, password: string) {
    const res = await this.http.post(
      '/login',
      { username, password },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    const setCookie = res.headers['set-cookie'] || [];
    const sessionCookie = Array.isArray(setCookie)
      ? setCookie.find((c: string) => c.startsWith('3x-ui='))
      : undefined;

    if (!sessionCookie) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { status: res.status, data: res.data, setCookie };
  }

  async forward(method: 'GET' | 'POST', url: string, sessionCookie?: string, body?: unknown) {
    const headers: Record<string, string> = {};
    if (sessionCookie) headers.Cookie = `3x-ui=${sessionCookie}`;

    const res = await this.http.request({ method, url, headers, data: body });
    return { status: res.status, data: res.data };
  }
}
