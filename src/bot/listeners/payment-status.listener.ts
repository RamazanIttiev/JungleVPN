import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentMetadata } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import {
  YookassaNotificationEvent,
  YookassaPaymentPayload,
} from '@payments/providers/yookassa/yookassa.model';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { safeSendMessage } from '@utils/utils';
import { add } from 'date-fns';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class PaymentStatusListener {
  bot: Bot<BotContext>;
  logger = new Logger();

  constructor(
    private readonly botService: BotService,
    private readonly paymentsService: PaymentsService,
    private readonly remnaService: RemnaService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('payment.succeeded')
  async handleSuccessfulPayment(payload: {
    type: 'notification';
    event: YookassaNotificationEvent;
    object: YookassaPaymentPayload;
  }) {
    const payment = payload.object;

    if (!payment.metadata || !payment.metadata.telegramId) {
      this.logger.warn('No metadata');
      return;
    }

    const metadata: PaymentMetadata = {
      telegramId: Number(payment.metadata.telegramId),
      selectedPeriod: Number(payment.metadata.selectedPeriod),
      telegramMessageId: Number(payment.metadata.telegramMessageId),
    };

    const user = await this.loadUser(metadata.telegramId);
    if (!user || !user.telegramId) {
      this.logger.warn('No user found');
      return;
    }

    const { status } = payment;

    if (status !== 'succeeded') {
      return this.notifyPendingPayment(user.telegramId);
    }

    await this.processSuccessfulPayment(payment.id, metadata, user);
    await this.cleanUpTelegramMessage(user.telegramId, metadata.telegramMessageId);
    await this.sendSuccessMessage(user.telegramId);
  }

  private async loadUser(telegramId: number) {
    const user = await this.remnaService.getUserByTgId(telegramId);
    return user?.telegramId ? user : null;
  }

  private async processSuccessfulPayment(
    paymentId: string,
    metadata: PaymentMetadata,
    user: UserDto,
  ) {
    const { uuid, expireAt } = user;

    const newExpireAt = add(expireAt, {
      months: metadata.selectedPeriod,
    }).toISOString();

    await this.paymentsService.updatePayment(paymentId, {
      status: 'succeeded',
      paidAt: new Date(),
    });

    await this.remnaService.updateUser({
      uuid,
      expireAt: newExpireAt,
    });
  }

  private async cleanUpTelegramMessage(telegramId: number, messageId?: number) {
    if (messageId) {
      try {
        await this.bot.api.deleteMessage(telegramId, messageId);
      } catch (err) {
        console.log('Failed to delete Telegram message:', err);
      }
    } else {
      this.logger.warn('No messageId in cleanUpTelegramMessage');
    }
  }

  private async sendSuccessMessage(telegramId: number) {
    const stickerId = process.env.SUCCESS_STICKER;

    const successMenu = new InlineKeyboard()
      .text('Подключиться 📶', 'paymentSuccess')
      .row()
      .text('Главное меню 🏠', 'navigate_main');

    if (stickerId) {
      return this.bot.api.sendSticker(telegramId, stickerId, {
        reply_markup: successMenu,
      });
    }

    await safeSendMessage(this.bot, telegramId, '✅ Оплата прошла успешно!', {
      reply_markup: successMenu,
    });
  }

  private async notifyPendingPayment(telegramId: number) {
    await safeSendMessage(this.bot, telegramId, 'Оплата еще не прошла!');
  }
}
