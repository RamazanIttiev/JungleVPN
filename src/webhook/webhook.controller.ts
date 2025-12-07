import { Body, Controller, Headers, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { PaymentNotificationEvent } from '@payments/payments.model';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YookassaPaymentPayload } from '@payments/providers/yookassa.provider';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly stripeProvider: StripeProvider,
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
