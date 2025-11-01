import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getMainPageContent, getNewUserMainPageContent } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class MainConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const menu = conversation.menu('main-menu').text('Подключиться 📶').text('Продлить подписку');

    const { user, username } = await conversation.external((ctx) => this.loadUser(ctx));
    const isExpired = this.isExpired(user?.expireAt);

    const content = !user
      ? getNewUserMainPageContent({ username, isExpired, isNewUser: true })
      : getMainPageContent({ username, isExpired, validUntil: user?.expireAt });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }
}
