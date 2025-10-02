import * as dotenv from 'dotenv';
import { Bot } from 'grammy';
import { executeCallbackQuery } from './methods/callbackQuery';
import { executeCommands } from './methods/command';
import { executeMenu } from './methods/menu';
import { executeStartCommand } from './methods/start';
import { XuiService } from './xui/xui.service';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN missing');
}

const bot = new Bot(token);
const xuiService = new XuiService();
const mainMenu = executeMenu(bot);

executeStartCommand(bot, mainMenu);
executeCommands(bot, xuiService);
executeCallbackQuery(bot, xuiService);

bot.start();
