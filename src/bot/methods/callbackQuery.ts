import { BotContext } from '@bot/bot.model';
import { Api, Bot, RawApi } from 'grammy';

export const useCallbackQuery = (bot: Bot<BotContext, Api<RawApi>>) => {
  bot.callbackQuery(/del:(.+)/, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.from) return;
    const clientId = ctx.match?.[1];
    if (!clientId) return;

    try {
      await ctx.services.xui.deleteClient(clientId);

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
};
