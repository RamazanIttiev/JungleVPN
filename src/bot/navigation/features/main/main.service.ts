import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { isValidUsername, toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';

@Injectable()
export class MainMsgService extends Base {
  constructor(readonly userService: UserService) {
    super();
  }

  async init(ctx: BotContext, menu: Menu, deleteOldMsg?: boolean) {
    const user = await this.userService.init(ctx);

    const isExpired = this.isExpired(user.expireAt);

    const username = isValidUsername(ctx.from?.username)
      ? ctx.from?.username
      : ctx.t('dear-friend');

    const content = ctx.t('main-text', {
      username: username!,
      expireAt: toDateString(user.expireAt),
      isExpired: isExpired ? 'true' : 'false',
      trial_period: Number(process.env.TRIAL_PERIOD_IN_DAYS),
    });

    await this.render(ctx, content, menu, deleteOldMsg);
  }
}
