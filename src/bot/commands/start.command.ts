import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { MainConversation } from '@bot/navigation/core/conversations/features/main.conversation';
import { MainMenu } from '@bot/navigation/core/menu/features/main.menu';
import { UserService } from '@bot/user.service';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class StartCommand {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly userViewModel: UserService,
    readonly mainMenu: MainMenu,
    readonly mainConversation: MainConversation,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🗿');

      await this.userViewModel.init(ctx);
      await this.mainConversation.init(ctx, this.mainMenu.create());
    });
  }
}
