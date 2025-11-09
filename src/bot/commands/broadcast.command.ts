import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class BroadcastCommand {
  constructor(readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.on('message', async (ctx) => {
      const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
      const fromId = ctx.from.id;
      if (fromId !== adminId) return;

      const message = ctx.message?.text;
      const users = await this.remnaService.getAllUsers();

      if (!message || message.startsWith('/')) return;

      for (const { telegramId } of users) {
        if (telegramId === adminId) continue;
        try {
          console.log(`Sending to ${telegramId}: ${message}`);
          // await ctx.api.sendMessage(telegramId, message);
        } catch (e) {
          console.log(`Failed to send to ${telegramId}:`, e);
        }
      }

      await ctx.reply('✅ Message sent to all users!');
    });
  }
}
