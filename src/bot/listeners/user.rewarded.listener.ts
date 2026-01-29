import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserLocale } from '@user/user.model';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';

@Injectable()
export class UserRewardedListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
    private readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.rewarded')
  async handleUserRewardedListener(payload: { id: number; isNewUser: boolean }) {
    const { id, isNewUser } = payload;

    const user = await this.userService.getUserByTgId(id);
    const expireAt = user?.expireAt;
    const locale = (user?.description || process.env.DEFAULT_LOCALE || 'ru') as UserLocale;
    const formattedDate = toDateString(expireAt!);

    const content = this.localService.i18n.t(locale, 'user-rewarded-text', {
      isNewUser: isNewUser ? 'true' : 'false',
      inviterStartBonusInDays: process.env.INVITER_START_BONUS_IN_DAYS || '0',
      inviterPaidBonusInDays: process.env.INVITER_PAID_BONUS_IN_DAYS || '0',
      formattedDate,
    });

    try {
      await this.bot.api.sendMessage(id, content, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log('Failed to send user.rewarded message');
    }
  }
}
