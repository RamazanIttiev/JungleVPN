import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from '@payments/payments.service';
import { YookassaWebhookPayload } from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  logger = new Logger('WebhookController');

  constructor(
    private eventEmitter: EventEmitter2,
    private paymentsService: PaymentsService,
    private yooKassaProvider: YooKassaProvider,
  ) {}

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
    @Headers('x-forwarded-for') xForwardedFor: string,
    @Headers('x-real-ip') xRealIp: string,
    @Res() res: Response,
    @Body()
    payload: YookassaWebhookPayload,
  ) {
    res.status(200).send('OK');

    try {
      const ip = xForwardedFor || xRealIp;

      const isIPRangeValid = await this.yooKassaProvider.isIPRangeValid(ip);
      if (!isIPRangeValid) return;

      const result = await this.paymentsService.handleWebhook(payload, 'yookassa');
      const event = result.event;

      if (!result.shouldProcess || !event) {
        this.logger.warn(result.reason || 'Webhook rejected by payment service');
        return;
      }

      // ToDo Implement error reply to the user
      this.eventEmitter.emit(event, payload);
    } catch (error) {
      this.logger.error('Unexpected error processing YooKassa webhook', error);
    }
  }
}
