import * as crypto from 'node:crypto';
import { BadRequestException, Body, Controller, Headers, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';

@Controller('webhook')
export class WebhookController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Post('remna')
  async handleRemnaWebhook(
    @Headers('x-remnawave-signature') signature: string,
    @Headers('x-remnawave-timestamp') timestamp: string,
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
}
