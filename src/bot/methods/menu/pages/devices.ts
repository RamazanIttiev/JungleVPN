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
      const isNewUser = (await ctx.services.users.getUserStatus(tgUser.id)) === 'new';
      // const paymentStatus = await ctx.services.payments.getPaymentStatus()
      if (isNewUser) {
        await ctx.services.bot.handleNewUser(ctx, tgUser, device);
      } else {
        await ctx.services.bot.handleActiveUser(ctx, tgUser, device);
      }

      await goToConnectionPage(ctx, connectionMenu[device]);
    });
  }

  menu.row().text('⬅ Назад', goToMainMenu);

  return menu;
};
