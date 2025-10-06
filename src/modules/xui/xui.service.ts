import axios, { AxiosError, AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { User } from 'grammy/types';
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
      console.log(error);
      console.log('SERVER ERROR', url);
    }
  }

  private async login() {
    const username = process.env.XUI_USERNAME || '';
    const password = process.env.XUI_PASSWORD || '';

    try {
      const { data } = await this.backend.post(`${process.env.XUI_BASE_URL}:2053/api/login`, {
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

  async getTgIds() {
    await this.login();

    const inbounds = await this.getInbound(process.env.XUI_INBOUND_ID);
    const settings: InboundSettings = inbounds?.settings && JSON.parse(inbounds?.settings);

    return settings.clients.map((x) => x.tgId);
  }

  async getClients(tgId: number, inboundId?: InboundId): Promise<Client[]> {
    await this.login();

    const inbound = await this.getInbound(inboundId || process.env.XUI_INBOUND_ID);

    const settings: InboundSettings = inbound && JSON.parse(inbound.settings);

    return settings.clients.filter((client) => client.tgId === tgId);
  }

  async getClientByDevice(tgId: number, device: ClientDevice) {
    const clients = await this.getClients(tgId);

    const iosClient = clients.find((client) => client.comment === 'ios');
    const androidClient = clients.find((client) => client.comment === 'android');
    const macOSClient = clients.find((client) => client.comment === 'macOS');

    switch (device) {
      case 'ios':
        return iosClient;
      case 'android':
        return androidClient;
      case 'macOS':
        return macOSClient;
    }
  }

  async addClient(tgUser: User, device: ClientDevice): Promise<Client> {
    const body = generateClientBody({ tgUser, client: { comment: device } });

    await this.login();
    await this.fetch({ url: '/inbounds/addClient', body });

    const settings: InboundSettings = JSON.parse(body.settings);
    return settings.clients[0];
  }

  async getOrIssueSubUrl(tgUser: User, device: ClientDevice) {
    const existingClient = await this.getClientByDevice(tgUser.id, device);

    if (existingClient) return this.generateSubUrl(existingClient.subId);

    const client = await this.addClient(tgUser, device);

    return this.generateSubUrl(client.subId);
  }

  async deleteClient(clientId: string, inboundId?: InboundId): Promise<void> {
    const id = inboundId || process.env.XUI_INBOUND_ID;

    if (!id) throw new AxiosError('NO inboundId. Method deleteClient');

    await this.login();
    await this.fetch({ url: `/inbounds/${id}/delClient/${clientId}` });
  }

  generateSubUrl(subId: string) {
    const subUrl = `${process.env.XUI_SUB_URL}/subscription/${subId}`;

    return {
      subUrl,
      redirectUrl: `${process.env.XUI_BASE_URL}/redirect?link=v2raytun://import/${subUrl}`,
    };
  }
}
