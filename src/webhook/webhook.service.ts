import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeInvoicePayload } from '@payments/payments.model';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { customerToId, subscriptionToId } from '@payments/providers/stripe/stripe.utils';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { mapEURAmountToMonthsNumber, mapToCorrectAmount } from '@utils/utils';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly stripeProvider: StripeProvider,
  ) {}

  validateAndProcessRemna(
    signature: string,
    payload: { event: WebHookEvent; data: UserDto; timestamp: string },
  ) {
    const secret = process.env.REMNA_WEBHOOK_SECRET || '';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid signature');
    }

    this.eventEmitter.emit(payload.event, payload);
  }

  validateAndProcessTorrent(
    token: string,
    payload: {
      username: string;
      ip: string;
      server: string;
      action: string;
      duration: string;
      timestamp: string;
    },
  ) {
    const expectedToken = process.env.REMNA_TORRENT_WEBHOOK_TOKEN || '';
    if (token !== expectedToken) {
      throw new BadRequestException('Invalid token');
    }

    this.eventEmitter.emit('torrent.event', payload);
  }

  async processStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await this.handleInvoiceEvent(event);
        break;
    }
  }

  private async handleInvoiceEvent(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = customerToId(invoice.customer);
    const subscriptionId = subscriptionToId(invoice.parent?.subscription_details?.subscription);

    const customer = await this.stripeProvider.retrieveCustomer(customerId);

    const isSuccess = event.type === 'invoice.payment_succeeded';
    const amountVal = isSuccess ? invoice.amount_paid : invoice.amount_due;
    const paidAt = isSuccess ? new Date() : null;
    const amount = mapToCorrectAmount(amountVal);

    const fallbackStatus = isSuccess ? 'paid' : 'open';

    const monthsToAdd = mapEURAmountToMonthsNumber(amountVal.toString());

    if (customer && !customer.deleted) {
      const payload: StripeInvoicePayload = {
        id: invoice.id,
        stripeSubscriptionId: subscriptionId,
        status: invoice.status || fallbackStatus,
        amount,
        stripeCustomerId: customer.id,
        invoiceUrl: invoice.hosted_invoice_url || null,
        metadata: {
          ...customer.metadata,
          telegramId: customer.metadata.telegramId,
          selectedPeriod: monthsToAdd.toString(),
        },
        userId: customer.metadata.telegramId,
        provider: 'stripe',
        currency: 'EUR',
        paidAt,
        url: null,
      };

      this.eventEmitter.emit(event.type, {
        type: 'notification',
        event: event.type,
        object: payload,
      });
    }
  }
}
