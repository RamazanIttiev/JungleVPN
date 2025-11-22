import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getUserNotConnected24Content, getUserNotConnected72Content } from '@bot/utils/templates';
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
    const keyboard = new InlineKeyboard()
      .text('Подключиться 📶', 'navigate_devices')
      .text('Главное меню 🏠', 'navigate_main')
      .url('Нужна помощь?', process.env.SUPPORT_URL || 'https://t.me/JungleVPN_support');

    const createdAt = new Date(payload.data.createdAt);
    const timestamp = new Date(payload.timestamp);
    const diffHours = differenceInHours(timestamp, createdAt);

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    if (diffHours >= Number(process.env.SEVEN_DAYS_IN_HOURS)) {
      await this.remnaService.deleteUser(payload.data.uuid);
      return;
    }

    if (diffHours >= Number(process.env.TREE_DAYS_IN_HOURS)) {
      await this.handleThreeDays(payload.data.telegramId, payload.data.uuid, keyboard);
      return;
    }

    await this.handleInitial(payload.data.telegramId, payload.data.uuid, keyboard);
  }

  async handleThreeDays(telegramId: number, uuid: string, keyboard: InlineKeyboard) {
    await safeSendMessage(
      this.bot,
      telegramId,
      getUserNotConnected72Content(),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
      async () => {
        await this.remnaService.deleteUser(uuid);
      },
    );
  }

  async handleInitial(telegramId: number, uuid: string, keyboard: InlineKeyboard) {
    await safeSendMessage(
      this.bot,
      telegramId,
      getUserNotConnected24Content(),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
      async () => {
        await this.remnaService.deleteUser(uuid);
      },
    );
  }
}
