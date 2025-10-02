import { Api, Bot, Context, RawApi } from 'grammy';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'grammy/types';

export const executeStartCommand = (
  bot: Bot<Context, Api<RawApi>>,
  reply_markup_options:
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove
    | ForceReply
    | undefined,
) => {
  bot.command('start', async (ctx) => {
    await ctx.reply('welcomeText', {
      reply_markup: reply_markup_options,
    });
  });
};
