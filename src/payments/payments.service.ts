import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { CreatePaymentDto, PaymentProvider, PaymentSession } from '@payments/payments.model';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private readonly factory: PaymentProviderFactory,
  ) {}

  async createPayment(
    dto: CreatePaymentDto,
    providerName: PaymentProvider,
  ): Promise<PaymentSession> {
    const provider = this.factory.getProvider(providerName);
    const session = await provider.createPayment(dto);

    const payment = this.paymentRepository.create({
      userId: dto.userId,
      stripeCustomerId: session.customer,
      provider: dto.payment.provider,
      amount: dto.payment.amount,
      currency: dto.payment.currency,
      id: session.id,
      url: session.url,
      createdAt: new Date(),
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
}
