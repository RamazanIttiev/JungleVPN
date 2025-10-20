import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from '@payments/payments.module';
import { SessionModule } from '@session/session.module';
import { UsersModule } from '@users/users.module';
import { XuiModule } from '@xui/xui.module';
import { dataSourceOptions } from '../db/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    BotModule,
    XuiModule,
    PaymentsModule,
    UsersModule,
    SessionModule,
  ],
})
export class AppModule {}
