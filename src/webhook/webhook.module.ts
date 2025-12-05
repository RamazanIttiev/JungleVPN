import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentsModule } from '@payments/payments.module';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), PaymentsModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
