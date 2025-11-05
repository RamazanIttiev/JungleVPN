import { BotService } from '@bot/bot.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

@Injectable()
export abstract class Base {
  protected readonly botService: BotService;
  protected readonly remnaService: RemnaService;

  protected constructor(botService: BotService, remnaService: RemnaService) {
    this.botService = botService;
    this.remnaService = remnaService;
  }

  protected async render(ctx: Context, text: string, reply_markup: any) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    } catch (error) {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    }
  }

  protected isExpired(expireAt?: string) {
    if (!expireAt) return true;
    return Date.now() > new Date(expireAt).getTime();
  }
}
