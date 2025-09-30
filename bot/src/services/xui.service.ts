import { AxiosError } from 'axios';
import { backend } from '../index';
import {
  Inbound,
  InboundClient,
  InboundId,
  InboundSettings,
  XuiResponse,
} from '../models/xui-inbound-settings.model';
import { generateClientBody } from '../utils/xui.util';

export class XuiService {
  private sessionCookie: string | null = null;

  constructor() {}

  private async login(): Promise<XuiResponse<null>> {
    try {
      const { headers, data } = await backend.post('/login');

      const setCookie = headers['set-cookie'];

      if (Array.isArray(setCookie)) {
        const cookieStr = setCookie.find((c: string) => c.startsWith('3x-ui='));
        if (cookieStr) {
          const value = cookieStr.split(';')[0];
          this.sessionCookie = value.replace('3x-ui=', '');
          backend.defaults.headers.Cookie = `3x-ui=${this.sessionCookie}`;
        }
      }

      if (data.success) {
        return data;
      }

      throw new AxiosError('BOT. Please login. Method login');
    } catch (error) {
      throw new AxiosError('BOT. SERVER ERROR. Method login');
    }
  }

  async getClients(telegramId: string, inboundId?: InboundId): Promise<InboundClient[]> {
    try {
      const { success } = await this.login();
      if (!success) {
        throw new Error('BOT. Please log in. Method getClients');
      }

      const { data } = await backend.get(`/${inboundId || process.env.XUI_TEST_INBOUND}`);

      const inbound: Inbound | null = data?.obj;

      if (!inbound?.settings) {
        throw new Error(
          `BOT. Inbound ${inboundId || process.env.XUI_TEST_INBOUND} has no settings`,
        );
      }

      const settings: InboundSettings = JSON.parse(data.obj.settings);

      return settings.clients.filter((client) => client.tgId === telegramId);
    } catch (error) {
      console.error('BOT. SERVER ERROR. Method getClients', error);
      throw error;
    }
  }

  async addClient(tgId: string): Promise<string> {
    const body = generateClientBody(tgId);

    try {
      const { success } = await this.login();
      if (!success) {
        throw new Error('BOT. Please log in. Method addClient');
      }

      const { data } = await backend.post('/addClient', body);

      if (!data?.success) {
        throw new Error(`BOT. addClient failed: ${data?.msg || 'Unknown error'}`);
      }

      const settings: InboundSettings = JSON.parse(body.settings);
      const client = settings.clients.find((client) => client.tgId === tgId);

      return await this.generateUrl(client);
    } catch (error) {
      console.error('BOT. SERVER ERROR. Method addClient', error);
      throw error;
    }
  }

  async updateClient(tgId: string, enable: boolean): Promise<unknown> {
    const body = generateClientBody(tgId, enable);

    const { data } = await backend.post(`/updateClient`, body);
    return data;
  }

  async deleteClient(clientId: string, inboundId?: InboundId): Promise<unknown> {
    const body = { inboundId: inboundId || Number(process.env.XUI_TEST_INBOUND), clientId };

    try {
      const { success } = await this.login();
      if (!success) {
        throw new Error('BOT. Please log in. Method deleteClient');
      }

      const { data } = await backend.post('/deleteClient', body);

      if (!data?.success) {
        throw new Error(`BOT. deleteClient failed: ${data?.msg || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('BOT. SERVER ERROR. Method deleteClient', error);
      throw error;
    }
  }

  async generateUrl(client: InboundClient | undefined, inboundId?: InboundId): Promise<string> {
    try {
      const { success } = await this.login();
      if (!success) {
        throw new Error('BOT. Please log in. Method getClients');
      }

      const { data } = await backend.get(`/${inboundId || process.env.XUI_TEST_INBOUND}`);

      const inbound: Inbound | null = data?.obj;

      if (!inbound) {
        throw new Error(
          `BOT. Inbound ${inboundId || process.env.XUI_TEST_INBOUND} has no settings`,
        );
      }

      return `${process.env.XUI_URL}:${process.env.XUI_SUB_PORT}/subscription/${client?.subId}?name=${process.env.XUI_SERVER_NAME}`;
    } catch (error) {
      console.error('BOT. SERVER ERROR. Method getClients', error);
      throw error;
    }
  }
}
