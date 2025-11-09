import * as crypto from 'node:crypto';
import { BadRequestException, Body, Controller, Headers, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { User } from '@user/user.model';

@Controller('webhook')
export class WebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Post('remna')
  async handleWebhook(
    @Headers('x-remnawave-signature') signature: string,
    @Headers('x-remnawave-timestamp') timestamp: string,
    @Body() payload: {
      event: WebHookEvent;
      data: User;
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
}
