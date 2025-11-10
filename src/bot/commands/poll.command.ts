import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class PollCommand {
  private readonly logger = new Logger(PollCommand.name);
  private readonly adminId = Number(process.env.TELEGRAM_ADMIN_ID);

  constructor(private readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.command('poll', async (ctx) => {
      // Restrict access
      if (ctx.from?.id !== this.adminId) {
        await ctx.reply('🚫 You are not allowed to create polls.');
        return;
      }

      const text = ctx.message?.text?.trim();
      const lines = text?.split('\n').slice(1); // skip /poll

      if (!lines || lines.length < 3) {
        await ctx.reply('❗ Format: \n/poll\nQuestion\nOption 1\nOption 2\n...');
        return;
      }

      const [question, ...options] = lines;
      this.logger.log(`📊 Creating poll: "${question}" with options: ${options.join(', ')}`);

      await ctx.reply(
        `📊 Creating poll:\n\n<b>${question}</b>\n${options.map((o) => `• ${o}`).join('\n')}`,
        { parse_mode: 'HTML' },
      );

      const users = await this.remnaService.getAllUsers();

      await ctx.api.sendPoll(575800239, question, options, {
        is_anonymous: false,
      });
      for (const { telegramId } of users) {
        try {
          console.log();
        } catch (error) {
          this.logger.warn(`⚠️ Failed to send poll to ${telegramId}`);
        }
      }

      await ctx.reply('✅ Poll sent to all users!');
    });
  }
}
