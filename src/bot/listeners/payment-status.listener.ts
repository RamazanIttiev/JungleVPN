import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PaymentMetadata,
  PaymentNotificationEvent,
  StripeInvoicePayload,
} from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { safeSendMessage, toDateString } from '@utils/utils';
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
    private readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('invoice.payment_succeeded')
  async handleInvoicePaymentSucceeded(payload: {
    type: 'notification';
    event: 'invoice.payment_succeeded';
    object: StripeInvoicePayload;
  }) {
    const data = payload.object;
    const metadata = data.metadata;

    const telegramId = Number(metadata.telegramId);

    if (!telegramId) {
      this.logger.warn('No telegramId found in payment metadata or via fallback');
      return;
    }

    const user = await this.loadUser(telegramId);
    if (!user || !user.telegramId) {
      this.logger.warn('No user found');
      return;
    }

    const payment = await this.paymentsService.findOneByStripeCustomerId(data.customerId);
    if (payment) {
      await this.paymentsService.updatePayment(payment.id, {
        status: data.status,
        amount: data.amount,
        paidAt: new Date(),
      });
    } else {
      this.logger.warn('No payment found by findOneByStripeCustomerId');
    }

    const updatedUser = await this.updateUserExpiryDate(user, metadata.selectedPeriod);
    await this.cleanUpTelegramMessage(user.telegramId, metadata.telegramMessageId);
    await this.sendSuccessStripePaymentMessage(updatedUser);
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

  private async updateUserExpiryDate(
    user: UserDto,
    selectedPeriod: number | string,
  ): Promise<UserDto> {
    const { uuid, expireAt } = user;

    const newExpireAt = add(expireAt, {
      months: Number(selectedPeriod),
    }).toISOString();

    return await this.remnaService.updateUser({
      uuid,
      expireAt: newExpireAt,
    });
  }

  private async cleanUpTelegramMessage(telegramId: number, messageId?: number | string) {
    if (messageId) {
      try {
        await this.bot.api.deleteMessage(telegramId, +messageId);
      } catch (err) {
        console.log('Failed to delete Telegram message:', err);
      }
    } else {
      this.logger.warn('No messageId in cleanUpTelegramMessage');
    }
  }

  private async sendSuccessMessage(telegramId: number) {
    const locale = 'en';
    const i18n = this.localService.i18n;

    const stickerId = process.env.SUCCESS_STICKER;

    const successMenu = new InlineKeyboard()
      .text(i18n.t(locale, 'connect-button-label'), 'paymentSuccess')
      .row()
      .text(i18n.t(locale, 'home-button-label'), 'navigate_main');

    if (stickerId) {
      return this.bot.api.sendSticker(telegramId, stickerId, {
        reply_markup: successMenu,
      });
    }

    await safeSendMessage(this.bot, telegramId, i18n.t(locale, 'payment-success'), {
      reply_markup: successMenu,
    });
  }

  private async sendSuccessStripePaymentMessage(user: UserDto) {
    const locale = 'en';
    const i18n = this.localService.i18n;

    if (!user.telegramId) return;

    const expireAt = toDateString(user.expireAt);

    const text = this.localService.i18n.t(locale, 'invoice-payment-success-text', {
      expireAt,
    });

    const successMenu = new InlineKeyboard()
      .text(i18n.t(locale, 'profile-button-label'), 'navigate_profile')
      .row()
      .text(i18n.t(locale, 'home-button-label'), 'navigate_main');

    await safeSendMessage(this.bot, user.telegramId, text, {
      reply_markup: successMenu,
      parse_mode: 'HTML',
    });
  }
}
