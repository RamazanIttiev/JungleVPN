import axios, { AxiosError, AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { Client, ClientDevice, Inbound, InboundId, InboundSettings } from './xui.model';
import { generateClientBody } from './xui.util';

interface XuiResponse<T> {
  success: boolean;
  msg: string;
  obj: T;
}

export class XuiService {
  private jar = new CookieJar();
  private backend: AxiosInstance = wrapper(
    axios.create({
      baseURL: process.env.XUI_FETCH_URL,
      withCredentials: true,
      jar: this.jar,
      validateStatus: () => true,
    }),
  );

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
      const res = await this.backend.request({ method, url, data: body });

      const data: XuiResponse<Data> = res.data;

      if (data.success) {
        return data.obj;
      }

      throw new AxiosError('REQUEST ERROR', url);
    } catch (error) {
      console.log('SERVER ERROR', url);
    }
  }

  private async login() {
    const username = process.env.XUI_USERNAME || '';
    const password = process.env.XUI_PASSWORD || '';

    try {
      const { data } = await this.backend.post(`${process.env.XUI_BASE_URL}/api/login`, {
        username,
        password,
      });

      if (!data.success) {
        throw new AxiosError('BOT. Please login. Method login', data.msg);
      }
    } catch (error) {
      throw new AxiosError('BOT. SERVER ERROR. Method login');
    }
  }

  private async getInbound(inboundId: string | undefined): Promise<Inbound | undefined> {
    if (!inboundId) throw new AxiosError('NO inboundId. Method getInbound');

    return await this.fetch<Inbound>({
      method: 'GET',
      url: `/inbounds/get/${inboundId}`,
    });
  }

  async getClients(telegramId: string, inboundId?: InboundId): Promise<Client[]> {
    await this.login();

    const inbound = await this.getInbound(inboundId || process.env.XUI_INBOUND_ID);

    const settings: InboundSettings = inbound && JSON.parse(inbound.settings);

    return settings.clients.filter((client) => client.tgId === telegramId);
  }

  async getClientByDevice(tgId: string, device: ClientDevice) {
    const clients = await this.getClients(tgId);

    const mobileClient = clients.find((client) => client.comment === 'mobile');
    const laptopClient = clients.find((client) => client.comment === 'laptop');

    switch (device) {
      case 'mobile':
        return mobileClient;
      case 'laptop':
        return laptopClient;
    }
  }

  async addClient(tgId: string, device: ClientDevice): Promise<Client> {
    const body = generateClientBody({ tgId, comment: device });

    await this.login();
    await this.fetch({ url: '/inbounds/addClient', body });

    const settings: InboundSettings = JSON.parse(body.settings);
    return settings.clients[0];
  }

  async getOrIssueSubUrl(tgId: string, device: ClientDevice) {
    const existingClient = await this.getClientByDevice(tgId, device);

    if (device === 'mobile' && existingClient) return this.generateUrl(existingClient.subId);
    if (device === 'laptop' && existingClient) return this.generateUrl(existingClient.subId);

    const client = await this.addClient(tgId, device);

    return this.generateUrl(client.subId);
  }

  async deleteClient(clientId: string, inboundId?: InboundId): Promise<void> {
    const id = inboundId || process.env.XUI_INBOUND_ID;

    if (!id) throw new AxiosError('NO inboundId. Method deleteClient');

    await this.login();
    await this.fetch({ url: `/inbounds/${id}/delClient/${clientId}` });
  }

  generateUrl(subId: string): string {
    return `${process.env.XUI_SUB_URL}/subscription/${subId}?name=${process.env.XUI_SERVER_NAME}`;
  }
}
