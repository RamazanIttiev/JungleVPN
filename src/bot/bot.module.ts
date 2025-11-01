import { StartCommand } from '@bot/commands/start.command';
import { ConversationModule } from '@bot/navigation/core/conversations/conversations.module';
import { ConversationService } from '@bot/navigation/core/conversations/conversations.service';
import { MenuModule } from '@bot/navigation/core/menu/menu.module';
import { MenuTree } from '@bot/navigation/core/menu/menu.tree';
import { conversations, createConversation } from '@grammyjs/conversations';
import { Module, OnModuleInit } from '@nestjs/common';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { initialSession } from '@session/session.model';
import { SessionModule } from '@session/session.module';
import { UsersModule } from '@users/users.module';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { BotService } from './bot.service';
import { BotContext } from './bot.types';
import { BroadcastCommand } from './commands/broadcast.command';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    SessionModule,
    RemnaModule,
    MenuModule,
    ConversationModule,
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule implements OnModuleInit {
  token = process.env.TELEGRAM_BOT_TOKEN;
  bot: Bot<BotContext>;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly menuTree: MenuTree,
    private readonly startCommand: StartCommand,
  ) {}

  async onModuleInit() {
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN missing');
    }

    this.bot = new Bot(this.token);

    this.bot.use(session({ initial: initialSession }));

    this.bot.use(conversations());

    const menuTree = this.menuTree.init();

    const convMap = {
      main: this.conversationService.main.bind(this.conversationService),
      devices: this.conversationService.devices.bind(this.conversationService),
      subscription: this.conversationService.subscription.bind(this.conversationService),
      payment: this.conversationService.payment.bind(this.conversationService),
      clientApp: this.conversationService.clientApp.bind(this.conversationService),
      revokeSub: this.conversationService.revokeSub.bind(this.conversationService),
      paymentPeriods: this.conversationService.paymentPeriods.bind(this.conversationService),
      paymentStatus: this.conversationService.paymentStatus.bind(this.conversationService),
    };

    for (const [id, handler] of Object.entries(convMap)) {
      this.bot.use(createConversation(handler, { id, parallel: id === 'devices' }));
    }

    this.bot.use(menuTree);

    this.bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

    this.bot.on(':successful_payment', async (ctx) => {
      await ctx.reply('✅ Оплата прошла успешно! Спасибо за вашу поддержку.');
    });

    this.startCommand.register(this.bot);
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

    this.bot.start();

    console.log('🤖 Telegram bot started');
  }
}
