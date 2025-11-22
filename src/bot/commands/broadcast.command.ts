import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { safeSendMessage } from '@utils/utils';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class BroadcastCommand {
  constructor(readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.command('message', async (ctx) => {
      const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
      const fromId = ctx.from?.id;
      if (fromId !== adminId) return;

      const message = ctx.message?.text;
      const users = await this.remnaService.getAllUsers();

      const textToSend = message?.split('\n').slice(1).join('\n');

      if (!message || message.startsWith('/start')) return;
      if (!textToSend || textToSend.startsWith('/start')) return;

      for (const { telegramId, uuid } of users) {
        if (!telegramId) continue;
        if (telegramId === adminId) continue;

        await safeSendMessage(
          bot,
          telegramId,
          textToSend,
          {
            reply_markup: new InlineKeyboard().text('Подключиться 📶', 'navigate_devices'),
          },
          async () => {
            await this.remnaService.deleteUser(uuid);
          },
        );
      }

      await ctx.reply('✅ Message sent to all users!');
    });
  }
}
