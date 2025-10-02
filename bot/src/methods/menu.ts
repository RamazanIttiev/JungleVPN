import { Menu } from '@grammyjs/menu';
import { Api, Bot, Context, RawApi } from 'grammy';

export const executeMenu = (bot: Bot<Context, Api<RawApi>>) => {
  const mainMenu = new Menu('main-menu', { autoAnswer: false })
    .text('🔌 Connections', (ctx) => ctx.menu.nav('connections-menu'))
    .row()
    .text('ℹ️ About', (ctx) => ctx.menu.nav('about-menu'));

  mainMenu.dynamic((ctx, range) => {
    return range.text('👋 Welcome!\nChoose an option below:');
  });

  const connectionsMenu = new Menu('connections-menu').text('⬅️ Back', (ctx) => ctx.menu.back());

  connectionsMenu.dynamic((ctx, range) => {
    return range.text('🔌 Connections Page\n\nHere you will see your servers.');
  });

  const aboutMenu = new Menu('about-menu').text('⬅️ Back', (ctx) => ctx.menu.back());

  aboutMenu.dynamic((ctx, range) => {
    return range.text('ℹ️ About Page\n\nThis is a demo of single-message navigation.');
  });

  mainMenu.register(connectionsMenu);
  mainMenu.register(aboutMenu);

  bot.use(mainMenu);

  return mainMenu;
};
