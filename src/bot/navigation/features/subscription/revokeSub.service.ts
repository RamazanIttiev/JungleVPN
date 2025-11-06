import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Base } from '@bot/navigation/menu.base';
import { getSubscriptionPageContent } from '@bot/utils/templates';
import { escapeHtml } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class RevokeSubMsgService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    @Inject(forwardRef(() => SubscriptionMenu))
    readonly subscriptionMenu: SubscriptionMenu,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const { user } = session;

    if (!user?.uuid) {
      await ctx.reply('Что-то пошло не так, попробуй заново /start');
      return;
    }

    const subUrl = await this.remnaService.revokeSub(user.uuid);
    session.user.subscriptionUrl = subUrl;
    session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;

    const content = getSubscriptionPageContent({
      device: session.selectedDevice!,
      subUrl: escapeHtml(session.user.subscriptionUrl!),
    });

    await this.render(ctx, content, this.subscriptionMenu.menu);
  }
}
