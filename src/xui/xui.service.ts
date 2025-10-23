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
      baseURL: process.env.XUI_BASE_URL,
      withCredentials: true,
      jar: this.jar,
      validateStatus: () => true,
    }),
  );

  private async login() {
    const username = process.env.XUI_USERNAME || '';
    const password = process.env.XUI_PASSWORD || '';

    try {
      const { data } = await this.backend.post('/login', {
        username,
        password,
      });

      if (!data.success) {
        throw new AxiosError('BOT. Please login. Method login', data.msg);
      }
    } catch (error) {
      console.log(error);
      throw new AxiosError('BOT. SERVER ERROR. Method login');
    }
  }

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
    await this.login();

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

  private async getInbound(inboundId: string | undefined): Promise<Inbound | undefined> {
    if (!inboundId) throw new AxiosError('NO inboundId. Method getInbound');

    try {
      return await this.fetch<Inbound>({
        method: 'GET',
        url: `/panel/api/inbounds/get/${inboundId}`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getClients(tgId: number, inboundId?: InboundId): Promise<Client[]> {
    const inbound = await this.getInbound(inboundId || process.env.XUI_INBOUND_ID);

    const settings: InboundSettings = inbound && JSON.parse(inbound.settings);

    return settings.clients.filter((client) => client.tgId === tgId);
  }

  async getClientByDevice(tgId: number, device: ClientDevice) {
    const clients = await this.getClients(tgId);

    const iosClient = clients.find((client) => client.comment === 'ios');
    const androidClient = clients.find((client) => client.comment === 'android');
    const macOSClient = clients.find((client) => client.comment === 'macOS');
    const windowsOSClient = clients.find((client) => client.comment === 'windows');

    switch (device) {
      case 'ios':
        return iosClient;
      case 'android':
        return androidClient;
      case 'macOS':
        return macOSClient;
      case 'windows':
        return windowsOSClient;
    }
  }

  async addClient(tgUser: User, device: ClientDevice): Promise<Client> {
    const body = generateClientBody({ tgUser, device });
    await this.fetch({
      url: '/panel/api/inbounds/addClient',
      body: {
        id: Number(process.env.XUI_INBOUND_ID),
        settings: JSON.stringify({
          clients: [body],
        }),
      },
    });

    return body;
  }

  async updateClient(client: Client, options: Partial<Client>) {
    const updatedClient = {
      ...client,
      ...options,
    };

    try {
      await this.fetch({
        url: `/panel/api/inbounds/updateClient/${client.id}`,
        body: {
          id: Number(process.env.XUI_INBOUND_ID),
          settings: JSON.stringify({
            clients: [updatedClient],
          }),
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updateClientsExpiryTime(tgId: number, expiryTime: number) {
    const clients = await this.getClients(tgId);

    for (const client of clients) {
      await this.updateClient(client, { expiryTime });
    }
  }

  async deleteClient(clientId: string, inboundId?: InboundId): Promise<void> {
    const id = inboundId || process.env.XUI_INBOUND_ID;

    if (!id) throw new AxiosError('NO inboundId. Method deleteClient');

    await this.fetch({ url: `/panel/api/inbounds/${id}/delClient/${clientId}` });
  }

  generateUrls(subId: string) {
    const subUrl = `${process.env.XUI_BASE_URL}/sub/${subId}`;

    return {
      subUrl,
      redirectUrl: `${process.env.XUI_BASE_URL}/redirect?link=v2raytun://import/${subUrl}`,
    };
  }
}
