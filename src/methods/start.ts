import { Api, Bot, Context, RawApi } from 'grammy';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'grammy/types';
import { getMainPageContent } from './menu/menu-pages-content';

export const useStartCommand = (
  bot: Bot<Context, Api<RawApi>>,
  reply_markup_options:
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove
    | ForceReply
    | undefined,
) => {
  bot.command('start', async (ctx) => {
    const username = ctx.from?.first_name || ctx.from?.username;

    const content = getMainPageContent({ username });

    await ctx.react('🗿');

    await ctx.reply(content, {
      reply_markup: reply_markup_options,
      parse_mode: 'HTML',
    });
  });
};
