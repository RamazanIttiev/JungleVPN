import { BotContext } from '@bot/bot.model';
import { goToDevicesPage } from '@bot/methods/menu/routes';
import { Menu } from '@bot/navigation/menu';
import { initialSession } from '@session/session.model';

export const createPaymentMenu = () => {
  const menu = new Menu('payment-menu');

  menu.dynamic(async (ctx, range) => {
    const paymentUrl = ctx.session.paymentUrl;
    if (paymentUrl) {
      range.url('💳 Оплатить подписку', paymentUrl);
    }
  });

  menu
    .text('Я оплатил ✅', async (ctx) => {
      const paymentId = ctx.session.paymentId;
      const tgUser = ctx.services.bot.validateUser(ctx.from);

      if (!paymentId) {
        await ctx.reply('Это кажется старое сообщение');
        return;
      }

      const status = await ctx.services.payments.checkPaymentStatus(paymentId);

      if (status === 'succeeded') {
        await ctx.services.users.updateExpiryTime(tgUser.id, ctx.session.selectedPeriod!);
        await ctx.services.payments.updatePayment(paymentId, { status, paidAt: new Date() });
        ctx.session = initialSession();
        await goToDevicesPage(ctx);
      } else {
        await ctx.reply('Платеж не найден или не оплачен. Уверен, что ты оплатил подписку?');
      }
    })
    .row();

  return menu;
};
