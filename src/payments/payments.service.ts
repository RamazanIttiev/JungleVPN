import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentProviderFactory } from '@payments/payments.factory';
import {
  CreatePaymentDto,
  IPaymentProvider,
  PaymentProvider,
  PaymentSession,
} from '@payments/payments.model';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService implements IPaymentProvider {
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
  handleWebhook?: ((data: any) => Promise<void>) | undefined;
}
