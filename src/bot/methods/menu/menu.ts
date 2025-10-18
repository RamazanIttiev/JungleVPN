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

  const mainMenu = new Menu<BotContext>('main-menu', {
    onMenuOutdated: async (ctx) => {
      await ctx.reply('Что-то изменилось, попробуй заного /start');
    },
  }).dynamic(async (ctx, range) => {
    const tgUser = ctx.services.bot.validateUser(ctx.from);
    const user = await ctx.services.users.getUser(tgUser.id);
    const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

    if (!user) {
      range.text('Подключиться 📶', goToDevicesPage);
      return;
    }

    if (!isExpired) {
      range.text('Подключения 📶', goToDevicesPage);
      range.text('Продлить 💰', goToPaymentPeriodsPage);
    } else {
      range.text('Продлить 💰', goToPaymentPeriodsPage);
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
