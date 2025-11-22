import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getTorrentWarningContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { safeSendMessage } from '@utils/utils';
import { Bot } from 'grammy';

@Injectable()
export class TorrentListener {
  bot: Bot<BotContext>;

  constructor(private readonly botService: BotService) {
    this.bot = this.botService.bot;
  }

  @OnEvent('torrent.event')
  async handleTorrentEvent(payload: {
    username: string;
    ip: string;
    server: string;
    action: string;
    duration: string;
    timestamp: string;
  }) {
    await safeSendMessage(this.bot, Number(payload.username), getTorrentWarningContent(), {
      parse_mode: 'HTML',
    });
  }
}
