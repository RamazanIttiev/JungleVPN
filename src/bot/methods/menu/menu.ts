import { BotContext } from '@bot/bot.model';
import { createPaymentPeriodsMenu } from '@bot/methods/menu/pages/createPaymentPeriodsMenu';
import { Menu } from '@grammyjs/menu';
import { createConnectionMenu } from './pages/connection';
import { createDevicesMenu } from './pages/devices';
import { createPaymentMenu } from './pages/payment';
import { goToDevicesPage, goToPaymentPeriodsPage } from './routes';

export const useMenu = () => {
  const connectionMenu = {
    ios: new Menu<BotContext>('ios-connection-menu'),
    android: new Menu<BotContext>('android-connection-menu'),
    macOS: new Menu<BotContext>('macOS-connection-menu'),
  };

  const mainMenu = new Menu<BotContext>('main-menu').dynamic(async (ctx, range) => {
    const tgUser = ctx.services.bot.validateUser(ctx.from);
    const isNewUser = (await ctx.services.users.getUserStatus(tgUser.id)) === 'new';

    if (isNewUser) {
      range.text('Подключения 📶', async (ctx) => {
        await goToDevicesPage(ctx);
      });
    } else {
      range.text('Подключения 📶', async (ctx) => {
        const tgUser = ctx.services.bot.validateUser(ctx.from);
        const status = await ctx.services.users.getUserStatus(tgUser.id);

        if (status === 'expired') {
          await goToPaymentPeriodsPage(ctx);
        } else {
          await goToDevicesPage(ctx);
        }
      });
      range.text('Продлить подписку', goToPaymentPeriodsPage);
    }
  });

  const paymentMenu = createPaymentMenu();
  const devicesMenu = createDevicesMenu(connectionMenu);
  const paymentPeriodsMenu = createPaymentPeriodsMenu(paymentMenu);

  createConnectionMenu(connectionMenu.ios, 'ios');
  createConnectionMenu(connectionMenu.android, 'android');
  createConnectionMenu(connectionMenu.macOS, 'macOS');

  mainMenu.register(devicesMenu);
  mainMenu.register(connectionMenu.ios);
  mainMenu.register(connectionMenu.android);
  mainMenu.register(connectionMenu.macOS);
  mainMenu.register(paymentMenu);
  mainMenu.register(paymentPeriodsMenu);

  return mainMenu;
};
