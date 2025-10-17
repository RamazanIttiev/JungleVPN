import { MenuContext } from '@bot/bot.model';
import { getAppLink } from '@bot/methods/menu/content/templates';
import { ClientDevice } from '@xui/xui.model';
import { goToDevicesPage } from '../routes';

export const createConnectionMenu = (menu: MenuContext, device: ClientDevice) => {
  return menu
    .text('⬅ Назад', goToDevicesPage)
    .row()
    .dynamic(async (_, range) => {
      const url = getAppLink(device);
      range.url('🔽Скачать', url);
    })
    .dynamic(async (ctx, range) => {
      const selectedDevice = ctx.session.selectedDevice;
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const user = await ctx.services.users.getUser(tgUser.id);
      const client = user?.clients.find((client) => client.device === selectedDevice);

      if (!client) {
        throw new Error('No client in createConnectionMenu');
      }

      const { redirectUrl } = ctx.services.xui.generateUrls(client.subId);

      if (!redirectUrl) {
        throw new Error('no ctx.session.redirectUrl in createConnectionMenu');
      }

      range.url('🔐Подключиться', redirectUrl);
    });
  // .text('🔄 Новая ссылка', async (ctx) => {
  //   const tgUser = ctx.services.bot.validateUser(ctx.from);
  //
  //   const client = await ctx.services.xui.getClientByDevice(tgUser.id, device);
  //   if (!client) return;
  //
  //   await ctx.services.xui.deleteClient(client.id);
  //
  //   await goToConnectionPage(ctx, menu);
  // });
};
