import { BotService } from '@bot/bot.service';
import { BotContext, initialSession } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { mapPeriodToDate } from '@bot/utils/utils';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { add } from 'date-fns';
import { Context, InlineKeyboard } from 'grammy';

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
    const { uuid, expireAt } = session.user;
    const { paymentId, paymentUrl, selectedPeriod } = session;

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
      await this.remnaService.updateUser({
        uuid,
        expireAt: add(expireAt || new Date(), {
          months: mapPeriodToDate(selectedPeriod),
        }).toISOString(),
        status: 'ACTIVE',
      });

      await conversation.external(async (ctx) => {
        await ctx.deleteMessage();
        await ctx.replyWithSticker(process.env.PAYMENT_SUCCESS_STICKER || '', {
          reply_markup: new InlineKeyboard().text('Подключиться 📶', 'paymentSuccess'),
        });
      });

      await conversation.external((ctx) => {
        ctx.session = initialSession();
      });
    } else {
      await ctx.reply('❗ Платеж еще не оплачен.');
    }

    await this.stop(conversation);
  }
}
