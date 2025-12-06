import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentNotificationEvent, StripePaymentPayload } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { customerToId } from '@payments/providers/stripe/stripe.utils';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentService: PaymentsService,
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
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        this.logger.log(`subscription for ${subscription.id} was successful!`);

        const customerId = customerToId(subscription.customer);
        const payment = await this.paymentService.findOneByStripeCustomerId(customerId);

        const payload: StripePaymentPayload = {
          id: customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
          customer: subscription.customer as string,
          metadata: {
            telegramId: payment?.userId,
            selectedPeriod: subscription.items.data[0].plan.interval_count,
          },
        };

        this.eventEmitter.emit('customer.subscription.created', {
          type: 'notification',
          event: 'customer.subscription.created',
          object: payload,
        });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(subscription.items.data[0].plan.interval_count);
      }
    }
  }
}
