import { Menu } from '@grammyjs/menu';
import { XuiService } from '../modules/xui/xui.service';
import { getConnectionsContent, getConnectionsPage, getMainContent } from '../utils/menu.buttons';

const escapeHtml = (s: string) => {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const executeMenu = (xuiService: XuiService) => {
  const mainMenu = new Menu('main-menu').text('Подключения 📶', async (ctx) => {
    ctx.menu.nav('connections-menu');

    await ctx.editMessageText(getConnectionsPage(), {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    });
  });

  const connectionsMenu = new Menu('connections-menu')
    .text('🍏 IOS/Android 🤖', async (ctx) => {
      await ctx.answerCallbackQuery();

      const telegramId = String(ctx.from.id);

      const url = await xuiService.getOrIssueSubUrl(telegramId, 'mobile');

      const content = getConnectionsContent({ label: 'Mobile', url: escapeHtml(url) });

      await ctx.deleteMessage();
      await ctx.reply(content, {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: mainMenu,
      });
    })
    .text('Macbook 💻', async (ctx) => {
      await ctx.answerCallbackQuery();

      const telegramId = String(ctx.from.id);

      const url = await xuiService.getOrIssueSubUrl(telegramId, 'laptop');

      const content = getConnectionsContent({ label: 'Macbook', url: escapeHtml(url) });

      await ctx.deleteMessage();
      await ctx.reply(content, {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: mainMenu,
      });
    })
    .row()
    .text('⬅ Назад', async (ctx) => {
      const username = ctx.from?.first_name || ctx.from?.username;

      ctx.menu.back();
      await ctx.editMessageText(getMainContent({ username }), { parse_mode: 'HTML' });
    });

  mainMenu.register(connectionsMenu);

  return mainMenu;
};
