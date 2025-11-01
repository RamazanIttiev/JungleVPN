import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🗿');
      await ctx.conversation.enter('main');
    });
  }
}
