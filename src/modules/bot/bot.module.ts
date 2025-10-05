import { Module, OnModuleInit } from '@nestjs/common';
import { Bot, GrammyError, HttpError } from 'grammy';
import { useCallbackQuery } from '../../methods/callbackQuery';
import { useCommands } from '../../methods/command';
import { useMenu } from '../../methods/menu/menu';
import { useStartCommand } from '../../methods/start';
import { XuiService } from '../xui/xui.service';

@Module({
  providers: [XuiService],
})
export class BotModule implements OnModuleInit {
  token = process.env.TELEGRAM_BOT_TOKEN;
  bot: Bot;

  constructor(private readonly xuiService: XuiService) {}

  onModuleInit() {
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN missing');
    }

    this.bot = new Bot(this.token);

    const mainMenu = useMenu(this.xuiService);

    this.bot.use(mainMenu);

    useStartCommand(this.bot, mainMenu);
    useCommands(this.bot, this.xuiService);
    useCallbackQuery(this.bot, this.xuiService);

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

    this.bot.start();

    console.log('🤖 Telegram bot started');
  }
}
