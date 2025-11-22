import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Payment } from '@payments/payment.entity';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { mapPeriodToDate } from '@utils/utils';

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
    readonly remnaService: RemnaService,
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async getPendingPayment(
    prevPeriod: PaymentPeriod | undefined,
    period: PaymentPeriod,
    paymentId: string | undefined,
  ) {
    return prevPeriod === period && paymentId
      ? await this.paymentsService.findValidPayment(paymentId)
      : null;
  }

  async handlePendingPayment(ctx: BotContext, pendingPayment: Payment, period: PaymentPeriod) {
    const { id, url } = pendingPayment;
    this.updateSession(ctx, id, url, period);
    await this.paymentMsgService.init(ctx, this.paymentMenu.menu);
    return;
  }

  async handlePaymentPeriod(ctx: BotContext, period: PaymentPeriod) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const { selectedPeriod, paymentId } = session;

    if (!user) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const pendingPayment = await this.getPendingPayment(selectedPeriod, period, paymentId);

    if (pendingPayment) {
      await this.handlePendingPayment(ctx, pendingPayment, period);
    }

    const { id, url } = await this.paymentsService.createPayment(
      {
        userId: tgUser.id,
        amount: this.periodAmounts[period],
        currency: 'RUB',
        metadata: {
          selectedPeriod: mapPeriodToDate(selectedPeriod),
          telegramId: tgUser.id,
          telegramMessageId: ctx.msg?.message_id,
        },
        description: 'Рад видеть тебя в JUNGLE 🌴',
      },
      'yookassa',
    );

    this.updateSession(ctx, id, url, period);

    await this.paymentMsgService.init(ctx, this.paymentMenu.menu);
  }

  private updateSession(ctx: BotContext, id: string, url: string, period: PaymentPeriod) {
    ctx.session.paymentId = id;
    ctx.session.paymentUrl = url;
    ctx.session.selectedAmount = this.periodAmounts[period];
    ctx.session.selectedPeriod = period;
  }
}
