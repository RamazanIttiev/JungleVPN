import { Injectable } from '@nestjs/common';
import { Payment } from '@payments/payment.entity';
import {
  CreatePaymentDto,
  IPaymentProvider,
  PaymentSession,
  PaymentStatus,
} from '@payments/payments.model';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class YooKassaProvider implements IPaymentProvider {
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
            return_url: 'https://t.me/ten_vpn_bot',
          },
          description: '',
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

  updatePayment: (id: string, partial: Partial<Payment>) => Promise<void>;
  async handleWebhook(data: any): Promise<void> {
    // Optionally process webhook callbacks
  }
}
