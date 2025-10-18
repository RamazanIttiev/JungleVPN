import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentsModule } from '@payments/payments.module';
import { SessionModule } from '@session/session.module';
import { User } from '@users/users.entity';
import { UsersModule } from '@users/users.module';
import { XuiModule } from '@xui/xui.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [User, Payment],
      autoLoadEntities: true,
      // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
      synchronize: true,
    }),
    BotModule,
    XuiModule,
    PaymentsModule,
    UsersModule,
    SessionModule,
  ],
})
export class AppModule {}
