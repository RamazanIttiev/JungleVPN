import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { getExpiredSubscriptionContent } from '@bot/utils/templates';
import { mapPeriodLabelToPriceLabel } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { User } from '@user/user.model';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserExpireListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly paymentPeriodsMsgService: PaymentPeriodsMsgService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.expires_in_24_hours')
  async listenToUser24ExpiresEvent(payload: {
    event: WebHookEvent;
    data: User;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  @OnEvent('user.expires_in_72_hours')
  async listenToUser72ExpiresEvent(payload: {
    event: WebHookEvent;
    data: User;
    timestamp: string;
  }) {
    await this.handleUserExpiresEvent(payload);
  }

  async handleUserExpiresEvent(payload: { event: WebHookEvent; data: User; timestamp: string }) {
    const keyboard = new InlineKeyboard();

    this.paymentPeriodsMsgService.periods.forEach((period) => {
      keyboard.text(mapPeriodLabelToPriceLabel(period), `payment_for_${period}`);
      keyboard.row();
    });

    keyboard.text('Главное меню', 'navigate_main');

    await this.bot.api.sendMessage(
      payload.data.telegramId,
      getExpiredSubscriptionContent(payload.data.expireAt),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      },
    );
  }
}
