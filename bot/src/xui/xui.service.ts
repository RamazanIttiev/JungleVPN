import axios, { AxiosError, AxiosInstance } from 'axios';
import { Inbound, InboundClient, InboundId, InboundSettings } from './xui.model';
import { generateClientBody } from './xui.util';

interface XuiResponse<T> {
  success: boolean;
  msg: string;
  obj: T;
}

export class XuiService {
  private sessionCookie: string | undefined = undefined;
  private backend: AxiosInstance = axios.create({
    baseURL: process.env.XUI_FETCH_URL,
    withCredentials: true,
    validateStatus: () => true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  private async fetch<Data>({
    method = 'POST',
    url,
    sessionCookie,
    body,
  }: {
    url: string;
    sessionCookie?: string;
    method?: 'GET' | 'POST';
    body?: unknown;
  }): Promise<Data> {
    const headers: Record<string, string> = {};
    if (sessionCookie) headers.Cookie = `3x-ui=${sessionCookie}`;

    try {
      const res = await this.backend.request({ method, url, headers, data: body });

      const data: XuiResponse<Data> = res.data;

      if (data.success) {
        return data.obj;
      }

      // TODO create error handling service
      throw new AxiosError('REQUEST ERROR', url);
    } catch (error) {
      throw new AxiosError('SERVER ERROR', url);
    }
  }

  private async login() {
    const username = process.env.XUI_USERNAME || '';
    const password = process.env.XUI_PASSWORD || '';

    try {
      const { headers, data } = await this.backend.post(`${process.env.XUI_BASE_URL}/api/login`, {
        username,
        password,
      });

      const setCookie = headers['set-cookie'];

      if (Array.isArray(setCookie)) {
        const cookieStr = setCookie.find((c: string) => c.startsWith('3x-ui='));

        if (cookieStr) {
          const value = cookieStr.split(';')[0];
          this.sessionCookie = value.replace('3x-ui=', '');
          this.backend.defaults.headers.Cookie = `3x-ui=${this.sessionCookie}`;
        }
      }

      if (!data.success) {
        console.log(data);
        throw new AxiosError('BOT. Please login. Method login');
      }
    } catch (error) {
      throw new AxiosError('BOT. SERVER ERROR. Method login');
    }
  }

  private async getInbound(inboundId: string | undefined): Promise<Inbound> {
    const sessionCookie = parseSessionCookie(this.sessionCookie);

    if (!inboundId) throw new AxiosError('NO inboundId. Method getInbound');

    return await this.fetch<Inbound>({
      method: 'GET',
      url: `/inbounds/get/${inboundId}`,
      sessionCookie,
    });
  }

  async getClients(telegramId: string, inboundId?: InboundId): Promise<InboundClient[]> {
    await this.login();

    const inbound = await this.getInbound(inboundId || process.env.XUI_TEST_INBOUND);

    const settings: InboundSettings = JSON.parse(inbound.settings);

    return settings.clients.filter((client) => client.tgId === telegramId);
  }

  async addClient(tgId: string): Promise<string> {
    const body = generateClientBody(tgId);

    await this.login();
    await this.fetch({ url: '/inbounds/addClient', body });

    const settings: InboundSettings = JSON.parse(body.settings);
    const client = settings.clients.find((client) => client.tgId === tgId);

    return this.generateUrl(client);
  }

  async deleteClient(clientId: string, inboundId?: InboundId): Promise<void> {
    const id = inboundId || process.env.XUI_TEST_INBOUND;

    if (!id) throw new AxiosError('NO inboundId. Method deleteClient');

    await this.login();
    await this.fetch({ url: `/inbounds/${id}/delClient/${clientId}` });
  }

  generateUrl(client: InboundClient | undefined): string {
    return `${process.env.XUI_BASE_URL}:${process.env.XUI_SUB_PORT}/subscription/${client?.subId}?name=${process.env.XUI_SERVER_NAME}`;
  }
}

function parseSessionCookie(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';').map((c) => c.trim());
  const session = parts.find((c) => c.startsWith('3x-ui='));
  if (!session) return undefined;
  return session.substring('3x-ui='.length);
}
