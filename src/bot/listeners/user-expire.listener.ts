import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { mapDaysLeftLabel, mapPeriodLabelToPriceLabel, toDateString } from '@utils/utils';
import { AxiosError } from 'axios';
import { differenceInCalendarDays } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserExpireListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly localService: LocalisationService,
    private readonly paymentPeriodsMsgService: PaymentPeriodsMsgService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.expires_in_24_hours')
  async listenToUser24ExpiresEvent(payload: {
    event: WebHookEvent;
    data: Pick<UserDto, 'telegramId' | 'expireAt'>;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  @OnEvent('user.expires_in_72_hours')
  async listenToUser72ExpiresEvent(payload: {
    event: WebHookEvent;
    data: Pick<UserDto, 'telegramId' | 'expireAt'>;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  async handleUserExpiresEvent(payload: {
    event: WebHookEvent;
    data: Pick<UserDto, 'telegramId' | 'expireAt'>;
    timestamp: string;
  }) {
    const keyboard = new InlineKeyboard();

    this.paymentPeriodsMsgService.periods.forEach((period) => {
      keyboard.text(mapPeriodLabelToPriceLabel(period), `payment_for_${period}`);
      keyboard.row();
    });

    keyboard.text('Главное меню', 'navigate_main');

    if (payload.data.telegramId == null) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    const locale = 'en';
    const formattedDate = toDateString(payload.data.expireAt);
    const daysLeft = differenceInCalendarDays(new Date(payload.data.expireAt), Date.now());
    const daysLeftLabel = mapDaysLeftLabel(daysLeft);

    const text = this.localService.i18n.t(locale, 'expired-subscription-text', {
      daysLeft,
      formattedDate,
      daysLeftLabel,
    });

    await this.bot.api.sendMessage(payload.data.telegramId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
