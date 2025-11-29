import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class PaymentMethodsCallback {
  constructor() {}
  register(bot: Bot<BotContext>) {
    bot.callbackQuery('payment-methods', async (ctx) => {
      console.log('payment-methods');
      await ctx.answerCallbackQuery();
    });
  }
}
