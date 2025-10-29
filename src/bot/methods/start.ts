import { BotContext } from '@bot/bot.model';
import { handleMainPageContent } from '@bot/methods/menu/content/templates';
import { Api, Bot, RawApi } from 'grammy';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'grammy/types';

export const useStartCommand = (
  bot: Bot<BotContext, Api<RawApi>>,
  reply_markup_options:
    | InlineKeyboardMarkup
    | ReplyKeyboardMarkup
    | ReplyKeyboardRemove
    | ForceReply
    | undefined,
) => {
  bot.command('start', async (ctx) => {
    const content = await handleMainPageContent(ctx);

    await ctx.react('🗿');

    await ctx.reply(content, {
      reply_markup: reply_markup_options,
      parse_mode: 'HTML',
    });
  });
};
