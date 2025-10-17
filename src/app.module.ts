import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from '@payments/payments.module';
import { SessionModule } from '@session/session.module';
import { SessionService } from '@session/session.service';
import { User } from '@users/users.entity';
import { UsersModule } from '@users/users.module';
import { XuiModule } from '@xui/xui.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BotModule,
    XuiModule,
    PaymentsModule,
    UsersModule,
    SessionModule,
  ],
  providers: [SessionService],
})
export class AppModule {}
