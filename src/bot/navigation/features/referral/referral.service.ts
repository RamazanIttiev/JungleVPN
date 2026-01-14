import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { UserLocale } from '@user/user.model';
import { UserService } from '@user/user.service';

@Injectable()
export class ReferralMsgService extends Base {
  constructor(
    private readonly userService: UserService,
    private readonly localService: LocalisationService,
  ) {
    super();
  }

  async init(ctx: BotContext, menu: Menu, deleteOldMsg?: boolean) {
    const tgUser = this.userService.validateUser(ctx.from);
    const user = await this.userService.getUserByTgId(tgUser.id);

    const locale = (user?.description || process.env.DEFAULT_LOCALE || 'ru') as UserLocale;

    const content = this.localService.i18n.t(locale, 'referral-page-text', {
      inviterStartBonusInDays: process.env.INVITER_START_BONUS_IN_DAYS || '0',
      inviterPaidBonusInDays: process.env.INVITER_PAID_BONUS_IN_DAYS || '0',
    });

    await this.render(ctx, content, menu, deleteOldMsg);
  }
}
