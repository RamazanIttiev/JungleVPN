import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { safeSendMessage } from '@utils/utils';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class BroadcastCommand {
  logger = new Logger('BroadcastCommand');
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

      const BATCH_SIZE = 25; // Safe limit under 30/sec
      const DELAY_MS = 1050; // Slightly over 1s to be safe

      let successCount = 0;
      let failureCount = 0;

      const validUsers = users.filter((u) => u.telegramId && u.telegramId !== adminId);
      const totalUsers = validUsers.length;

      await ctx.reply(`🚀 Starting broadcast to ${totalUsers} users...`);

      for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
        this.logger.log(`Processing batch ${i} to ${i + BATCH_SIZE}`);
        const batch = validUsers.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (user) => {
          try {
            await safeSendMessage(bot, user.telegramId || 0, textToSend, {
              reply_markup: new InlineKeyboard().text('Подключиться 📶', 'navigate_devices'),
            });
            successCount++;
          } catch (e) {
            const error = e as Error;
            this.logger.error(`Failed to send to ${user.telegramId}: ${error.message}`);
            failureCount++;
          }
        });

        await Promise.allSettled(promises);

        if (i + BATCH_SIZE < totalUsers) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }

      await ctx.reply(ctx.t('broadcast-sent-success'));
    });
  }
}
