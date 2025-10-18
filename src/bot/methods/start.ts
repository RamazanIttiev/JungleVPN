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
    const username = tgUser.first_name || tgUser.username;
    const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

    const content = !user
      ? getNewUserMainPageContent({ username, isExpired, isNewUser: !user })
      : getMainPageContent({
          username,
          isExpired,
          clients: user?.clients,
          validUntil: user?.expiryTime,
        });

    await ctx.react('🗿');

    await ctx.reply(content, {
      reply_markup: reply_markup_options,
      parse_mode: 'HTML',
    });
  });
};
