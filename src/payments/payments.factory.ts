import { Injectable } from '@nestjs/common';
import { IPaymentProvider } from '@payments/payments.model';
import { YooKassaProvider } from '@payments/providers/yookassa.provider';

@Injectable()
export class PaymentProviderFactory {
  constructor(private readonly yookassa: YooKassaProvider) {}

  getProvider(providerName: string): IPaymentProvider {
    switch (providerName) {
      case 'yookassa':
        return this.yookassa;

      default:
        throw new Error(`Unsupported payment provider: ${providerName}`);
    }
  }
}
