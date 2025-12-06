import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentsModule } from '@payments/payments.module';
import { RemnaModule } from '@remna/remna.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), PaymentsModule, RemnaModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
