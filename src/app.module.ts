import { BotModule } from '@bot/bot.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeModule } from '@payments/providers/stripe/stripe.module';
import { dataSourceOptions } from '../db/datasource';
import { AppController } from './app.controller';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    StripeModule.forRootAsync(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    BotModule,
    WebhookModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
