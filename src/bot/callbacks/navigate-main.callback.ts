import { BotContext } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';

@Injectable()
export class NavigateMainCallback {
  constructor(
    readonly userService: UserService,
    readonly mainMenu: MainMenu,
    readonly mainMsgService: MainMsgService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_main', async (ctx) => {
      await this.userService.init(ctx);
      await this.mainMsgService.init(ctx, this.mainMenu.menu);
    });
  }
}
