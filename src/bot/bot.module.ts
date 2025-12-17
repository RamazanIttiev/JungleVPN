import { NavigateDevicesCallback } from '@bot/callbacks/navigate-devices.callback';
import { NavigateMainCallback } from '@bot/callbacks/navigate-main.callback';
import { NavigateProfileCallback } from '@bot/callbacks/navigate-profile.callback';
import { PaymentMethodsCallback } from '@bot/callbacks/payment-methods.callback';
import { PaymentPeriodsCallback } from '@bot/callbacks/payment-periods.callback';
import { PaymentSuccessCallback } from '@bot/callbacks/payment-success.callback';
import { BroadcastCommand } from '@bot/commands/broadcast/broadcast.command';
import { Broadcast } from '@bot/commands/broadcast/entities/broadcast.entity';
import { BroadcastMessage } from '@bot/commands/broadcast/entities/broadcast-message.entity';
import { StartCommand } from '@bot/commands/start.command';
import { PaymentStatusListener } from '@bot/listeners/payment-status.listener';
import { TorrentListener } from '@bot/listeners/torrent.listener';
import { UserExpireListener } from '@bot/listeners/user-expire.listener';
import { UserNotConnectedListener } from '@bot/listeners/user-not-connected.listener';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { RevokeSubMenuService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { MenuModule } from '@bot/navigation/menu.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { UserModule } from '@user/users.module';
import { BotService } from './bot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Broadcast, BroadcastMessage]),
    PaymentsModule,
    RemnaModule,
    MenuModule,
    UserModule,
  ],
  providers: [
    BotService,
    RemnaService,
    UserService,
    MainMsgService,
    PaymentMsgService,
    SubscriptionMsgService,
    RevokeSubMenuService,
    MainMenu,
    LocalisationService,
    CurrencyService,
    // HANDLERS
    UserExpireListener,
    UserNotConnectedListener,
    TorrentListener,
    PaymentStatusListener,
    // COMMANDS
    StartCommand,
    BroadcastCommand,
    // CALLBACKS
    PaymentSuccessCallback,
    PaymentPeriodsCallback,
    PaymentMethodsCallback,
    NavigateMainCallback,
    NavigateDevicesCallback,
    NavigateProfileCallback,
  ],
  exports: [BotService],
})
export class BotModule {}
