import { MenuContext } from '@bot/bot.model';
import { mapDeviceLabel } from '@bot/methods/utils';
import { Menu } from '@bot/navigation/menu';
import { UserDevice } from '@users/users.model';
import { goToConnectionPage, goToMainPage } from '../routes';

export const createDevicesMenu = (connectionMenu: Record<UserDevice, MenuContext>) => {
  const devices: UserDevice[] = JSON.parse(
    process.env.USER_DEVICES || '["ios", "android", "macOS"]',
  );

  const menu = new Menu('devices-menu');

  for (const device of devices) {
    menu.text(mapDeviceLabel(device), async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

      if (!isExpired) {
        const { client } = await ctx.services.bot.handleDeviceSelection(tgUser, device);
        const { redirectUrl, subUrl } = ctx.services.xui.generateUrls(client.subId);

        ctx.session.subUrl = subUrl;
        ctx.session.redirectUrl = redirectUrl;
        ctx.session.selectedDevice = device;

        await goToConnectionPage(ctx, connectionMenu[device]);
      } else {
        await goToMainPage(ctx);
      }
    });
  }

  menu.row().text('⬅ Назад', goToMainPage);
  return menu;
};
