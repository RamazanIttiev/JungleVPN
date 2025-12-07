import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentNotificationEvent, StripeInvoicePayload } from '@payments/payments.model';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { customerToId, subscriptionToId } from '@payments/providers/stripe/stripe.utils';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { mapToCorrectAmount, mapUSDAmountToMonthsNumber } from '@utils/utils';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
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

  validateAndProcessYookassa(
    ip: string,
    payload: {
      type: 'notification';
      event: PaymentNotificationEvent;
      object: YookassaPaymentPayload;
    },
  ) {
    const validIpAddresses = JSON.parse(process.env.PAYMENT_VALID_IP_ADDRESS || '[]') as string[];

    const normalizedIps = validIpAddresses.map((ip) => {
      if (ip.includes('/')) return ip;
      return ip.includes(':') ? `${ip}/128` : `${ip}/32`;
    });
    const matcher = new CIDRMatcher(normalizedIps);

    const ips = ip.split(',').map((i) => i.trim());

    if (process.env.NODE_ENV === 'production' && !ips.some((i) => matcher.contains(i))) {
      this.logger.warn(`Invalid YooKassa IP: ${ip}`);
      return;
    }

    this.eventEmitter.emit(payload.event, payload);
  }

  async processStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        const customerId = customerToId(invoice.customer);
        const subscriptionId = subscriptionToId(invoice.parent?.subscription_details?.subscription);

        const customer = await this.stripeProvider.retrieveCustomer(customerId);
        const monthsToAdd = mapUSDAmountToMonthsNumber(invoice.amount_paid.toString());

        const amount = mapToCorrectAmount(invoice.amount_paid);

        if (customer && !customer.deleted) {
          const payload: StripeInvoicePayload = {
            id: customer.id,
            subscriptionId,
            status: 'active',
            amount,
            customerId: customer.id,
            metadata: {
              ...customer.metadata,
              selectedPeriod: monthsToAdd.toString(),
            },
          };

          this.eventEmitter.emit('invoice.payment_succeeded', {
            type: 'notification',
            event: 'invoice.payment_succeeded',
            object: payload,
          });
        }

        break;
      }
    }
  }
}
