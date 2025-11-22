import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getUserNotConnectedContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { safeSendMessage } from '@utils/utils';
import { AxiosError } from 'axios';
import { differenceInHours } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserNotConnectedListener {
  bot: Bot<BotContext>;

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
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
    const createdAt = new Date(payload.data.createdAt);
    const timestamp = new Date(payload.timestamp);
    const SEVEN_DAYS_IN_HOURS = Number(process.env.SEVEN_DAYS_IN_HOURS);
    const diffHours = differenceInHours(timestamp, createdAt);

    keyboard.text('Подключиться 📶', 'navigate_devices');
    keyboard.text('Главное меню 🏠', 'navigate_main');

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    if (diffHours >= SEVEN_DAYS_IN_HOURS) {
      await this.remnaService.deleteUser(payload.data.uuid);
      return;
    }

    await safeSendMessage(
      this.bot,
      payload.data.telegramId,
      getUserNotConnectedContent(),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
      async () => {
        await this.remnaService.deleteUser(payload.data.uuid);
      },
    );
  }
}
