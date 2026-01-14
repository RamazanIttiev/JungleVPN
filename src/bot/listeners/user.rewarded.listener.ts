import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getUserRewarderContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';

@Injectable()
export class UserRewardedListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.rewarded')
  async handleUserRewardedListener(payload: { id: number; isNewUser: boolean }) {
    const { id, isNewUser } = payload;

    const user = await this.userService.getUserByTgId(id);
    const expireAt = user?.expireAt;

    try {
      await this.bot.api.sendMessage(id, getUserRewarderContent(isNewUser, expireAt!), {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log('Failed to send user.rewarded message');
    }
  }
}
