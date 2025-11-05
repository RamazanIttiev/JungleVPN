import { BotService } from '@bot/bot.service';
import { StartCommand } from '@bot/commands/start.command';
import { DevicesConversation } from '@bot/navigation/core/conversations/features/devices.conversation';
import { MainConversation } from '@bot/navigation/core/conversations/features/main.conversation';
import { MainNewUserConversation } from '@bot/navigation/core/conversations/features/mainNewUser.conversation';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices.menu';
import { MainMenu } from '@bot/navigation/core/menu/features/main/main.menu';
import { MainService } from '@bot/navigation/core/menu/features/main/main.service';
import { MainNewUserMenu } from '@bot/navigation/core/menu/features/mainNewUser.menu';
import { PaymentMenu } from '@bot/navigation/core/menu/features/payment.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/core/menu/features/payment-periods.menu';
import { SubscriptionMenu } from '@bot/navigation/core/menu/features/subscription.menu';
import { UserService } from '@bot/user.service';
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
    MainService,
    MainNewUserMenu,
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
    MainConversation,
    DevicesConversation,
    MainNewUserConversation,
    UserService,
  ],
  exports: [
    MenuTree,
    MainMenu,
    MainService,
    MainNewUserMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    StartCommand,
  ],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class MenuModule {}
