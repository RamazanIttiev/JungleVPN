import { BotContext } from '@bot/bot.model';
import { goToDevicesPage } from '@bot/methods/menu/routes';
import { Menu } from '@grammyjs/menu';

export const createPaymentMenu = () => {
  const menu = new Menu<BotContext>('payment-menu');

  menu.dynamic(async (ctx, range) => {
    const paymentUrl = ctx.session.paymentUrl;
    if (paymentUrl) {
      range.url('💳 Оплатить подписку', paymentUrl);
    }
  });

  menu
    .text('Я оплатил ✅', async (ctx) => {
      const paymentId = ctx.session.paymentId;
      console.log(paymentId);
      if (!paymentId) {
        await ctx.reply('Это кажется старое сообщение');
        return;
      }

      const status = await ctx.services.payments.checkPaymentStatus(paymentId, 'yookassa');

      if (status === 'succeeded') {
        ctx.session.paymentUrl = undefined;
        await goToDevicesPage(ctx);
      } else {
        await ctx.reply('Платеж не найден или не оплачен. Уверен, что ты оплатил подписку?');
      }
    })
    .row();

  return menu;
};
