import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { mapDeviceLabel, mapToClientAppName } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';

@Injectable()
export class SubscriptionMsgService extends Base {
  constructor(readonly userService: UserService) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;
    const user = await this.userService.init(ctx);

    if (!session.selectedDevice) {
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    const deviceLabel = mapDeviceLabel(session.selectedDevice);
    const clientAppLabel = mapToClientAppName(session.selectedDevice);

    const text = ctx.t('subscription-text', {
      deviceLabel,
      subUrl: user.subscriptionUrl,
      clientAppLabel,
    });
    await this.render(ctx, text, menu);
  }
}
