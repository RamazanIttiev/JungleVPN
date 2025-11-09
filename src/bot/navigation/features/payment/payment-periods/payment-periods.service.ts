import { BotContext } from '@bot/bot.types';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';

@Injectable()
export class PaymentPeriodsMsgService extends Base {
  readonly periods: PaymentPeriod[] = JSON.parse(
    process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]',
  );
  readonly amounts: PaymentAmount[] = JSON.parse(
    process.env.PAYMENT_AMOUNTS || '["199.00", "599.00", "999.00"]',
  );

  readonly periodAmounts = this.periods.reduce(
    (acc, period, i) => {
      acc[period] = this.amounts[i];
      return acc;
    },
    {} as Record<PaymentPeriod, PaymentAmount>,
  );

  constructor(
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async handlePaymentPeriod(ctx: BotContext, period: PaymentPeriod) {
    const tgUser = this.validateUser(ctx.from);
    const prevPeriod = ctx.session.selectedPeriod;
    const validPayment =
      prevPeriod === period && ctx.session.paymentId
        ? await this.paymentsService.findValidPayment(ctx.session.paymentId)
        : null;

    if (validPayment) {
      const { id, url } = validPayment;
      this.updateSession(ctx, id, url, period);
      await this.paymentMsgService.init(ctx, this.paymentMenu.menu);
      return;
    }

    const { id, url } = await this.paymentsService.createPayment(
      {
        userId: tgUser.id,
        amount: this.periodAmounts[period],
        currency: 'RUB',
      },
      'yookassa',
    );

    this.updateSession(ctx, id, url, period);

    await this.paymentMsgService.init(ctx, this.paymentMenu.menu);
  }

  private updateSession(ctx: any, id: string, url: string, period: PaymentPeriod) {
    ctx.session.paymentId = id;
    ctx.session.paymentUrl = url;
    ctx.session.selectedAmount = this.periodAmounts[period];
    ctx.session.selectedPeriod = period;
  }
}
