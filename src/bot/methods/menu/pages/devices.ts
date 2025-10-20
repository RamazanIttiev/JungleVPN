import { MenuContext } from '@bot/bot.model';
import { mapDeviceLabel } from '@bot/methods/utils';
import { Menu } from '@bot/navigation/menu';
import { UserDevice } from '@users/users.model';
import { goToConnectionPage, goToMainPage } from '../routes';

export const createDevicesMenu = (connectionMenu: Record<UserDevice, MenuContext>) => {
  const devices: UserDevice[] = JSON.parse(
    process.env.USER_DEVICES || '["ios", "android", "macOS", "windows"]',
  );

  const menu = new Menu('devices-menu');

  const handleDeviceClick = async (ctx: any, device: UserDevice) => {
    const tgUser = ctx.services.bot.validateUser(ctx.from);
    const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

    if (isExpired) {
      await goToMainPage(ctx);
      return;
    }

    const { client } = await ctx.services.bot.handleDeviceSelection(tgUser, device);
    const { redirectUrl, subUrl } = ctx.services.xui.generateUrls(client.subId);

    ctx.session = {
      ...ctx.session,
      subUrl,
      redirectUrl,
      selectedDevice: device,
    };

    await goToConnectionPage(ctx, connectionMenu[device]);
  };

  devices.forEach((device, index) => {
    if (index > 0 && index % 2 === 0) menu.row();
    menu.text(mapDeviceLabel(device), (ctx) => handleDeviceClick(ctx, device));
  });

  menu.row().text('⬅ Назад', goToMainPage);

  return menu;
};
