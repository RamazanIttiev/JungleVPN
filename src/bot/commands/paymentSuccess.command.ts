import { BotContext } from '@bot/bot.types';
import { Bot } from 'grammy';

export class PaymentSuccessCommand {
  register(bot: Bot<BotContext>) {
    bot.callbackQuery('paymentSuccess', async (ctx) => {
      try {
        await ctx.deleteMessage();
      } catch {
        return;
      }
      await ctx.conversation.enter('devices');
    });
  }
}
