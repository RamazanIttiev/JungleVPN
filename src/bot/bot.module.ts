import { useCommands } from '@bot/methods/command';
import { useMenu } from '@bot/methods/menu/menu';
import { useStartCommand } from '@bot/methods/start';
import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentsModule } from '@payments/payments.module';
import { PaymentsService } from '@payments/payments.service';
import { RemnaModule } from '@remna/remna.module';
import { RemnaService } from '@remna/remna.service';
import { initialSession } from '@session/session.model';
import { SessionModule } from '@session/session.module';
import { UsersModule } from '@users/users.module';
import { UsersService } from '@users/users.service';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { BotContext } from './bot.model';
import { BotService } from './bot.service';

@Module({
  imports: [UsersModule, PaymentsModule, SessionModule, RemnaModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule implements OnModuleInit {
  token = process.env.TELEGRAM_BOT_TOKEN;
  bot: Bot<BotContext>;
  adminID = process.env.TELEGRAM_ADMIN_ID;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly botService: BotService,
    private readonly usersService: UsersService,
    private readonly remnaService: RemnaService,
  ) {}

  onModuleInit() {
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN missing');
    }

    this.bot = new Bot(this.token);

    this.bot.use(session({ initial: initialSession }));

    this.bot.use(async (ctx, next) => {
      ctx.services = {
        payments: this.paymentsService,
        bot: this.botService,
        users: this.usersService,
        remna: this.remnaService,
      };
      await next();
    });

    this.bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

    const mainMenu = useMenu();

    this.bot.use(mainMenu);

    this.bot.on(':successful_payment', async (ctx) => {
      await ctx.reply('✅ Оплата прошла успешно! Спасибо за вашу поддержку.');
    });

    useStartCommand(this.bot, mainMenu);
    useCommands(this.bot, this.adminID);

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
