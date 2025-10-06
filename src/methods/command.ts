import { Api, Bot, Context, InlineKeyboard, RawApi } from 'grammy';
import { XuiService } from '../modules/xui/xui.service';

export const useCommands = (
  bot: Bot<Context, Api<RawApi>>,
  xuiService: XuiService,
  adminID: string | undefined,
) => {
  bot.command('devices', async (ctx) => {
    if (!ctx.from) return;
    const telegramId = ctx.from.id;

    const clients = await xuiService.getClients(telegramId);

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

    const userIds = await xuiService.getTgIds();

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
