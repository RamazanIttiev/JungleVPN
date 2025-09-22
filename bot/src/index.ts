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
    { command: 'removeall', description: 'Remove all devices' },
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

  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);

  await backend.post('/users/create', { telegramId });
});

bot.command('add', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);

  const { data: peer } = await backend.post('/peers/add', { telegramId });

  const kb = new InlineKeyboard().text('🗑 Delete', `del:${peer.id}`);

  await ctx.reply(
    `
  New device is added. Now run /pay to proceed.
  
  • Device ID: \`${peer.id}\`\n
  • Status: ${peer.status}`,
    {
      parse_mode: 'Markdown',
      reply_markup: kb,
    },
  );
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

bot.command('devices', async (ctx) => {
  if (!ctx.from) return;
  const telegramId = String(ctx.from.id);
  const { data } = await backend.get('/peers/list', { params: { telegramId } });

  const peers = (data || []) as Array<{
    id: string;
    createdAt: string;
  }>;

  if (!peers.length) {
    await ctx.reply('📱 You don’t have any active devices yet. Run /add to link one.');
    return;
  }

  await ctx.reply(`✅ You currently have *${peers.length}* linked device(s):`, {
    parse_mode: 'Markdown',
  });

  for (const peer of peers) {
    const addedAt = new Date(peer.createdAt).toLocaleString('ru-RU');
    const kb = new InlineKeyboard().text('🗑 Delete', `del:${peer.id}`);

    await ctx.reply(`• Device ID: \`${peer.id}\`\n• Added: ${addedAt}`, {
      parse_mode: 'Markdown',
      reply_markup: kb,
    });
  }
});

bot.command('removeall', async (ctx) => {
  if (!ctx.from) return;

  const { data } = await backend.delete('/peers/removeAll');

  if (data.success) {
    await ctx.reply('✅ Devices deleted');
  } else {
    await ctx.reply('Failed to delete devices');
  }
});

bot.callbackQuery(/del:(.+)/, async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.from) return;
  const peerId = ctx.match?.[1];
  if (!peerId) return;

  try {
    await backend.delete(`/peers/${peerId}`, { params: { peerId } });

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
