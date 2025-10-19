import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentsModule } from '@payments/payments.module';
import { SessionModule } from '@session/session.module';
import { User } from '@users/users.entity';
import { UsersModule } from '@users/users.module';
import { XuiModule } from '@xui/xui.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      entities: [User, Payment],
      synchronize: process.env.NODE_ENV !== 'production',
      migrationsRun: process.env.NODE_ENV === 'production',
    }),
    BotModule,
    XuiModule,
    PaymentsModule,
    UsersModule,
    SessionModule,
  ],
})
export class AppModule {}
