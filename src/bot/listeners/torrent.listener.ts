import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RemnaService } from '@remna/remna.service';
import { UserLocale } from '@user/user.model';
import { safeSendMessage } from '@utils/utils';
import { Bot } from 'grammy';

@Injectable()
export class TorrentListener {
  bot: Bot<BotContext>;

  constructor(
    private readonly botService: BotService,
    private readonly remnaService: RemnaService,
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
    const user = await this.remnaService.getUserByTgId(Number(payload.username));
    const locale = (user?.description || process.env.DEFAULT_LOCALE || 'en') as UserLocale;
    const text = this.localService.i18n.t(locale, 'torrent-warning-text');

    await safeSendMessage(this.bot, Number(payload.username), text, {
      parse_mode: 'HTML',
    });
  }
}
