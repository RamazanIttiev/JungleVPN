import axios from 'axios';
import * as dotenv from 'dotenv';
import { Bot } from 'grammy';
import { XuiService } from './services/xui.service';
import { executeCommands } from './methods/command';
import { executeCallbackQuery } from './methods/callbackQuery';
import { executeStartCommand } from './methods/start';
import { executeMenu } from './methods/menu';

dotenv.config();

export const backend = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
  headers: { 'x-api-key': process.env.BACKEND_API_KEY || '' },
  withCredentials: true,
});

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN missing');
}

const bot = new Bot(token);
const xuiService = new XuiService();
const mainMenu = executeMenu(bot)

executeStartCommand(bot, backend, mainMenu)
executeCommands(bot, xuiService)
executeCallbackQuery(bot, xuiService)

bot.start();
