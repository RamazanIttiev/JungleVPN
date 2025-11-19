import { BotContext, initialSession } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  constructor(
    readonly mainMenu: MainMenu,
    readonly mainMsgService: MainMsgService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🍌');

      ctx.session.user = initialSession().user;
      await this.mainMsgService.init(ctx, this.mainMenu.menu);
    });
  }
}
