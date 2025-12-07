import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentCurrency, PaymentPeriod, PaymentProvider } from '@payments/payments.model';

@Injectable()
export class CurrencyService {
  constructor(private readonly config: ConfigService) {}

  getPriceForPeriod(
    period: PaymentPeriod,
    provider: PaymentProvider,
  ): {
    amount: number;
    currency: PaymentCurrency;
  } {
    const rub = this.config.get<number>(`PRICE_RUB_${period.toUpperCase()}`);
    const usd = this.config.get<number>(`PRICE_EUR_${period.toUpperCase()}`);

    if (!rub || !usd) {
      throw new Error(`Missing price for period: ${period}`);
    }

    switch (provider) {
      case 'yookassa': {
        return { amount: Number(rub), currency: 'RUB' };
      }
      default: {
        return { amount: Number(usd), currency: 'USD' };
      }
    }
  }
}
