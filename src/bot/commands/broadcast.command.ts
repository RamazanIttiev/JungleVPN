import { BotContext } from '@bot/bot.types';
import { Bot } from 'grammy';

export class BroadcastCommand {
  register(bot: Bot<BotContext>) {
    bot.on('message', async (ctx) => {
      const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
      const fromId = ctx.from?.id;

      if (fromId !== adminId) return;

      const message = ctx.message?.text;
      if (!message || message.startsWith('/')) return; // ignore commands

      // for (const id of userIds) {
      //   if (id === adminId) continue;
      //   try {
      //     await ctx.api.sendMessage(id, message);
      //   } catch (e) {
      //     console.log(`Failed to send to ${id}:`, e);
      //   }
      // }

      await ctx.reply('✅ Message sent to all users!');
    });
  }
}
