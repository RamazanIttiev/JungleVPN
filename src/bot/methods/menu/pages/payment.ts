import { BotContext } from '@bot/bot.model';
import { Menu } from '@grammyjs/menu';
import { goToDevicesPage } from '../routes';

export const createPaymentMenu = () => {
  return new Menu<BotContext>('payment-menu')
    .dynamic(async (ctx, range) => {
      // Todo delete payment url after issue
      const paymentUrl = ctx.session.paymentUrl;
      if (paymentUrl) {
        range.url('💳 Оплатить подписку', paymentUrl);
      }
    })
    .text('Я оплатил ✅', async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const paymentId = ctx.session.paymentId;

      if (!paymentId) {
        await ctx.reply('Это кажется старое сообщение');
        return;
      }

      // const status = await ctx.services.payments.getPaymentStatus(paymentId);

      // if (isNewUser) {
      //   await goToDevicesPage(ctx);
      // } else {
      //   await ctx.reply(
      //     'Платеж не найден или не оплачен. Пожалуйста, убедитесь, что вы оплатили подписку.',
      //   );
      // }
    })
    .row()
    .text('⬅ Назад', async (ctx) => goToDevicesPage(ctx));
};
