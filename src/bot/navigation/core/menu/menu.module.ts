import { BotService } from '@bot/bot.service';
import { StartCommand } from '@bot/commands/start.command';
import { DevicesMenu } from '@bot/navigation/devices.menu';
import { MainMenu } from '@bot/navigation/main.menu';
import { PaymentMenu } from '@bot/navigation/payment.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/payment-periods.menu';
import { SubscriptionMenu } from '@bot/navigation/subscription.menu';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { PaymentsService } from '@payments/payments.service';
import { YooKassaProvider } from '@payments/providers/yookassa.provider';
import { RemnaService } from '@remna/remna.service';
import { MenuTree } from './menu.tree';

@Module({
  providers: [
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    BotService,
    RemnaService,
    PaymentsService,
    StartCommand,
    PaymentProviderFactory,
    YooKassaProvider,
  ],
  exports: [
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    StartCommand,
  ],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class MenuModule {}
