import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { ReferralMsgService } from '@bot/navigation/features/referral/referral.service';
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
import { Referral } from '../../referral/referral.entity';
import { ReferralService } from '../../referral/referral.service';
import { DevicesMenu } from './features/devices/devices.menu';
import { MenuTree } from './menu.tree';

@Module({
  providers: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    PaymentPeriodsMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    ReferralMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    ReferralMenu,
    // SERVICES
    RemnaService,
    PaymentsService,
    PaymentProviderFactory,
    YooKassaProvider,
    UserService,
    ReferralService,
  ],
  exports: [
    // MODELS
    MainMsgService,
    PaymentMsgService,
    RevokeSubMsgService,
    SubscriptionMsgService,
    PaymentPeriodsMsgService,
    ReferralMsgService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    ReferralMenu,
  ],
  imports: [TypeOrmModule.forFeature([Payment, Referral])],
})
export class MenuModule {}
