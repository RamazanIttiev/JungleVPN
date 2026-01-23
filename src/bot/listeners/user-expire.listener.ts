import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { paymentPeriods } from '@bot/utils/constants';
import { mapPeriodLabelToPriceLabel, safeSendMessage, toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { AxiosError } from 'axios';
import { differenceInCalendarDays } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserExpireListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.expired')
  async listenToUserExpiresEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  @OnEvent('user.expires_in_24_hours')
  async listenToUser24ExpiresEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  async handleUserExpiresEvent(payload: { event: WebHookEvent; data: UserDto; timestamp: string }) {
    const telegramId = payload.data.telegramId;
    if (!telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    const locale = payload.data.description || process.env.DEFAULT_LOCALE || 'ru';

    const keyboard = new InlineKeyboard();

    paymentPeriods.forEach((period) => {
      keyboard.text(
        this.localService.i18n.t(locale, mapPeriodLabelToPriceLabel(period), {
          discount: period === 'month_3' ? '-15%' : '-25%',
        }),
        `payment_for_${period}`,
      );
      keyboard.row();
    });

    keyboard.text(this.localService.i18n.t(locale, 'home-button-label'), 'navigate_main');

    const formattedDate = toDateString(payload.data.expireAt);
    const daysLeft = differenceInCalendarDays(new Date(payload.data.expireAt), Date.now());
    const daysLeftLabel = this.localService.i18n.t(locale, 'days-left-label', { daysLeft });

    const text = this.localService.i18n.t(locale, 'expired-subscription-text', {
      daysLeft,
      formattedDate,
      daysLeftLabel,
    });

    await safeSendMessage(this.bot, telegramId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
