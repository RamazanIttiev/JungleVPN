import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly userService: UserService,
    readonly mainMenu: MainMenu,
    readonly mainMsgService: MainMsgService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🍌');

      await this.userService.init(ctx);
      await this.mainMsgService.init(ctx, this.mainMenu.menu);
    });
  }
}
