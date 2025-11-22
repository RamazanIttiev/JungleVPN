import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { getExpiredSubscriptionContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { mapPeriodLabelToPriceLabel, safeSendMessage } from '@utils/utils';
import { AxiosError } from 'axios';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserExpireListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly remnaService: RemnaService,
    private readonly botService: BotService,
    private readonly paymentPeriodsMsgService: PaymentPeriodsMsgService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.expires_in_24_hours')
  async listenToUser24ExpiresEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  @OnEvent('user.expires_in_72_hours')
  async listenToUser72ExpiresEvent(payload: {
    event: WebHookEvent;
    data: UserDto;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  async handleUserExpiresEvent(payload: { event: WebHookEvent; data: UserDto; timestamp: string }) {
    const keyboard = new InlineKeyboard();

    this.paymentPeriodsMsgService.periods.forEach((period) => {
      keyboard.text(mapPeriodLabelToPriceLabel(period), `payment_for_${period}`);
      keyboard.row();
    });

    keyboard.text('Главное меню 🏠', 'navigate_main');

    if (payload.data.telegramId == null) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    await safeSendMessage(
      this.bot,
      payload.data.telegramId,
      getExpiredSubscriptionContent(payload.data.expireAt),
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
