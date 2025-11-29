import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
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
import { PaymentMethodMsgService } from './features/payment/payment-method/payment-method.service';
import { MenuTree } from './menu.tree';

@Module({
  providers: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    PaymentPeriodsMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentMethodMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
    // SERVICES
    RemnaService,
    PaymentsService,
    PaymentProviderFactory,
    YooKassaProvider,
    UserService,
  ],
  exports: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentPeriodsMsgService,
    PaymentMethodMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
  ],
  imports: [TypeOrmModule.forFeature([Payment])],
})
export class MenuModule {}
