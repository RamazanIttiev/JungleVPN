import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { mapPeriodLabelToPriceLabel } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
    readonly mainMsgService: MainMsgService,
    readonly paymentMsgService: PaymentMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super(botService, remnaService);

    if (this.periods.length !== this.amounts.length) {
      throw new Error('PAYMENT_PERIODS and PAYMENT_AMOUNTS lengths must match');
    }

    this.periodAmounts = this.periods.reduce(
      (acc, period, i) => {
        acc[period] = this.amounts[i];
        return acc;
      },
      {} as Record<PaymentPeriod, PaymentAmount>,
    );

    this.menu.dynamic((_, range) => {
      this.periods.forEach((period) => {
        range.text(
          mapPeriodLabelToPriceLabel(period),
          async (ctx) => await this.handlePaymentPeriod(ctx, period),
        );
        range.row();
      });

      range.row();
      range.text({ text: '⬅ Назад' }, async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
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
    const prevPeriod = ctx.session.selectedPeriod;
    const validPayment =
      prevPeriod === period
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
}
