import { MenuContext } from '@bot/bot.model';
import { getAppLink } from '@bot/methods/menu/content/templates';
import { UserDevice } from '@users/users.model';
import { randomId } from '@xui/xui.util';
import { goToConnectionPage, goToMainPage } from '../routes';

export const createConnectionMenu = (menu: MenuContext, device: UserDevice) => {
  return menu
    .dynamic(async (_, range) => {
      const url = getAppLink(device);
      range.url('🔽Скачать', url);
    })
    .dynamic(async (ctx, range) => {
      const redirectUrl = ctx.session.redirectUrl;
      if (redirectUrl) range.url('🔐 Подключиться', redirectUrl);
    })
    .text('🔄 Новая ссылка', async (ctx) => {
      const tgUser = ctx.services.bot.validateUser(ctx.from);
      const client = await ctx.services.xui.getClientByDevice(tgUser.id, device);
      if (!client) return;

      const newSubId = randomId();

      const { subUrl, redirectUrl } = ctx.services.xui.generateUrls(newSubId);

      await ctx.services.users.updateUserClient(tgUser.id, device, { subId: newSubId });
      await ctx.services.xui.updateClient(client, { subId: newSubId });

      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = redirectUrl;

      await goToConnectionPage(ctx, menu);
    })
    .row()
    .text('Главное меню', async (ctx) => {
      ctx.session.subUrl = undefined;
      ctx.session.redirectUrl = undefined;
      ctx.session.selectedDevice = undefined;
      await goToMainPage(ctx);
    });
};
