import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getPaymentPeriodsPage } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

export class PaymentPeriodsConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const menu = conversation
      .menu('paymentPeriods-menu')
      .text('1 rub')
      .row()
      .text('1 месяц (199 ₽)')
      .row()
      .text('3 месяца (599 ₽)')
      .row()
      .text('6 месяцев (999 ₽)')
      .row()
      .back('⬅ Назад');

    const content = getPaymentPeriodsPage();

    await this.render(ctx, content, menu);
  }
}
