import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/core/menu/features/main/main.menu';
import { MainService } from '@bot/navigation/core/menu/features/main/main.service';
import { UserService } from '@bot/user.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly userService: UserService,
    readonly mainMenu: MainMenu,
    readonly mainService: MainService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🗿');

      await this.userService.init(ctx);
      await this.mainService.init(ctx, this.mainMenu.menu);
    });
  }
}
