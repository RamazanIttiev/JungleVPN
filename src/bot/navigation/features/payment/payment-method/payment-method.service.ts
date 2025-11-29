import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { mapPeriodToDate } from '@utils/utils';

@Injectable()
export class PaymentMethodMsgService extends Base {
  constructor(
    readonly remnaService: RemnaService,
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
  ) {
    super();
  }

  async handlePaymentMethod(ctx: BotContext, provider: PaymentProvider) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const { selectedPeriod, selectedAmount } = session;

    if (!user || !selectedPeriod || !selectedAmount) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const { id, url } = await this.paymentsService.createPayment(
      {
        userId: tgUser.id.toString(),
        payment: {
          amount: selectedAmount,
          provider,
          currency: provider === 'yookassa' ? 'RUB' : 'USD',
          description: process.env.PAYMENT_PROVIDER_DESCRIPTION,
        },
        metadata: {
          selectedPeriod: mapPeriodToDate(selectedPeriod),
          telegramId: tgUser.id,
          telegramMessageId: ctx.msg?.message_id,
        },
      },
      provider,
    );

    this.updateSession(ctx, id, url);

    await this.paymentMsgService.init(ctx);
  }

  private updateSession(ctx: BotContext, id: string, url: string) {
    ctx.session.paymentId = id;
    ctx.session.paymentUrl = url;
  }
}
