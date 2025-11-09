import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class PollCommand {
  private readonly adminId = Number(process.env.TELEGRAM_ADMIN_ID);

  constructor(readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.command('poll', async (ctx) => {
      if (ctx.from?.id !== this.adminId) {
        await ctx.reply('🚫 You are not allowed to create polls.');
        return;
      }

      const text = ctx.message?.text?.trim();
      if (!text) {
        await ctx.reply('❗ Please provide poll text and options.');
        return;
      }

      // Split message by line breaks
      const lines = text.split('\n').slice(1); // skip `/poll`
      if (lines.length < 3) {
        await ctx.reply('❗ Poll must include at least a question and 2 options.');
        return;
      }

      const [question, ...options] = lines;

      await ctx.reply(
        `📊 Creating poll:\n\n<b>${question}</b>\n${options.map((o) => `• ${o}`).join('\n')}`,
        {
          parse_mode: 'HTML',
        },
      );

      const users = await this.remnaService.getAllUsers();

      await ctx.api.sendPoll(5986698166, question, options, { is_anonymous: false });
      // for (const { telegramId } of users) {
      //   try {
      //   } catch (error) {
      //     console.error(`Failed to send poll to ${telegramId}:`, error);
      //     await ctx.reply(`❌ Failed to send poll`);
      //     return;
      //   }
      // }

      await ctx.reply('✅ Poll sent to all users!');
    });
  }
}
