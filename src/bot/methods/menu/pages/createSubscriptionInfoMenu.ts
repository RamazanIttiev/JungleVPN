import { BotContext } from '@bot/bot.model';
import { Menu } from '@grammyjs/menu';
import { PaymentPeriod } from '@payments/payments.model';

const periods: PaymentPeriod[] = ['1mo', '3mo', '6mo'];

export const createSubscriptionInfoMenu = () => {
  const menu = new Menu<BotContext>('subscription-info-menu');

  periods.forEach((period) => {
    menu.text(period, (ctx) => {
      console.log(ctx);
    });
  });

  return menu;
};
