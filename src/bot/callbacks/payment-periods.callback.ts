import { BotContext } from '@bot/bot.types';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { Injectable } from '@nestjs/common';
import { PaymentPeriod } from '@payments/payments.model';
import { Bot } from 'grammy';

@Injectable()
export class PaymentPeriodsCallback {
  constructor(readonly paymentPeriodsMsgService: PaymentPeriodsMsgService) {}
  register(bot: Bot<BotContext>) {
    bot.callbackQuery(['payment_for_1mo', 'payment_for_3mo', 'payment_for_6mo'], async (ctx) => {
      ctx.session.selectedPeriod = ctx.callbackQuery.data.replace(
        'payment_for_',
        '',
      ) as PaymentPeriod;
      console.log('PaymentPeriodsCallback');
      // await this.paymentPeriodsMsgService.handlePaymentPeriod(ctx);
      await ctx.answerCallbackQuery();
    });
  }
}
