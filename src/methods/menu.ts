import { Menu } from '@grammyjs/menu';
import { XuiService } from '../modules/xui/xui.service';
import { getConnectionsContent, getConnectionsPage, getMainContent } from '../utils/menu.buttons';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

type DeviceType = 'mobile' | 'laptop';

export const executeMenu = (xuiService: XuiService) => {
  const goToConnectionsPage = async (ctx: any) => {
    ctx.menu.nav('connections-menu');
    await ctx.editMessageText(getConnectionsPage(), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  };

  const sendConnectionMessage = async (
    ctx: any,
    device: DeviceType,
    url: string,
    replyMenu: Menu,
  ) => {
    const content = getConnectionsContent({
      device,
      url: escapeHtml(url),
    });

    await ctx.deleteMessage();
    await ctx.reply(content, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: replyMenu,
    });
  };

  const createUpdateMenu = (device: DeviceType): Menu => {
    const menuId = `update-${device}-sub-menu`;

    return new Menu(menuId)
      .text('Подключения 📶', goToConnectionsPage)
      .text('Дай новую ссылку', async (ctx) => {
        const telegramId = String(ctx.from.id);
        const client = await xuiService.getClientByDevice(telegramId, device);

        if (!client) return;

        await xuiService.deleteClient(client.id);

        const url = await xuiService.getOrIssueSubUrl(telegramId, device);
        await sendConnectionMessage(ctx, device, url, menus[device]);
      });
  };

  const menus = {
    mobile: createUpdateMenu('mobile'),
    laptop: createUpdateMenu('laptop'),
  };

  const connectionsMenu = new Menu('connections-menu')
    .text('🍏 IOS/Android 🤖', async (ctx) => {
      await ctx.answerCallbackQuery();
      const telegramId = String(ctx.from.id);
      const url = await xuiService.getOrIssueSubUrl(telegramId, 'mobile');
      await sendConnectionMessage(ctx, 'mobile', url, menus.mobile);
    })
    .text('💻 Macbook', async (ctx) => {
      await ctx.answerCallbackQuery();
      const telegramId = String(ctx.from.id);
      const url = await xuiService.getOrIssueSubUrl(telegramId, 'laptop');
      await sendConnectionMessage(ctx, 'laptop', url, menus.laptop);
    })
    .row()
    .text('⬅ Назад', async (ctx) => {
      const username = ctx.from?.first_name || ctx.from?.username;
      ctx.menu.back();
      await ctx.editMessageText(getMainContent({ username }), {
        parse_mode: 'HTML',
      });
    });

  const mainMenu = new Menu('main-menu').text('Подключения 📶', goToConnectionsPage);

  mainMenu.register(connectionsMenu);
  mainMenu.register(menus.mobile);
  mainMenu.register(menus.laptop);

  return mainMenu;
};
