import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getSubscriptionPageContent } from '@bot/utils/templates';
import { escapeHtml } from '@bot/utils/utils';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class RevokeSubConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const { user } = await this.loadUser(ctx);
    if (!user?.uuid) return;

    const subUrl = await this.remnaService.revokeSub(user.uuid);
    const session = await conversation.external(async (ctx: BotContext) => {
      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;
      return ctx.session;
    });

    const { appUrl, redirectUrl } = this.buildUrls(session.subUrl);
    const menu = this.buildSubscriptionMenu(conversation, appUrl, redirectUrl);

    const content = getSubscriptionPageContent({
      device: session.selectedDevice!,
      subUrl: escapeHtml(session.subUrl!),
    });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }
}
