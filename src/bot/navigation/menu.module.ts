import { NavigateMainCallback } from '@bot/callbacks/navigate-main.callback';
import { PaymentPeriodsCallback } from '@bot/callbacks/payment-periods.callback';
import { PaymentSuccessCallback } from '@bot/callbacks/payment-success.callback';
import { StartCommand } from '@bot/commands/start.command';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { PaymentStatusMsgService } from '@bot/navigation/features/payment/paymentStatus.service';
import { RevokeSubMsgService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { PaymentsService } from '@payments/payments.service';
import { YooKassaProvider } from '@payments/providers/yookassa.provider';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { DevicesMenu } from './features/devices/devices.menu';
import { MenuTree } from './menu.tree';

@Module({
  providers: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    PaymentStatusMsgService,
    PaymentPeriodsMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    // SERVICES
    RemnaService,
    PaymentsService,
    PaymentProviderFactory,
    YooKassaProvider,
    UserService,
    // COMMANDS
    StartCommand,
    // CALLBACKS
    PaymentSuccessCallback,
    PaymentPeriodsCallback,
    NavigateMainCallback,
  ],
  exports: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    PaymentStatusMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentPeriodsMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    // COMMANDS
    StartCommand,
    // CALLBACKS
    PaymentSuccessCallback,
    PaymentPeriodsCallback,
    NavigateMainCallback,
  ],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class MenuModule {}
