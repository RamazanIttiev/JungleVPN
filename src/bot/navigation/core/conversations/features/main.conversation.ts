import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getMainPageContent } from '@bot/utils/templates';
import { toDateString } from '@bot/utils/utils';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { isValidUsername } from '@utils/utils';
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

    const user = await conversation.external(async (ctx) => {
      return this.loadUser(ctx);
    });

    const isExpired = this.isExpired(user?.expireAt);

    const tgName = ctx.from?.username || ctx.from?.first_name;
    const username = isValidUsername(tgName) ? tgName! : 'Дорогой друг';

    const content = getMainPageContent({
      username,
      isExpired,
      validUntil: toDateString(user?.expireAt!),
    });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }
}
