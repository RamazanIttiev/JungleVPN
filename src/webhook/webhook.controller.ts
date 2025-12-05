import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentNotificationEvent } from '@payments/payments.model';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { Response } from 'express';
import Stripe from 'stripe';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

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
    this.webhookService.validateAndProcessYookassa(ip, payload);
  }

  @Post('payment/stripe')
  async handleStripeEvents(@Res() res: Response, @Req() req: Request) {
    res.status(200).send('OK');
    const event: Stripe.Event = req.body as unknown as Stripe.Event;
    await this.webhookService.processStripeEvent(event);
  }
}
