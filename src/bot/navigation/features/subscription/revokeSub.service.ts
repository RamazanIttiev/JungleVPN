import { BotContext } from '@bot/bot.types';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { mapDeviceLabel } from '@utils/utils';

@Injectable()
export class RevokeSubMsgService extends Base {
  constructor(
    readonly userService: UserService,
    readonly remnaService: RemnaService,
    @Inject(forwardRef(() => SubscriptionMenu))
    readonly subscriptionMenu: SubscriptionMenu,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const user = await this.userService.init(ctx);

    if (!user || !session.selectedDevice || !user.subscriptionUrl) {
      await this.userService.init(ctx);
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    const subUrl = await this.remnaService.revokeSub(user.uuid);
    user.subscriptionUrl = subUrl;
    session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;

    const deviceLabel = mapDeviceLabel(session.selectedDevice!);

    const text = ctx.t('subscription-page', {
      deviceLabel,
      subUrl: session.user.subscriptionUrl!,
    });

    await this.render(ctx, text, this.subscriptionMenu.menu, true);
  }
}
