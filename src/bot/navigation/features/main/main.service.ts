import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { isValidUsername, toDateString } from '@utils/utils';

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

    const username = isValidUsername(ctx.from?.username)
      ? ctx.from?.username
      : ctx.t('dear-friend');

    const content = ctx.t('main', {
      username: username!,
      validUntil: toDateString(session.user.expireAt!),
      isExpired: isExpired ? 'true' : 'false',
    });

    await this.render(ctx, content, menu);
  }
}
