import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { mapDeviceLabel } from '@utils/utils';

@Injectable()
export class SubscriptionMsgService extends Base {
  constructor(readonly userService: UserService) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;

    if (!session.user.uuid) {
      await this.userService.init(ctx);
    }

    const deviceLabel = mapDeviceLabel(session.selectedDevice!);

    const text = ctx.t('subscription-text', {
      deviceLabel,
      subUrl: session.user.subscriptionUrl!,
    });
    await this.render(ctx, text, menu);
  }
}
