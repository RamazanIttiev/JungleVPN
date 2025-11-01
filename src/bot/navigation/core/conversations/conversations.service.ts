import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { ClientAppConversation } from '@bot/navigation/core/conversations/features/clientApp.conversation';
import { DevicesConversation } from '@bot/navigation/core/conversations/features/devices.conversation';
import { MainConversation } from '@bot/navigation/core/conversations/features/main.conversation';
import { PaymentConversation } from '@bot/navigation/core/conversations/features/payment.conversation';
import { PaymentPeriodsConversation } from '@bot/navigation/core/conversations/features/paymentPeriods.conversation';
import { PaymentStatusConversation } from '@bot/navigation/core/conversations/features/paymentStatus.conversation';
import { RevokeSubConversation } from '@bot/navigation/core/conversations/features/revokeSub.conversation';
import { SubscriptionConversation } from '@bot/navigation/core/conversations/features/subscription.conversation';
import { createConversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';

@Injectable()
export class ConversationService extends Base {
  constructor(
    private readonly main: MainConversation,
    private readonly devices: DevicesConversation,
    private readonly subscription: SubscriptionConversation,
    private readonly clientApp: ClientAppConversation,
    private readonly revokeSub: RevokeSubConversation,
    private readonly payment: PaymentConversation,
    private readonly paymentStatus: PaymentStatusConversation,
    private readonly paymentPeriods: PaymentPeriodsConversation,

    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }
  registerAll(bot: Bot<BotContext>) {
    bot.use(createConversation(this.main.init.bind(this.main), 'main'));
    bot.use(
      createConversation(this.devices.init.bind(this.devices), { id: 'devices', parallel: true }),
    );
    bot.use(createConversation(this.subscription.init.bind(this.subscription), 'subscription'));
    bot.use(createConversation(this.clientApp.init.bind(this.clientApp), 'clientApp'));
    bot.use(createConversation(this.revokeSub.init.bind(this.revokeSub), 'revokeSub'));
    bot.use(createConversation(this.payment.init.bind(this.payment), 'payment'));
    bot.use(createConversation(this.paymentStatus.init.bind(this.paymentStatus), 'paymentStatus'));
    bot.use(
      createConversation(this.paymentPeriods.init.bind(this.paymentPeriods), 'paymentPeriods'),
    );
  }
}
