import { createPaymentPeriodsMenu } from '@bot/methods/menu/pages/createPaymentPeriodsMenu';
import { Menu } from '@bot/navigation/menu';
import { createConnectionMenu } from './pages/connection';
import { createDevicesMenu } from './pages/devices';
import { createPaymentMenu } from './pages/payment';
import { goToDevicesPage } from './routes';

export const useMenu = () => {
  const connectionMenu = {
    ios: new Menu('ios-connection-menu'),
    android: new Menu('android-connection-menu'),
    macOS: new Menu('macOS-connection-menu'),
  };

  const mainMenu = new Menu('main-menu').dynamic(async (ctx, range) => {
    const tgUser = ctx.services.bot.validateUser(ctx.from);
    const user = await ctx.services.users.getUser(tgUser.id);
    const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

    if (!user) {
      range.text('Подключиться 📶', goToDevicesPage);
      return;
    }

    if (!isExpired) {
      range.text('Подключения 📶', goToDevicesPage);
      // range.text('Продлить 💰', goToPaymentPeriodsPage);
    } else {
      // range.text('Продлить 💰', goToPaymentPeriodsPage);
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
