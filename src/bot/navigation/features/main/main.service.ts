import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { getMainPageContent } from '@bot/utils/templates';
import { toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';

@Injectable()
export class MainMsgService extends Base {
  constructor(readonly userService: UserService) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;

    if (!session.user.uuid) {
      await this.userService.init(ctx);
    }

    const isExpired = this.isExpired(session.user.expireAt);

    const content = getMainPageContent({
      username: session.user.username!,
      isExpired,
      validUntil: toDateString(session.user.expireAt!),
    });

    await this.render(ctx, content, menu);
  }
}
