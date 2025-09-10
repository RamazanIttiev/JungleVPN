import axios from 'axios';
import * as dotenv from 'dotenv';
import { Bot, InlineKeyboard, InputFile } from 'grammy';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN missing');
}

const bot = new Bot(token);
const backend = axios.create({
  baseURL: process.env.BACKEND_BASE_URL,
  headers: { 'x-api-key': process.env.BACKEND_API_KEY || '' },
});

bot.api
  .setMyCommands([
    { command: 'add', description: 'Add device' },
    { command: 'pay', description: 'Pay' },
    { command: 'devices', description: 'List devices' },
  ])
  .catch((err) => console.error('Failed to set commands:', err));

bot.api
  .setChatMenuButton({
    menu_button: {
      type: 'commands',
    },
  })
  .catch((err) => console.error('Failed to set menu button:', err));

bot.command('start', async (ctx) => {
  await ctx.reply('Welcome! Use menu buttons (commands) to add a device, pay, list or delete.');
});

bot.command('add', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  await backend.get('/users/ensure', { params: { telegramId } });
  await ctx.reply('User ensured. Now run /pay to proceed.');
});

bot.command('pay', async (ctx) => {
  if (!ctx.from) return;

  const telegramId = String(ctx.from.id);

  // Mock payment
  const { data } = await backend.post('/payments/mock', { telegramId, amount: 500 });

  if (data.status === 'paid') {
    const { data: config } = await backend.get('/peers/config', { params: { telegramId } });

    const { filename, content } = config as { filename: string; content: string };

    const buffer = Buffer.from(content, 'utf-8');

    await ctx.replyWithDocument(new InputFile(buffer, filename), {
      caption: `✅ Payment received!\n\nImport this config into the WireGuard app.`,
    });
  }
});

bot.command('devices', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const { data } = await backend.get('/peers/list', { params: { telegramId } });

  const items = (data?.items || []) as Array<{
    id: string;
    ipAddress: string;
    createdAt: string;
  }>;

  if (!items.length) {
    await ctx.reply('📱 You don’t have any active devices yet. Run /add to link one.');
    return;
  }

  await ctx.reply(`✅ You currently have *${items.length}* linked device(s):`, {
    parse_mode: 'Markdown',
  });

  for (const d of items) {
    const addedAt = new Date(d.createdAt).toLocaleString();
    const kb = new InlineKeyboard().text('🗑 Delete', `del:${d.id}`);
    await ctx.reply(`• Device ID: \`${d.id}\`\n• Added: ${addedAt}`, {
      parse_mode: 'Markdown',
      reply_markup: kb,
    });
  }
});

bot.callbackQuery(/del:(.+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const peerId = ctx.match?.[1];
  if (!peerId) return;

  try {
    await backend.delete(`/peers/${peerId}`, { params: { telegramId } });
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
    const message =
      (err as any)?.response?.data?.message || (err as Error)?.message || 'Unknown error';
    await ctx.reply(`❌ Failed to delete device: ${message}`);
  }
});

bot.start();
// eslint-disable-next-line no-console
console.log('Bot started');
