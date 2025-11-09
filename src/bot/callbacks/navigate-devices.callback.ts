import { BotContext } from '@bot/bot.types';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { getDevicesPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';

@Injectable()
export class NavigateDevicesCallback {
  constructor(
    readonly userService: UserService,
    readonly devicesMenu: DevicesMenu,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_devices', async (ctx) => {
      await this.userService.init(ctx);
      await ctx.editMessageText(getDevicesPageContent(), {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: this.devicesMenu.menu,
      });
      await ctx.answerCallbackQuery();
    });
  }
}
