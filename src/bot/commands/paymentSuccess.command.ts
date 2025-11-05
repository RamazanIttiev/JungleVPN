import { BotContext } from '@bot/bot.types';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { getDevicesPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class PaymentSuccessCommand {
  constructor(readonly devicesMenu: DevicesMenu) {}
  register(bot: Bot<BotContext>) {
    bot.callbackQuery('paymentSuccess', async (ctx) => {
      try {
        await ctx.deleteMessage();
      } catch {
        return;
      }
      await ctx.reply(getDevicesPageContent(), {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: this.devicesMenu.menu,
      });
    });
  }
}
