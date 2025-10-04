import { Menu } from '@grammyjs/menu';
import { ClientDevice } from '../../modules/xui/xui.model';
import { XuiService } from '../../modules/xui/xui.service';
import {
  getConnectionsPageContent,
  getDevicePageContent,
  getMainPageContent,
} from './menu-pages-content';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const useMenu = (xuiService: XuiService) => {
  const goToConnectionsPage = async (ctx: any) => {
    ctx.menu.nav('connections-menu');
    await ctx.editMessageText(getConnectionsPageContent(), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  };

  const sendConnectionMessage = async (
    ctx: any,
    device: ClientDevice,
    url: string,
    replyMenu: Menu,
  ) => {
    const content = getDevicePageContent({
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

  const createUpdateMenu = (device: ClientDevice): Menu => {
    const menuId = `update-${device}-sub-menu`;

    return new Menu(menuId)
      .text('⬅ Назад', goToConnectionsPage)
      .text('Дай новую ссылку', async (ctx) => {
        const tgUser = ctx.from;

        if (!tgUser) return;

        const client = await xuiService.getClientByDevice(tgUser.id, device);
        if (!client) return;

        await xuiService.deleteClient(client.id);

        const url = await xuiService.getOrIssueSubUrl(tgUser, device);
        await sendConnectionMessage(ctx, device, url, menus[device]);
      });
  };

  const menus = {
    ios: createUpdateMenu('ios'),
    android: createUpdateMenu('android'),
    macOS: createUpdateMenu('macOS'),
  };

  const connectionsMenu = new Menu('connections-menu')
    .text('🍏 IOS ', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;
      await ctx.answerCallbackQuery();
      const url = await xuiService.getOrIssueSubUrl(tgUser, 'ios');
      await sendConnectionMessage(ctx, 'ios', url, menus.ios);
    })
    .text('🤖 Android ', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;
      await ctx.answerCallbackQuery();
      const url = await xuiService.getOrIssueSubUrl(tgUser, 'android');
      await sendConnectionMessage(ctx, 'android', url, menus.android);
    })
    .text('💻 macOS', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;
      await ctx.answerCallbackQuery();
      const url = await xuiService.getOrIssueSubUrl(tgUser, 'macOS');
      await sendConnectionMessage(ctx, 'macOS', url, menus.macOS);
    })
    .row()
    .text('⬅ Назад', async (ctx) => {
      const username = ctx.from?.first_name || ctx.from?.username;
      ctx.menu.back();
      await ctx.editMessageText(getMainPageContent({ username }), {
        parse_mode: 'HTML',
      });
    });

  const mainMenu = new Menu('main-menu').text('Подключения 📶', goToConnectionsPage);

  mainMenu.register(connectionsMenu);
  mainMenu.register(menus.ios);
  mainMenu.register(menus.android);
  mainMenu.register(menus.macOS);

  return mainMenu;
};
