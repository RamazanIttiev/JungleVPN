import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  constructor(
    private botService: BotService,
    readonly remnaService: RemnaService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🗿');

      const tgUser = this.botService.validateUser(ctx.from);
      const user = ctx.session.user.telegramId
        ? ctx.session.user
        : await this.remnaService.getUserByTgId(tgUser.id);
      const username = tgUser.first_name ?? tgUser.username ?? 'User';

      ctx.session.user = {
        uuid: user?.uuid,
        telegramId: tgUser.id,
        username,
        expireAt: user?.expireAt,
        subscriptionUrl: user?.subscriptionUrl,
      };

      if (user) {
        await ctx.conversation.enter('main');
      } else {
        await ctx.conversation.enter('mainNewUser');
      }
    });
  }
}
