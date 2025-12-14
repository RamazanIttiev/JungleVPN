import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentProviderFactory } from '@payments/payments.factory';
import {
  CreatePaymentDto,
  PaymentProvider,
  PaymentSession,
  PaymentWebhookPayload,
} from '@payments/payments.model';

import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private readonly factory: PaymentProviderFactory,
  ) {}

  async findValidPayment(id: string) {
    const payment = await this.paymentRepository.findOneBy({ id, status: 'pending' });

    if (!payment || !payment.createdAt) return null;

    const expiresAt = payment.createdAt.getTime() + 10 * 60 * 1000;
    if (Date.now() < expiresAt) {
      return payment;
    } else {
      return null;
    }
  }

  async createPayment(
    dto: CreatePaymentDto,
    providerName: PaymentProvider,
  ): Promise<PaymentSession> {
    const provider = this.factory.getProvider(providerName);
    const session = await provider.createPayment(dto, providerName);

    const payment = this.paymentRepository.create({
      id: session.id,
      userId: dto.userId.toString(),
      provider: providerName,
      amount: dto.amount,
      currency: dto.currency,
      createdAt: new Date(),
      status: 'pending',
      url: session.url,
    });

    await this.paymentRepository.save(payment);

    return { id: session.id, url: session.url };
  }

  async updatePayment(id: string, partial: Partial<Payment>) {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) throw new Error(`Payment ${id} not found`);

    Object.assign(payment, partial);
    await this.paymentRepository.save(payment);
  }

  async handleWebhook(
    payload: PaymentWebhookPayload,
    providerName: PaymentProvider,
  ): Promise<{
    shouldProcess: boolean;
    reason?: string;
    paymentId?: string;
    event?: string;
  }> {
    const provider = this.factory.getProvider(providerName);

    if (!provider.isValidWebhookPayload(payload)) {
      return {
        shouldProcess: false,
        reason: 'Invalid webhook payload structure',
      };
    }

    const { paymentId, status: webhookStatus, event } = provider.parseWebhook(payload);

    try {
      const status = await provider.checkPaymentStatus(paymentId);
      if (status !== webhookStatus) {
        return {
          shouldProcess: false,
          reason: `Payment ${paymentId} status mismatch! Webhook: ${webhookStatus}, API: ${status}. Possible fake webhook.`,
          paymentId,
        };
      }
    } catch (apiError) {
      console.error(`API verification failed for payment ${paymentId}`, apiError);
    }

    return {
      shouldProcess: true,
      paymentId,
      event,
    };
  }
}
