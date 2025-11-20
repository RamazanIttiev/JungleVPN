import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getTorrentWarningContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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
    try {
      await this.bot.api.sendMessage(payload.username, getTorrentWarningContent(), {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log('Failed to send torrent block message');
    }
  }
}
