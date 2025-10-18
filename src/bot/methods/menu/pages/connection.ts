import { MenuContext } from '@bot/bot.model';
import { getAppLink } from '@bot/methods/menu/content/templates';
import { ClientDevice } from '@xui/xui.model';
import { goToMainPage } from '../routes';

export const createConnectionMenu = (menu: MenuContext, device: ClientDevice) => {
  return menu
    .dynamic(async (_, range) => {
      const url = getAppLink(device);
      range.url('🔽Скачать', url);
    })
    .dynamic(async (ctx, range) => {
      const redirectUrl = ctx.session.redirectUrl;
      if (redirectUrl) range.url('🔐 Подключиться', redirectUrl);
    })
    .row()
    .text('Главное меню', async (ctx) => {
      ctx.session.subUrl = undefined;
      ctx.session.redirectUrl = undefined;
      ctx.session.selectedDevice = undefined;
      await goToMainPage(ctx);
    });
  // Todo Новая ссылка
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
