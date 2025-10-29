import { MenuContext } from '@bot/bot.model';
import { getAppLink } from '@bot/methods/menu/content/templates';
import { UserDevice } from '@users/users.model';
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
      const user = await ctx.services.remna.getUserByTgId(tgUser.id);
      const subUrl = await ctx.services.remna.revokeSub(user?.uuid!);

      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;

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
