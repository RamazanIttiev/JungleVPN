import { BotContext, initialSession } from '@bot/bot.types';
import { Menu } from '@bot/navigation/core/menu';
import { getMainPageContent } from '@bot/utils/templates';
import { toDateString } from '@bot/utils/utils';
import { MenuRange } from '@grammyjs/menu';
import { Bot, session } from 'grammy';

const bot = new Bot<BotContext>(process.env.TELEGRAM_BOT_TOKEN || '');

bot.use(session({ initial: initialSession }));

const mainMenu = new Menu('main-manu');

mainMenu.text('Подключиться 📶', async (ctx) => {
  await ctx.editMessageText('Device', {
    reply_markup: deviceMenu,
  });
});

const deviceMenu = new Menu('devices-menu');

deviceMenu.dynamic((ctx, range) => {
  return new MenuRange<BotContext>().text({ text: 'Back' }, backToMain);
});

async function backToMain(ctx: BotContext) {
  const content = getMainPageContent({
    username: ctx.from?.username || 'User',
    isExpired: false,
    validUntil: toDateString('2026-10-28T18:26:53.280Z'),
  });

  await ctx.editMessageText(content, { reply_markup: mainMenu });
}

mainMenu.register(deviceMenu);

bot.use(mainMenu);

bot.command('start', async (ctx) => {
  const content = getMainPageContent({
    username: ctx.from?.username || 'User',
    isExpired: false,
    validUntil: toDateString('2026-10-28T18:26:53.280Z'),
  });

  await ctx.reply(content, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: mainMenu,
  });
});

bot.catch(console.error.bind(console));
// bot.start();
