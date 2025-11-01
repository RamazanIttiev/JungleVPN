// conversations/paymentStatus.conversation.ts

import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { initialSession } from '@session/session.model';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class PaymentStatusConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly paymentService: PaymentsService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { paymentId, paymentUrl } = session;
    console.log(session);
    if (!paymentUrl) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      await this.stop(conversation);
      return;
    }

    if (!paymentId) {
      await ctx.reply('❗ Платеж не найден. Попробуй заново /start');
      await this.stop(conversation);
      return;
    }

    const status = await conversation.external(() =>
      this.paymentService.checkPaymentStatus(paymentId),
    );

    if (status === 'succeeded') {
      await this.paymentService.updatePayment(paymentId, { status, paidAt: new Date() });

      await conversation.external((ctx) => {
        ctx.session = initialSession();
      });

      await conversation.external(async (ctx) => {
        await ctx.reply('✅ Оплата прошла успешно!');
        await ctx.conversation.enter('devices');
      });
    } else {
      await ctx.reply('❗ Платеж еще не оплачен.');
    }

    await this.stop(conversation);
  }
}
