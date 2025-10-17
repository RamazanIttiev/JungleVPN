import { BotContext } from '@bot/bot.model';
import { Api, Bot, InlineKeyboard, RawApi } from 'grammy';

export const useCommands = (bot: Bot<BotContext, Api<RawApi>>, adminID: string | undefined) => {
  bot.command('devices', async (ctx) => {
    if (!ctx.from) return;
    const telegramId = ctx.from.id;

    const clients = await ctx.services.xui.getClients(telegramId);

    if (!clients.length) {
      await ctx.reply('📱 You don’t have any active devices yet. Run /add to link one.');
      return;
    }

    await ctx.reply(`✅ You currently have *${clients.length}* linked device(s):`, {
      parse_mode: 'Markdown',
    });

    for (const client of clients) {
      const kb = new InlineKeyboard().text('🗑 Delete', `del:${client.id}`);

      await ctx.reply(`• Device ID: \`${client.id}\``, {
        parse_mode: 'Markdown',
        reply_markup: kb,
      });
    }
  });

  bot.on('message', async (ctx) => {
    const fromId = ctx.from.id;
    const admin = Number(adminID);

    if (fromId !== admin) return;

    const message = ctx.message.text;

    const userIds = await ctx.services.xui.getTgIds();

    if (!admin) await ctx.reply('Failed to send a message');

    // Prevent accidental broadcast of commands
    if (message?.startsWith('/')) return;

    for (const id of userIds) {
      if (id === admin) continue;
      try {
        await ctx.api.sendMessage(id, message || '');
      } catch (e) {
        console.error(`Failed to send to ${id}:`);
      }
    }

    await ctx.reply('✅ Message sent to all users!');
  });
};
