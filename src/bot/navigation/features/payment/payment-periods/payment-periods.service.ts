import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';

@Injectable()
export class PaymentPeriodsMsgService extends Base {
  readonly periods: PaymentPeriod[] = JSON.parse(
    process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]',
  );
  readonly amounts: PaymentAmount[] = JSON.parse(process.env.PAYMENT_AMOUNTS || '["2", "4", "10"]');

  constructor(readonly paymentMethodsMenu: PaymentMethodMenu) {
    super();
  }

  async init(ctx: BotContext) {
    const content = 'Choose method';

    await this.render(ctx, content, this.paymentMethodsMenu.menu);
  }
}
