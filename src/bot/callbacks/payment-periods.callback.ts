import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { PaymentPeriod } from '@payments/payments.model';
import { Bot } from 'grammy';

@Injectable()
export class PaymentPeriodsCallback {
  register(bot: Bot<BotContext>) {
    bot.callbackQuery(['payment_for_month_1', 'payment_for_month_3', 'payment_for_month_6'], async (ctx) => {
      ctx.session.selectedPeriod = ctx.callbackQuery.data.replace(
        'payment_for_',
        '',
      ) as PaymentPeriod;
      await ctx.answerCallbackQuery();
    });
  }
}
