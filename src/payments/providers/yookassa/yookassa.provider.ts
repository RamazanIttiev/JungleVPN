import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePaymentDto,
  IPaymentProvider,
  PaymentSession,
  PaymentStatus,
  WebhookResult,
} from '@payments/payments.model';
import {
  YookassaNotificationEvent,
  YookassaWebhookPayload,
} from '@payments/providers/yookassa/yookassa.model';
import axios, { AxiosInstance } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class YooKassaProvider implements IPaymentProvider {
  logger = new Logger('YooKassaProvider');

  private readonly validIpAddresses: string[] = JSON.parse(
    process.env.YOOKASSA_PAYMENT_VALID_IP_ADDRESS || '[]',
  );

  private yookassaApi: AxiosInstance = axios.create({
    baseURL: process.env.YOOKASSA_URL,
    withCredentials: true,
    validateStatus: () => true,
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: process.env.YOOKASSA_SHOP_ID || '',
      password: process.env.YOOKASSA_API_KEY || '',
    },
  });

  async createPayment(dto: CreatePaymentDto): Promise<PaymentSession> {
    try {
      const { data } = await this.yookassaApi.post(
        '/',
        {
          amount: {
            value: dto.amount,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: process.env.RETURN_URL,
          },
          description: dto.description,
          metadata: dto.metadata,
        },
        {
          headers: {
            'Idempotence-Key': crypto.randomUUID(),
          },
        },
      );

      return {
        id: data.id,
        url: data.confirmation.confirmation_url,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async isIPRangeValid(ip: string): Promise<boolean> {
    const normalizedIps = this.getNormalizedIPs();

    const matcher = new CIDRMatcher(normalizedIps);

    const ips = ip.split(',').map((i) => i.trim());

    if (!ips.some((i) => matcher.contains(i))) {
      this.logger.warn(`Invalid YooKassa IP: ${ip}`);
      return false;
    }

    return true;
  }

  private getNormalizedIPs(): string[] {
    return this.validIpAddresses.map((ipAddr) => {
      if (ipAddr.includes('/')) return ipAddr;
      return ipAddr.includes(':') ? `${ipAddr}/128` : `${ipAddr}/32`;
    });
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const { data } = await this.yookassaApi.get(`/${paymentId}`);
      return data.status;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  isValidNotificationEvent(event: string): event is YookassaNotificationEvent {
    return ['payment.succeeded', 'payment.canceled', 'payment.waiting_for_capture'].includes(event);
  }

  isValidWebhookPayload(payload: YookassaWebhookPayload): boolean {
    return (
      payload?.object &&
      payload.type === 'notification' &&
      this.isValidNotificationEvent(payload.event)
    );
  }

  parseWebhook(payload: YookassaWebhookPayload): WebhookResult {
    return {
      paymentId: payload.object.id,
      status: payload.object.status,
      event: payload.event,
    };
  }
}
