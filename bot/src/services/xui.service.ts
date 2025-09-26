import { AxiosError } from 'axios';
import { backend } from '../index';
import {
  InboundClient,
  InboundId,
  InboundSettingsPayload,
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

  async getClients(inboundId: InboundId): Promise<InboundClient[]> {
    try {
      const { success } = await this.login();

      if (success) {
        const { data } = await backend.get(`/${inboundId}`);

        const settings: InboundSettingsPayload = JSON.parse(data.obj.settings);

        return settings.clients;
      }

      throw new Error('BOT. Please log in. Method getInbound');
    } catch (error) {
      console.log('BOT. SERVER ERROR. Method getInbound');
      throw new Error(error as string);
    }
  }

  async addClient(tgId: string): Promise<XuiResponse<null>> {
    const body = generateClientBody(tgId);

    try {
      const { success } = await this.login();

      if (success) {
        const { data } = await backend.post('/addClient', body);

        if (data.success) {
          return data;
        } else {
          throw new Error(data.msg);
        }
      }
      const { data } = await backend.post('/addClient', body);

      if (data.success) {
        return data;
      } else {
        throw new Error(data.msg);
      }
    } catch (error) {
      console.log(error);
      throw new Error('BOT. SERVER ERROR. Method: addClient');
    }
  }

  async updateClient(tgId: string, enable: boolean): Promise<unknown> {
    const body = generateClientBody(tgId, enable);

    const { data } = await backend.post(`/updateClient`, body);
    return data;
  }

  async deleteClient(clientId: string): Promise<unknown> {
    const body = {
      inboundId: 1,
      clientId,
    };

    const { data } = await backend.post(`/deleteClient`, body);
    return data as unknown;
  }
}
