import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class ClientAppConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { appUrl, redirectUrl } = this.buildUrls(session.subUrl);
    const menu = this.buildSubscriptionMenu(conversation, appUrl, redirectUrl);

    await ctx.editMessageReplyMarkup({ reply_markup: menu });
  }
}
