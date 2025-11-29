import { Injectable } from '@nestjs/common';
import { AbstractPaymentProvider } from '@payments/providers/abstract.provider';
import { StripeProvider } from '@payments/providers/stripe.provider';
import { YooKassaProvider } from '@payments/providers/yookassa.provider';

@Injectable()
export class PaymentProviderFactory {
  private readonly providers: Map<string, AbstractPaymentProvider> = new Map();

  constructor(
    private readonly yookassa: YooKassaProvider,
    private readonly stripe: StripeProvider,
  ) {
    this.register(this.yookassa);
    this.register(this.stripe);
  }

  private register(provider: AbstractPaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(providerId: string): AbstractPaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${providerId}`);
    }
    return provider;
  }
}
