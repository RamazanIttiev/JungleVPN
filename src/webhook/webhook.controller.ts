import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Body, Controller, Headers, Logger,RawBodyRequest, Req, Post, Res } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from '@payments/payments.service';
import { YookassaWebhookPayload } from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { PaymentNotificationEvent } from '@payments/payments.model';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  logger = new Logger('WebhookController');

  constructor(
    private readonly webhookService: WebhookService,
    private readonly paymentsService: PaymentsService,
    private readonly stripeProvider: StripeProvider,
    private readonly yooKassaProvider: YooKassaProvider,
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
    this.webhookService.validateAndProcessRemna(signature, payload);
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
    this.webhookService.validateAndProcessTorrent(token, payload);
    return { ok: true };
  }

  @Post('payment/yookassa')
  async handleYookassaEvents(
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

  @Post('payment/stripe')
  async handleStripeEvents(
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const body = req.rawBody;

    if (!body) return res.status(400).send({});
    try {
      const event = this.stripeProvider.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );

      await this.webhookService.processStripeEvent(event);
      res.status(200).send('OK');
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err}`);
    }
  }
}
