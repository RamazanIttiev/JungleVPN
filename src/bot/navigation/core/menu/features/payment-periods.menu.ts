import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { Injectable } from '@nestjs/common';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class PaymentsPeriodsMenu extends Base {
  readonly menu = new Menu('paymentPeriods-menu');
  private readonly periodAmounts: Record<PaymentPeriod, PaymentAmount>;

  private readonly periods: PaymentPeriod[] = JSON.parse(
    process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]',
  );
  private readonly amounts: PaymentAmount[] = JSON.parse(
    process.env.PAYMENT_AMOUNTS || '["199.00", "599.00", "999.00"]',
  );

  constructor(
    readonly botService: BotService,
    readonly paymentsService: PaymentsService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.periodAmounts = this.periods.reduce(
      (acc, period, i) => {
        acc[period] = this.amounts[i];
        return acc;
      },
      {} as Record<PaymentPeriod, PaymentAmount>,
    );

    this.menu
      .text('1 rub', async (ctx: BotContext) => {
        await this.handlePaymentPeriod(ctx, '1d');
      })
      .row()
      .text('1 месяц (199 ₽)', async (ctx: BotContext) => {
        await this.handlePaymentPeriod(ctx, '1mo');
      })
      .row()
      .text('3 месяца (599 ₽)', async (ctx: BotContext) => {
        await this.handlePaymentPeriod(ctx, '3mo');
      })
      .row()
      .text('6 месяцев (999 ₽)', async (ctx: BotContext) => {
        await this.handlePaymentPeriod(ctx, '6mo');
      })
      .row();

    this.menu.back('⬅ Назад', async (ctx) => {
      await this.navigateTo(ctx, 'main');
    });
  }

  updateSession(ctx: any, id: string, url: string, period: PaymentPeriod) {
    ctx.session.paymentId = id;
    ctx.session.paymentUrl = url;
    ctx.session.selectedAmount = this.periodAmounts[period];
    ctx.session.selectedPeriod = period;
  }

  async handlePaymentPeriod(ctx: any, period: PaymentPeriod) {
    const tgUser = this.botService.validateUser(ctx.from);
    const isValidPayment = await this.paymentsService.isPaymentValid(ctx.session.paymentId);

    if (isValidPayment) {
      const { id, url } = isValidPayment;
      this.updateSession(ctx, id, url, period);
      await this.navigateTo(ctx, 'payment');
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

    await this.navigateTo(ctx, 'payment');
  }

  create() {
    return this.menu;
  }
}
