import { BotContext, initialSession } from '@bot/bot.types';
import { Menu } from '@bot/navigation/core/menu';
import { MenuRange } from '@grammyjs/menu';
import { Bot, session } from 'grammy';

const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '');

bot.use(session({ initial: initialSession }));

const mainText = 'Pick a pizza to rate it!';
const mainMenu = new Menu('main-manu');

mainMenu.text('Подключиться 📶', async (ctx) => {
  await ctx.editMessageText('Device', {
    reply_markup: deviceMenu,
  });
});

const deviceMenu = new Menu('devices-menu');

deviceMenu.dynamic((ctx, range) => {
  return createDeviceMenu();
});
function createDeviceMenu() {
  return new MenuRange<BotContext>().text({ text: 'Back' }, backToMain);
}
async function backToMain(ctx: BotContext) {
  await ctx.editMessageText(mainText, { reply_markup: mainMenu });
}

mainMenu.register(deviceMenu);

bot.use(mainMenu);

bot.command('start', (ctx) => {
  return ctx.reply(mainText, { reply_markup: mainMenu });
});

bot.catch(console.error.bind(console));
bot.start();
