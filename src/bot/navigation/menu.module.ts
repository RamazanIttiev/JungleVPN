import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { ProfileMenuService } from '@bot/navigation/features/profile/profile-menu.service';
import { RevokeSubMsgService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { PaymentsService } from '@payments/payments.service';
import { StripeModule } from '@payments/providers/stripe/stripe.module';
import { YookassaModule } from '@payments/providers/yookassa/yookassa.module';
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
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentMethodMsgService,
    ProfileMenuService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
    ProfileMenu,
    // SERVICES
    RemnaService,
    PaymentsService,
    PaymentProviderFactory,
    UserService,
    CurrencyService,
  ],
  exports: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentMethodMsgService,
    ProfileMenuService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
    ProfileMenu,
  ],
  imports: [TypeOrmModule.forFeature([Payment]), YookassaModule, StripeModule],
})
export class MenuModule {}
