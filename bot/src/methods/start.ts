import { InlineKeyboardMarkup, ReplyKeyboardMarkup, ReplyKeyboardRemove, ForceReply } from 'grammy/types';
import { Api, Bot, Context, RawApi } from 'grammy';
import { AxiosInstance } from 'axios';

export const executeStartCommand = (bot:  Bot<Context, Api<RawApi>>, api:  AxiosInstance, reply_markup_options:  InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply | undefined) => {
  bot.command('start', async (ctx) => {
    await ctx.reply('welcomeText', {
      reply_markup: reply_markup_options,
    });

    if (!ctx.from) return;
    const telegramId = String(ctx.from.id);

    await api.post('/users/create', { telegramId });
  });
}