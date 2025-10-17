import { BotContext } from '@bot/bot.model';
import { getMainPageContent, getNewUserMainPageContent } from '@bot/methods/menu/content/templates';
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
    const tgUser = ctx.services.bot.validateUser(ctx.from);

    const user = await ctx.services.users.getUser(tgUser.id);
    const isNewUser = !user;

    console.log(user);

    const username = ctx.from?.first_name || ctx.from?.username;

    const content = isNewUser
      ? getNewUserMainPageContent({ username })
      : getMainPageContent({ username, clients: user?.clients, validUntil: user?.expiryTime });

    await ctx.react('🗿');

    await ctx.reply(content, {
      reply_markup: reply_markup_options,
      parse_mode: 'HTML',
    });
  });
};
