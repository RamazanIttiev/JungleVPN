import * as crypto from 'node:crypto';
import * as process from 'node:process';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentNotificationEvent } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { customerToId } from '@payments/providers/stripe/stripe.utils';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { Response } from 'express';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Controller('webhook')
export class WebhookController {
  logger = new Logger();

  constructor(
    private eventEmitter: EventEmitter2,
    readonly paymentService: PaymentsService,
  ) {}

  @Post('remna')
  async handleRemnaEvents(
    @Headers('x-remnawave-signature') signature: string,
    @Body() payload: {
      event: WebHookEvent;
      data: UserDto;
      timestamp: string;
    },
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
    return { ok: true };
  }

  @Post('torrent')
  async handleTorrentEvents(
    @Headers('Authorization') token: string,
    @Body() payload: {
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
    return { ok: true };
  }

  @Post('payment/yookassa')
  async handleYookassaEvents(
    @Headers('x-forwarded-for') ip: string,
    @Res() res: Response,
    @Body()
    payload: {
      type: 'notification';
      event: PaymentNotificationEvent;
      object: YookassaPaymentPayload;
    },
  ) {
    res.status(200).send('OK');

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

  @Post('payment/stripe')
  async handleStripeEvents(@Res() res: Response, @Req() req: Request) {
    res.status(200).send('OK');

    const event: Stripe.Event = req.body as unknown as Stripe.Event;
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        this.logger.log(`subscription for ${subscription.id} was successful!`);

        const customer = subscription.customer;
        const id = customerToId(customer);

        if (id) {
          await this.paymentService.updatePayment(id, {
            status: subscription.status,
            stripeCustomerId: id,
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }
    }
  }
}
