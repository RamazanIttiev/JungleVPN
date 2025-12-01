import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import { CreatePaymentDto, PaymentProvider, PaymentSession } from '@payments/payments.model';
import { AbstractPaymentProvider } from './abstract.provider';

@Injectable()
export class StripeProvider extends AbstractPaymentProvider {
  readonly id: PaymentProvider = 'stripe';

  async createPayment(dto: CreatePaymentDto): Promise<PaymentSession> {
    const amount = dto.payment.amount;
    let linkId = '';
    let linkUrl = '';

    switch (amount) {
      case Number(process.env.PRICE_USD_MONTH_1):
        linkId = process.env.STRIPE_SUB_LINK_1 || '';
        linkUrl = process.env.STRIPE_SUB_LINK_1 || '';
        break;
      case Number(process.env.PRICE_USD_MONTH_3):
        linkId = process.env.STRIPE_SUB_LINK_2 || '';
        linkUrl = process.env.STRIPE_SUB_LINK_2 || '';
        break;
      case Number(process.env.PRICE_USD_MONTH_6):
        linkId = process.env.STRIPE_SUB_LINK_3 || '';
        linkUrl = process.env.STRIPE_SUB_LINK_3 || '';
        break;
    }

    return {
      id: linkId,
      url: linkUrl,
    };
  }
}
