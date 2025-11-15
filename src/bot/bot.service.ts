import * as process from 'node:process';
import { BotContext, initialSession } from '@bot/bot.types';
import { NavigateDevicesCallback } from '@bot/callbacks/navigate-devices.callback';
import { NavigateMainCallback } from '@bot/callbacks/navigate-main.callback';
import { PaymentPeriodsCallback } from '@bot/callbacks/payment-periods.callback';
import { PaymentSuccessCallback } from '@bot/callbacks/payment-success.callback';
import { BroadcastCommand } from '@bot/commands/broadcast.command';
import { StartCommand } from '@bot/commands/start.command';
import { MenuTree } from '@bot/navigation/menu.tree';
import { conversations } from '@grammyjs/conversations';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot, GrammyError, HttpError, session } from 'grammy';

@Injectable()
export class BotService implements OnModuleInit {
  token = process.env.TELEGRAM_BOT_TOKEN;
  bot: Bot<BotContext>;

  constructor(
    private readonly menuTree: MenuTree,
    private readonly startCommand: StartCommand,
    private readonly broadcastCommand: BroadcastCommand,
    private readonly navigateMainCallback: NavigateMainCallback,
    private readonly navigateDevicesCallback: NavigateDevicesCallback,
    private readonly paymentSuccessCallback: PaymentSuccessCallback,
    private readonly paymentPeriodsCallback: PaymentPeriodsCallback,
  ) {
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN missing');
    }

    this.bot = new Bot(this.token);
  }

  async onModuleInit() {
    this.bot.use(session({ initial: initialSession }));

    this.bot.use(conversations());

    const menuTree = this.menuTree.init();

    this.bot.use(menuTree);

    this.bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

    this.bot.on(':successful_payment', async (ctx) => {
      await ctx.reply('✅ Оплата прошла успешно! Спасибо за вашу поддержку.');
    });

    this.startCommand.register(this.bot);
    this.broadcastCommand.register(this.bot);

    this.navigateMainCallback.register(this.bot);
    this.navigateDevicesCallback.register(this.bot);
    this.paymentSuccessCallback.register(this.bot);
    this.paymentPeriodsCallback.register(this.bot);

    this.bot.catch((err) => {
      const e = err.error;
      if (e instanceof GrammyError) {
        console.log('GrammyError. Error in request:', e);
      } else if (e instanceof HttpError) {
        console.log('HttpError. Could not contact Telegram:', e);
      } else {
        console.log('Unknown error:', e);
      }
    });
  }
}
