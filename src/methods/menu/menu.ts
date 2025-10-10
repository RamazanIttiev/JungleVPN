import { Menu } from '@grammyjs/menu';
import { Context } from 'grammy';
import { ClientDevice } from '../../modules/xui/xui.model';
import { XuiService } from '../../modules/xui/xui.service';
import {
  getAppLink,
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

  const sendDevicesPageContent = async (
    ctx: Context,
    device: ClientDevice,
    subUrl: string,
    replyMenu: Menu,
  ) => {
    const content = getDevicePageContent({
      device,
      subUrl: escapeHtml(subUrl),
    });

    try {
      await ctx.deleteMessage();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }

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
      .row()
      .dynamic(async (_, range) => {
        const url = getAppLink(device);

        range.url('🔽Скачать', url);
      })
      .dynamic(async (ctx, range) => {
        const tgUser = ctx.from;
        if (!tgUser) return;

        const { redirectUrl } = await xuiService.getOrIssueSubUrl(tgUser, device);
        range.url('🔐Подключиться', redirectUrl);
      })
      .text('🔄Новая ссылка', async (ctx) => {
        const tgUser = ctx.from;

        if (!tgUser) return;

        const client = await xuiService.getClientByDevice(tgUser.id, device);
        if (!client) return;

        await xuiService.deleteClient(client.id);

        const { subUrl } = await xuiService.getOrIssueSubUrl(tgUser, device);
        await sendDevicesPageContent(ctx, device, subUrl, menus[device]);
      })
      .text('Оплата', async (ctx) => {
        const telegramId = ctx.from.id;
        const chatId = ctx.chatId?.toString();

        if (!telegramId || !chatId) return;

        const invoice = {
          chatId,
          title: 'Subscription',
          description: 'Subscription to the service',
          payload: `invoice-${telegramId}-${Date.now()}`,
          provider_token: process.env.PAYMENT_TOKEN || '',
          currency: 'RUB',
          prices: [{ label: 'Subscription', amount: 50000 }],
          need_email: false,
          createdAt: new Date(),
        };

        const provider_data = {
          receipt: {
            items: [
              {
                description: invoice.description,
                quantity: 1,
                amount: {
                  value: '500.00',
                  currency: invoice.currency,
                },
                vat_code: 1,
              },
            ],
          },
        };

        try {
          const response = await ctx.api.sendInvoice(
            chatId,
            invoice.title,
            invoice.description,
            invoice.payload,
            invoice.currency,
            invoice.prices,
            {
              provider_token: invoice.provider_token,
              provider_data: JSON.stringify(provider_data),
            },
          );

          console.log(response);
        } catch (error) {
          console.error('Error sending invoice:', error);
          await ctx.reply('Ошибка при создании счета. Пожалуйста, попробуйте позже.');
        }
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
      const { subUrl } = await xuiService.getOrIssueSubUrl(tgUser, 'ios');
      await sendDevicesPageContent(ctx, 'ios', subUrl, menus.ios);
    })
    .text('🤖 Android ', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;
      const { subUrl } = await xuiService.getOrIssueSubUrl(tgUser, 'android');
      await sendDevicesPageContent(ctx, 'android', subUrl, menus.android);
    })
    .text('💻 macOS', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;
      const { subUrl } = await xuiService.getOrIssueSubUrl(tgUser, 'macOS');
      await sendDevicesPageContent(ctx, 'macOS', subUrl, menus.macOS);
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
