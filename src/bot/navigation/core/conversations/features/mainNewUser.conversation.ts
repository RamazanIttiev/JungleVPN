import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getNewUserMainPageContent } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class MainNewUserConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const menu = conversation.menu('main-new-user-menu').text('Подключиться 📶');
    const tgUser = this.botService.validateUser(ctx.from);
    const username = tgUser.first_name ?? tgUser.username;

    const content = getNewUserMainPageContent({ username });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }
}
