import { BotService } from '@bot/bot.service';
import { ConversationService } from '@bot/navigation/core/conversations/conversations.service';
import { DevicesMenu } from '@bot/navigation/devices.menu';
import { MainMenu } from '@bot/navigation/main.menu';
import { SubscriptionMenu } from '@bot/navigation/subscription.menu';
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
  ],
})
export class ConversationModule {}
