import { BotContext } from '@bot/bot.types';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Base } from '@bot/navigation/menu.base';
import { getRedirectUrl } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';

@Injectable()
export class RevokeSubMenuService extends Base {
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

    if (!user) {
      await this.userService.init(ctx);
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    const subUrl = await this.remnaService.revokeSub(user.uuid);
    session.redirectUrl = getRedirectUrl(session.selectedDevice, subUrl);
  }
}
