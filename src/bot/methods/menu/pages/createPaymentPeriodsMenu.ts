import { BotContext, MenuContext } from '@bot/bot.model';
import { goToPaymentPage } from '@bot/methods/menu/routes';
import { Menu } from '@grammyjs/menu';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';

const periods: PaymentPeriod[] = ['1mo', '3mo', '6mo'];
const amount: Record<PaymentPeriod, PaymentAmount> = {
  '1mo': '199.00',
  '3mo': '599.00',
  '6mo': '999.00',
};

export const createPaymentPeriodsMenu = (paymentMenu: MenuContext) => {
  const menu = new Menu<BotContext>('payment-periods-menu');

  periods.forEach((period) => {
    menu.text(period, async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const { url, id } = await ctx.services.payments.createPayment(
        {
          userId: tgUser.id,
          amount: amount[period],
        },
        'yookassa',
      );

      ctx.session.paymentId = id;
      ctx.session.paymentUrl = url;
      ctx.session.selectedAmount = amount[period];
      ctx.session.selectedPeriod = period;

      await goToPaymentPage(ctx, period, amount[period], paymentMenu);
    });
  });

  return menu;
};
