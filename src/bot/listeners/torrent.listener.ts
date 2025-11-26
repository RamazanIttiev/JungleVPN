import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Bot } from 'grammy';

@Injectable()
export class TorrentListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly localService: LocalisationService,
  ) {
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
    const locale = 'en';
    const text = this.localService.i18n.t(locale, 'torrent-warning-text');

    await this.bot.api.sendMessage(payload.username, text, {
      parse_mode: 'HTML',
    });
  }
}
