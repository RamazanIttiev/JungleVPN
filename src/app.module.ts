import { BotModule } from '@bot/bot.module';
import { MenuModule } from '@bot/navigation/core/menu/menu.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { SessionModule } from '@session/session.module';
import { UsersModule } from '@users/users.module';
import { dataSourceOptions } from '../db/datasource';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    BotModule,
    PaymentsModule,
    UsersModule,
    SessionModule,
    RemnaModule,
    MenuModule,
  ],
})
export class AppModule {}
