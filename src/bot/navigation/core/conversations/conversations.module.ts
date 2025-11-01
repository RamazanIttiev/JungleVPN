import { BotService } from '@bot/bot.service';
import { ConversationService } from '@bot/navigation/core/conversations/conversations.service';
import { ClientAppConversation } from '@bot/navigation/core/conversations/features/clientApp.conversation';
import { DevicesConversation } from '@bot/navigation/core/conversations/features/devices.conversation';
import { MainConversation } from '@bot/navigation/core/conversations/features/main.conversation';
import { PaymentConversation } from '@bot/navigation/core/conversations/features/payment.conversation';
import { PaymentPeriodsConversation } from '@bot/navigation/core/conversations/features/paymentPeriods.conversation';
import { PaymentStatusConversation } from '@bot/navigation/core/conversations/features/paymentStatus.conversation';
import { RevokeSubConversation } from '@bot/navigation/core/conversations/features/revokeSub.conversation';
import { SubscriptionConversation } from '@bot/navigation/core/conversations/features/subscription.conversation';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices.menu';
import { MainMenu } from '@bot/navigation/core/menu/features/main.menu';
import { SubscriptionMenu } from '@bot/navigation/core/menu/features/subscription.menu';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { PaymentsService } from '@payments/payments.service';
import { YooKassaProvider } from '@payments/providers/yookassa.provider';
import { RemnaService } from '@remna/remna.service';

@Module({
  exports: [ConversationService],
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [
    ConversationService,
    MainMenu,
    SubscriptionMenu,
    DevicesMenu,
    BotService,
    RemnaService,
    PaymentProviderFactory,
    PaymentsService,
    YooKassaProvider,
    MainConversation,
    DevicesConversation,
    SubscriptionConversation,
    PaymentConversation,
    PaymentStatusConversation,
    PaymentPeriodsConversation,
    RevokeSubConversation,
    ClientAppConversation,
  ],
})
export class ConversationModule {}
