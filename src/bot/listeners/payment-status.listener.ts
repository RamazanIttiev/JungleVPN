import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PaymentMetadata,
  PaymentNotificationEvent,
  StripePaymentPayload,
} from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
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

  @OnEvent('customer.subscription.created')
  async handleCreatedStripeSubscription(payload: {
    type: 'notification';
    event: 'customer.subscription.created';
    object: StripePaymentPayload;
  }) {
    const data = payload.object;
    const telegramId = Number(data.metadata.telegramId);

    if (!telegramId) {
      this.logger.warn('No telegramId found in payment metadata or via fallback');
      return;
    }

    const user = await this.loadUser(telegramId);
    if (!user || !user.telegramId) {
      this.logger.warn('No user found');
      return;
    }

    const isSucceeded = data.status === 'active';

    if (isSucceeded) {
      await this.paymentsService.updatePayment(data.id, {
        status: data.status,
        stripeSubscriptionId: data.subscriptionId,
        paidAt: new Date(),
      });
      await this.updateUserExpiryDate(user, data.metadata.selectedPeriod);
      await this.sendSuccessMessage(user.telegramId);
    }
  }

  @OnEvent('payment.succeeded')
  async handleSuccessfulPayment(payload: {
    type: 'notification';
    event: PaymentNotificationEvent;
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

    await this.paymentsService.updatePayment(payment.id, {
      status,
      paidAt: new Date(),
    });

    await this.updateUserExpiryDate(user, metadata.selectedPeriod);
    await this.cleanUpTelegramMessage(user.telegramId, metadata.telegramMessageId);
    await this.sendSuccessMessage(user.telegramId);
  }

  private async loadUser(telegramId: number) {
    const user = await this.remnaService.getUserByTgId(telegramId);
    return user?.telegramId ? user : null;
  }

  private async updateUserExpiryDate(user: UserDto, selectedPeriod: number) {
    const { uuid, expireAt } = user;

    const newExpireAt = add(expireAt, {
      months: selectedPeriod,
    }).toISOString();

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
    const stickerId = process.env.PAYMENT_SUCCESS_STICKER;

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
}
