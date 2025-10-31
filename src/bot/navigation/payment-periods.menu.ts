import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation/core/menu';
import { BaseMenu } from '@bot/navigation/core/menu/base.menu';
import { getPaymentPageContent } from '@bot/utils/templates';
import { mapPeriodLabelToPriceLabel } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class PaymentsPeriodsMenu extends BaseMenu {
  menu = new Menu('paymentPeriods-menu');
  private readonly periodAmounts: Record<PaymentPeriod, PaymentAmount>;

  private periods: PaymentPeriod[] = JSON.parse(
    process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]',
  );
  private amounts: PaymentAmount[] = JSON.parse(
    process.env.PAYMENT_AMOUNTS || '["199.0", "599.00", "999.00"]',
  );

  constructor(
    readonly botService: BotService,
    readonly paymentsService: PaymentsService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
    this.periodAmounts = this.periods.reduce(
      (acc, period, index) => {
        acc[period] = this.amounts[index];
        return acc;
      },
      {} as Record<PaymentPeriod, PaymentAmount>,
    );
  }

  create(paymentMenu: Menu) {
    this.periods.forEach((period) => {
      this.menu.row().text(mapPeriodLabelToPriceLabel(period), async (ctx) => {
        const tgUser = this.botService.validateUser(ctx.from);
        const { url, id } = await this.paymentsService.createPayment(
          {
            userId: tgUser.id,
            amount: this.periodAmounts[period],
            currency: 'RUB',
          },
          'yookassa',
        );

        ctx.session.paymentId = id;
        ctx.session.paymentUrl = url;
        ctx.session.selectedAmount = this.periodAmounts[period];
        ctx.session.selectedPeriod = period;

        const content = getPaymentPageContent(period, this.periodAmounts[period]);

        const editMessage = async () => {
          await ctx.editMessageText(content, {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
            reply_markup: paymentMenu,
          });
        };

        try {
          await ctx.deleteMessage();
        } catch (error) {
          await editMessage();
          console.error('Failed to delete message:', error);
        }

        await ctx.reply(content, {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: paymentMenu,
        });
      });
    });

    // this.menu.row().text('⬅ Назад', (ctx) => this.goToMain(ctx));

    return this.menu;
  }
}
