import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { safeSendMessage } from '@utils/utils';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class AlertCommand {
  logger = new Logger('AlertCommand');
  constructor(readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.command('alert', async (ctx) => {
      const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
      const fromId = ctx.from?.id;
      if (fromId !== adminId) return;

      const message = ctx.message?.text;
      const users = [
        311939523, 1217592114, 5246307552, 1972279006, 311939523, 5273688142, 5533815022,
        1358860529, 561336819, 642645417, 359930545, 216101214, 830080661, 256393530, 975525579,
        334377485,
      ];

      const textToSend = message?.split('\n').slice(1).join('\n');

      if (!message || message.startsWith('/start')) return;
      if (!textToSend || textToSend.startsWith('/start')) return;

      const BATCH_SIZE = 25; // Safe limit under 30/sec
      const DELAY_MS = 1050; // Slightly over 1s to be safe

      let successCount = 0;
      let failureCount = 0;

      const validUsers = users.filter((telegramId) => telegramId && telegramId !== adminId);
      const totalUsers = validUsers.length;

      await ctx.reply(`🚀 Starting broadcast to ${totalUsers} users...`);

      for (let i = 0; i < totalUsers; i += BATCH_SIZE) {
        this.logger.log(`Processing batch ${i} to ${i + BATCH_SIZE}`);
        const batch = validUsers.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (telegramId) => {
          const newUser = await this.remnaService.createUser({
            username: telegramId.toString(),
            telegramId,
          });
          try {
            await safeSendMessage(bot, telegramId || 0, textToSend);

            await safeSendMessage(bot, telegramId || 0, newUser.subscriptionUrl, {
              reply_markup: new InlineKeyboard().text('Подключиться 📶', 'navigate_devices'),
            });
            successCount++;
          } catch (e) {
            failureCount++;
          }
        });

        await Promise.allSettled(promises);

        if (i + BATCH_SIZE < totalUsers) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }

      await ctx.reply(
        `✅ Broadcast complete!\n\nSuccess: ${successCount}\nFailed: ${failureCount}`,
      );
    });
  }
}
