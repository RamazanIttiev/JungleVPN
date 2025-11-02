import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getPaymentPageContent } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class PaymentConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { paymentUrl, paymentId, selectedPeriod, selectedAmount } = session;

    if (!paymentUrl || !paymentId) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      await this.stop(conversation);
      return;
    }

    const menu = conversation
      .menu('payment-menu')
      .url('💳 Оплатить подписку', paymentUrl)
      .text('Я оплатил ✅')
      .row()
      .text('Главное меню');

    const content = getPaymentPageContent(selectedPeriod!, selectedAmount!);

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }
}
