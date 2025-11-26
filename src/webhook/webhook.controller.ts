import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentNotificationEvent, PaymentPayload } from '@payments/payments.model';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  logger = new Logger();

  constructor(private eventEmitter: EventEmitter2) {}

  @Post('remna')
  async handleRemnaWebhook(
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
  async handleTorrentWebhook(
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

  @Post('payments')
  async handlePaymentsWebhook(
    @Headers('x-forwarded-for') ip: string,
    @Res() res: Response,
    @Body()
    payload: { type: 'notification'; event: PaymentNotificationEvent; object: PaymentPayload },
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
}
