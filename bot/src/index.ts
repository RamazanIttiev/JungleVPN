import axios from 'axios';
import * as dotenv from 'dotenv';
import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { XuiService } from './services/xui.service';

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

bot.command('start', async (ctx) => {
  await ctx.reply('Welcome! Use menu buttons (commands) to add a device, pay, list or delete.');

  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);

  await backend.post('/users/create', { telegramId });
});

bot.command('devices', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);

  const clients = await xuiService.getClients(telegramId);

  if (!clients.length) {
    await ctx.reply('📱 You don’t have any active devices yet. Run /add to link one.');
    return;
  }

  await ctx.reply(`✅ You currently have *${clients.length}* linked device(s):`, {
    parse_mode: 'Markdown',
  });

  for (const client of clients) {
    const kb = new InlineKeyboard().text('🗑 Delete', `del:${client.id}`);

    await ctx.reply(`• Device ID: \`${client.id}\``, {
      parse_mode: 'Markdown',
      reply_markup: kb,
    });
  }
});

bot.command('add', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);

  const data = await xuiService.addClient(telegramId);

  await ctx.reply(`✅ ${data.msg}`, {
    parse_mode: 'Markdown',
  });
});

bot.command('pay', async (ctx) => {
  if (!ctx.from) return;

  const telegramId = String(ctx.from.id);

  // Mock payment
  const { data } = await backend.post('/payments/mock', { telegramId, amount: 500 });

  if (data.status === 'paid') {
    try {
      const { data: config } = await backend.get('/peers/config', { params: { telegramId } });

      const { filename, content } = config as { filename: string; content: string };

      const buffer = Buffer.from(content, 'utf-8');

      await ctx.replyWithDocument(new InputFile(buffer, filename), {
        caption: `✅ Payment received!\n\nImport this config into the WireGuard app.`,
      });
    } catch (error) {
      await ctx.reply('You dont have any devices. Use /add command');
    }
  }
});

bot.callbackQuery(/del:(.+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.from) return;
  const clientId = ctx.match?.[1];
  if (!clientId) return;

  try {
    await xuiService.deleteClient(clientId);

    if (ctx.callbackQuery?.message) {
      const original = ctx.callbackQuery.message;
      const text = typeof original.text === 'string' ? original.text : '';
      await ctx.api.editMessageText(
        original.chat.id,
        original.message_id,
        `${text}\n\n✅ Deleted`,
        { parse_mode: 'Markdown' },
      );
    } else {
      await ctx.reply('✅ Device deleted');
    }
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { message?: string } } } | Error;
    const message =
      (axiosErr as { response?: { data?: { message?: string } } }).response?.data?.message ||
      (axiosErr as Error).message ||
      'Unknown error';
    await ctx.reply(`❌ Failed to delete device: ${message}`);
  }
});

bot.start();
// eslint-disable-next-line no-console
console.log('Bot started');
