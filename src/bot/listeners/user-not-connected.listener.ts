import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { AxiosError } from 'axios';
import { differenceInHours } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserNotConnectedListener {
  bot: Bot<BotContext>;

  constructor(
    readonly botService: BotService,
    readonly localService: LocalisationService,
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
    const locale = 'en';
    const keyboard = new InlineKeyboard();
    const createdAt = new Date(payload.data.createdAt);
    const timestamp = new Date(payload.timestamp);
    const THREE_DAYS_IN_HOURS = 70;
    const diffHours = differenceInHours(timestamp, createdAt);

    keyboard.text(this.localService.i18n.t(locale, 'connect-button-label'), 'navigate_devices');
    keyboard.text(this.localService.i18n.t(locale, 'main-menu-button-label'), 'navigate_main');

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    if (diffHours > THREE_DAYS_IN_HOURS) {
      await this.remnaService.deleteUser(payload.data.uuid);
      return;
    }


    const text = this.localService.i18n.t(locale, 'user-not-connected');

    await this.bot.api.sendMessage(payload.data.telegramId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
