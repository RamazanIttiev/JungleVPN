import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { YookassaWebhookService } from '@payments/providers/yookassa/yookassa-webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  exports: [YooKassaProvider, YookassaWebhookService],
  providers: [YooKassaProvider, YookassaWebhookService],
})
export class YookassaModule {}
