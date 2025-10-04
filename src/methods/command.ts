import { Api, Bot, Context, InlineKeyboard, RawApi } from 'grammy';
import { XuiService } from '../modules/xui/xui.service';

export const executeCommands = (bot: Bot<Context, Api<RawApi>>, xuiService: XuiService) => {
  bot.command('devices', async (ctx) => {
    if (!ctx.from) return;
    const telegramId = String(ctx.from.id);

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

  bot.command('add', async (ctx) => {
    if (!ctx.from) return;
    const telegramId = String(ctx.from.id);

    const subUrl = await xuiService.addClient(telegramId);

    function escapeHtml(s: string) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    await ctx.reply(`<code>${escapeHtml(subUrl)}</code>`, {
      parse_mode: 'HTML',
    });
  });
};
