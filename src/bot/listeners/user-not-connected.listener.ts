import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getUserNotConnectedContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
// import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { AxiosError } from 'axios';
// import { differenceInHours } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserNotConnectedListener {
  bot: Bot<BotContext>;

  constructor(
    readonly botService: BotService,
    // readonly remnaService: RemnaService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.not_connected')
  async listenToUserNotConnectedEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    const keyboard = new InlineKeyboard();
    // const createdAt = new Date(payload.data.createdAt);
    // const timestamp = new Date(payload.timestamp);
    // const THREE_DAYS_IN_HOURS = 70;
    // const diffHours = differenceInHours(timestamp, createdAt);

    keyboard.text('Подключиться 📶', 'navigate_devices');
    keyboard.text('Главное меню 🏠', 'navigate_main');

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    // if (diffHours > THREE_DAYS_IN_HOURS) {
    //   await this.remnaService.deleteUser(payload.data.uuid);
    //   return;
    // }

    await this.bot.api.sendMessage(payload.data.telegramId, getUserNotConnectedContent(), {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
