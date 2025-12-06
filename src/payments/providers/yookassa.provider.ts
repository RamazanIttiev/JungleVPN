import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
} from '@payments/payments.model';
import axios, { AxiosInstance } from 'axios';
import { AbstractPaymentProvider } from './abstract.provider';

export type YookassaPaymentStatus = 'succeeded' | 'canceled' | 'pending';

export interface YookassaPaymentPayload {
  id: string;
  status: YookassaPaymentStatus;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  authorization_details?: {
    rrn?: string;
    auth_code?: string;
    three_d_secure?: {
      applied: boolean;
    };
  };
  created_at: string; // ISO timestamp
  description?: string;
  expires_at?: string; // ISO timestamp
  metadata: Record<string, any>;
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    card?: {
      first6?: string;
      last4?: string;
      expiry_month?: string;
      expiry_year?: string;
      card_type?: string;
      issuer_country?: string;
      issuer_name?: string;
    };
    title?: string;
  };
  refundable: boolean;
  test: boolean;
}

@Injectable()
export class YooKassaProvider extends AbstractPaymentProvider {
  readonly id: PaymentProvider = 'yookassa';

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
            value: `${dto.payment.amount}.00`,
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: process.env.RETURN_URL,
          },
          description: dto.payment.description,
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

  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const { data } = await this.yookassaApi.get(`/${paymentId}`);
      return data.status;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}
