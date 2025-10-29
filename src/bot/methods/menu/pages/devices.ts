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
    const user = await ctx.services.remna.getUserByTgId(tgUser.id);
    const isExpired = user ? Date.now() > new Date(user?.expireAt).getTime() : true;

    if (isExpired) {
      await goToMainPage(ctx);
      return;
    }

    ctx.session = {
      ...ctx.session,
      subUrl: user.subscriptionUrl,
      redirectUrl: `https://in.thejungle.pro/redirect?link=v2raytun://import/${user.subscriptionUrl}`,
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
