import { PaymentSuccessCommand } from '@bot/commands/paymentSuccess.command';
import { StartCommand } from '@bot/commands/start.command';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentStatusMsgService } from '@bot/navigation/features/payment/paymentStatus.service';
import { RevokeSubMsgService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { MenuModule } from '@bot/navigation/menu.module';
import { MenuTree } from '@bot/navigation/menu.tree';
import { conversations } from '@grammyjs/conversations';
import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { UserModule } from '@user/users.module';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { BotService } from './bot.service';
import { BotContext, initialSession } from './bot.types';
import { BroadcastCommand } from './commands/broadcast.command';

@Module({
  imports: [PaymentsModule, RemnaModule, MenuModule, UserModule],
  providers: [
    BotService,
    RemnaService,
    UserService,
    MainMsgService,
    PaymentMsgService,
    PaymentStatusMsgService,
    SubscriptionMsgService,
    RevokeSubMsgService,
    MainMenu,
  ],
  exports: [BotService],
})
export class BotModule implements OnModuleInit {
  token = process.env.TELEGRAM_BOT_TOKEN;
  bot: Bot<BotContext>;

  constructor(
    private readonly menuTree: MenuTree,
    private readonly startCommand: StartCommand,
    private readonly paymentSuccessCommand: PaymentSuccessCommand,
  ) {}

  async onModuleInit() {
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN missing');
    }

    this.bot = new Bot(this.token);

    this.bot.use(session({ initial: initialSession }));

    this.bot.use(conversations());

    const menuTree = this.menuTree.init();

    this.bot.use(menuTree);

    this.bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

    this.bot.on(':successful_payment', async (ctx) => {
      await ctx.reply('✅ Оплата прошла успешно! Спасибо за вашу поддержку.');
    });

    this.startCommand.register(this.bot);
    this.paymentSuccessCommand.register(this.bot);
    new BroadcastCommand().register(this.bot);

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

    await this.bot.start();

    console.log('🤖 Telegram bot started');
  }
}
