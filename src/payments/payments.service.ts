import { Injectable, NotFoundException } from '@nestjs/common';
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
    });

    await this.paymentRepository.save(payment);

    // const mockPayment = () => {
    //   return {
    //     id: `${randomId()}`,
    //     url: `https://google.com`,
    //     createdAt: new Date(),
    //     provider: 'yookassa',
    //   } as PaymentSession;
    // };
    // return Promise.resolve(mockPayment());

    return { id: session.id, url: session.url };
  }

  async checkPaymentStatus(paymentId: string) {
    const payment = await this.paymentRepository.findOneBy({ id: paymentId });
    const providerName = payment?.provider;

    if (!providerName) {
      throw new NotFoundException('providerName is required, checkPaymentStatus');
    }
    const provider = this.factory.getProvider(providerName);
    return await provider.checkPaymentStatus(paymentId, providerName);
  }

  async updatePayment(id: string, partial: Partial<Payment>) {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) throw new Error(`Payment ${id} not found`);

    Object.assign(payment, partial);
    await this.paymentRepository.save(payment);
  }
  handleWebhook?: ((data: any) => Promise<void>) | undefined;
}

// TELEGRAM YOOKASSA PAYMENT EXAMPLE

// await paymentsService.createPayment();
// const invoice = {
//   chatId,
//   title: 'Subscription',
//   description: 'Subscription to the service',
//   payload: `invoice-${telegramId}-${Date.now()}`,
//   provider_token: process.env.PAYMENT_TOKEN || '',
//   currency: 'RUB',
//   prices: [{ label: 'Subscription', amount: 50000 }],
//   need_email: false,
//   createdAt: new Date(),
// };
//
// const provider_data = {
//   receipt: {
//     items: [
//       {
//         description: invoice.description,
//         quantity: 1,
//         amount: {
//           value: '500.00',
//           currency: invoice.currency,
//         },
//         vat_code: 1,
//       },
//     ],
//   },
// };
//
// try {
//   const response = await ctx.api.sendInvoice(
//     chatId,
//     invoice.title,
//     invoice.description,
//     invoice.payload,
//     invoice.currency,
//     invoice.prices,
//     {
//       provider_token: invoice.provider_token,
//       provider_data: JSON.stringify(provider_data),
//     },
//   );

//   console.log(response);
// } catch (error) {
//   console.error('Error sending invoice:', error);
//   await ctx.reply('Ошибка при создании счета. Пожалуйста, попробуйте позже.');
// }
