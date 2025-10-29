import { BotContext } from '@bot/bot.model';
import { Api, Bot, RawApi } from 'grammy';

export const useCommands = (bot: Bot<BotContext, Api<RawApi>>, adminID: string | undefined) => {
  bot.on('message', async (ctx) => {
    const fromId = ctx.from.id;
    const admin = Number(adminID);

    if (fromId !== admin) return;

    const message = ctx.message.text;

    const userIds = await ctx.services.users.getAllUserIds();

    if (!admin) await ctx.reply('Failed to send a message');
    // Prevent accidental broadcast of commands
    if (message?.startsWith('/')) return;

    for (const id of userIds) {
      if (id === admin) continue;
      try {
        await ctx.api.sendMessage(id, message || '');
      } catch (e) {
        console.log(`Failed to send to ${id}:`);
      }
    }

    await ctx.reply('✅ Message sent to all users!');
  });
};
