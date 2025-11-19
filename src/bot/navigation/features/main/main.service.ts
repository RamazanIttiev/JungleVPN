import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { getMainPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { toDateString } from '@utils/utils';

@Injectable()
export class MainMsgService extends Base {
  constructor(readonly userService: UserService) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const user = await this.userService.init(ctx);

    const isExpired = this.isExpired(user.expireAt);

    const content = getMainPageContent({
      username: user.username,
      isExpired,
      validUntil: toDateString(user.expireAt),
    });

    await this.render(ctx, content, menu);
  }
}
