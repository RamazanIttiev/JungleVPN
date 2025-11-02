import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getAppLink, getSubscriptionPageContent } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class SubscriptionConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);

    const { redirectUrl } = this.buildUrls(session.user.subscriptionUrl);
    const menu = this.buildSubscriptionMenu(
      conversation,
      getAppLink(session.selectedDevice),
      redirectUrl,
    );

    const text = getSubscriptionPageContent({
      device: session.selectedDevice,
      subUrl: session.user.subscriptionUrl,
    });

    await this.render(ctx, text, menu);
    await this.stop(conversation);
  }
}
