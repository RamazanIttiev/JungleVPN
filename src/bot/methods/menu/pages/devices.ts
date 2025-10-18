import { BotContext, MenuContext } from '@bot/bot.model';
import { mapDeviceLabel } from '@bot/methods/menu/content/templates';
import { Menu } from '@grammyjs/menu';
import { ClientDevice } from '@xui/xui.model';
import { goToConnectionPage, goToMainMenu } from '../routes';

const devices: ClientDevice[] = ['ios', 'android', 'macOS'];

export const createDevicesMenu = (connectionMenu: Record<ClientDevice, MenuContext>) => {
  const menu = new Menu<BotContext>('devices-menu');

  for (const device of devices) {
    menu.text(mapDeviceLabel(device), async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);

      const { client } = await ctx.services.bot.handleDeviceSelection(tgUser, device);
      const { redirectUrl, subUrl } = ctx.services.xui.generateUrls(client.subId);

      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = redirectUrl;
      ctx.session.selectedDevice = device;

      await goToConnectionPage(ctx, connectionMenu[device]);
    });
  }

  menu.row().text('⬅ Назад', goToMainMenu);
  return menu;
};
