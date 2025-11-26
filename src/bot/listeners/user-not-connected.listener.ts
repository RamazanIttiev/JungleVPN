import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { USER_LOCALE, UserDto } from '@user/user.model';
import { safeSendMessage } from '@utils/utils';
import { AxiosError } from 'axios';
import { differenceInHours } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserNotConnectedListener {
  bot: Bot<BotContext>;

  constructor(
    readonly botService: BotService,
    readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.not_connected')
  async listenToUserNotConnectedEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    const locale = (payload.data.description || process.env.DEFAULT_LOCALE || 'ru') as USER_LOCALE;
    const keyboard = new InlineKeyboard()
      .text('Подключиться 📶', 'navigate_devices')
      .text('Главное меню 🏠', 'navigate_main')
      .url('Нужна помощь?', process.env.SUPPORT_URL || 'https://t.me/JungleVPN_support');
    const createdAt = new Date(payload.data.createdAt);
    const timestamp = new Date(payload.timestamp);
    const diffHours = differenceInHours(timestamp, createdAt);

    keyboard.text(this.localService.i18n.t(locale, 'connect-button-label'), 'navigate_devices');
    keyboard.text(this.localService.i18n.t(locale, 'home-button-label'), 'navigate_main');

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    if (diffHours >= Number(process.env.TREE_DAYS_IN_HOURS)) {
      await this.handleThreeDays(payload.data.telegramId, locale, keyboard);
      return;
    }

    await this.handleInitial(payload.data.telegramId, locale, keyboard);
  }

  async handleThreeDays(telegramId: number, locale: USER_LOCALE, keyboard: InlineKeyboard) {
    const text = this.localService.i18n.t(locale, 'user-not-connected-72');

    await safeSendMessage(this.bot, telegramId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }

  async handleInitial(telegramId: number, locale: USER_LOCALE, keyboard: InlineKeyboard) {
    const text = this.localService.i18n.t(locale, 'user-not-connected-24');

    await safeSendMessage(this.bot, telegramId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
