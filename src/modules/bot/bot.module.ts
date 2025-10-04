import { Module, OnModuleInit } from '@nestjs/common';
import { Bot, GrammyError, HttpError } from 'grammy';
import { executeCallbackQuery } from '../../methods/callbackQuery';
import { executeCommands } from '../../methods/command';
import { executeMenu } from '../../methods/menu';
import { executeStartCommand } from '../../methods/start';
import { XuiService } from '../xui/xui.service';

@Module({
  providers: [XuiService],
  // imports: [TypeOrmModule.forFeature([Client])],
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

    const mainMenu = executeMenu(this.xuiService);

    this.bot.use(mainMenu);

    executeStartCommand(this.bot, mainMenu);
    executeCommands(this.bot, this.xuiService);
    executeCallbackQuery(this.bot, this.xuiService);

    this.bot.catch((err) => {
      const e = err.error;
      if (e instanceof GrammyError) {
        console.log('GrammyError. Error in request:', e.description);
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
