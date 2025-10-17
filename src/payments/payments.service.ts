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

  async createPayment(
    dto: CreatePaymentDto,
    providerName: PaymentProvider,
  ): Promise<PaymentSession> {
    const provider = this.factory.getProvider(providerName);
    const session = await provider.createPayment(dto, providerName);

    this.paymentRepository.create({
      userId: dto.userId,
      provider: session.provider,
      providerPaymentId: session.id,
      amount: dto.amount,
      currency: dto.currency,
      status: 'pending',
    });

    return session;
  }

  async checkPaymentStatus(paymentId: string, providerName: PaymentProvider) {
    const provider = this.factory.getProvider(providerName);
    return await provider.checkPaymentStatus(paymentId, providerName);
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
