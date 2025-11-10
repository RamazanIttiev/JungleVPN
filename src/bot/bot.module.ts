import { NavigateDevicesCallback } from '@bot/callbacks/navigate-devices.callback';
import { NavigateMainCallback } from '@bot/callbacks/navigate-main.callback';
import { PaymentPeriodsCallback } from '@bot/callbacks/payment-periods.callback';
import { PaymentSuccessCallback } from '@bot/callbacks/payment-success.callback';
import { BroadcastCommand } from '@bot/commands/broadcast.command';
import { StartCommand } from '@bot/commands/start.command';
import { UserExpireListener } from '@bot/listeners/user-expire.listener';
import { UserNotConnectedListener } from '@bot/listeners/user-not-connected.listener';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentStatusMsgService } from '@bot/navigation/features/payment/paymentStatus.service';
import { RevokeSubMsgService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { MenuModule } from '@bot/navigation/menu.module';
import { Module } from '@nestjs/common';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { UserModule } from '@user/users.module';
import { BotService } from './bot.service';

@Module({
  imports: [PaymentsModule, RemnaModule, MenuModule, UserModule],
  providers: [
    BotService,
    RemnaService,
    UserService,
    MainMsgService,
    PaymentMsgService,
    PaymentStatusMsgService,
    SubscriptionMsgService,
    RevokeSubMsgService,
    MainMenu,
    // HANDLERS
    UserExpireListener,
    UserNotConnectedListener,
    // COMMANDS
    StartCommand,
    BroadcastCommand,
    // CALLBACKS
    PaymentSuccessCallback,
    PaymentPeriodsCallback,
    NavigateMainCallback,
    NavigateDevicesCallback,
  ],
  exports: [BotService],
})
export class BotModule {}
