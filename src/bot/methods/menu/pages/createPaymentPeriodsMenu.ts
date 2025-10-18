import { BotContext, MenuContext } from '@bot/bot.model';
import { goToMainPage, goToPaymentPage } from '@bot/methods/menu/routes';
import { mapPeriodLabelToPriceLabel } from '@bot/methods/utils';
import { Menu } from '@bot/navigation/menu';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';

const periods: PaymentPeriod[] = JSON.parse(process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]');
const amounts: PaymentAmount[] = JSON.parse(
  process.env.PAYMENT_AMOUNTS || '["199.0", "599.00", "999.00"]',
);
const periodAmounts = periods.reduce(
  (acc, period, index) => {
    acc[period] = amounts[index];
    return acc;
  },
  {} as Record<PaymentPeriod, PaymentAmount>,
);

export const createPaymentPeriodsMenu = (paymentMenu: MenuContext) => {
  const menu = new Menu('payment-periods-menu');

  periods.forEach((period) => {
    menu.row().text(mapPeriodLabelToPriceLabel(period), async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const { url, id } = await ctx.services.payments.createPayment(
        {
          userId: tgUser.id,
          amount: periodAmounts[period],
          currency: 'RUB',
        },
        'yookassa',
      );

      ctx.session.paymentId = id;
      ctx.session.paymentUrl = url;
      ctx.session.selectedAmount = periodAmounts[period];
      ctx.session.selectedPeriod = period;

      await goToPaymentPage(ctx, period, periodAmounts[period], paymentMenu);
    });
  });

  menu.row().text('⬅ Назад', goToMainPage);

  return menu;
};
