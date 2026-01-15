import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { CreatePaymentDto, IPayment, PaymentSession } from '@payments/payments.model';

import { Repository } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    private readonly factory: PaymentProviderFactory,
  ) {}

  async createPayment(dto: Omit<IPayment, 'metadata'>) {
    const payment = this.paymentRepository.create(dto);

    return await this.paymentRepository.save(payment);
  }
  async createPaymentFromProvider(dto: CreatePaymentDto): Promise<PaymentSession> {
    const provider = this.factory.getProvider(dto.payment.provider);
    const session = await provider.createPayment(dto);

    const existingPayment = await this.findOneByStripeCustomerId(session.customer);

    if (!existingPayment) {
      const payment = this.paymentRepository.create({
        id: session.id,
        url: session.url,
        stripeCustomerId: session.customer,
        status: 'pending',
        amount: dto.payment.amount,
        currency: dto.payment.currency,
        userId: dto.userId,
        provider: provider.id,
        paidAt: null,
        stripeSubscriptionId: null,
        invoiceUrl: null,
      });

      await this.paymentRepository.save(payment);

      return { id: payment.id, url: payment.url || '', customer: payment.stripeCustomerId };
    } else {
      return {
        id: existingPayment.id,
        url: existingPayment.url || '',
        customer: existingPayment.stripeCustomerId,
      };
    }
  }

  async updatePayment(id: string, partial: Partial<IPayment>) {
    return await this.paymentRepository.update(id, partial);
  }

  async findOneByStripeCustomerId(
    stripeCustomerId: string | null | undefined,
  ): Promise<IPayment | null> {
    if (!stripeCustomerId) return null;
    return this.paymentRepository.findOne({
      where: { stripeCustomerId },
      order: { createdAt: 'DESC' },
    });
  }
}
