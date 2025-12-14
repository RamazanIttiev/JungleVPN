import { Module } from '@nestjs/common';
import { PaymentsModule } from '@payments/payments.module';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [PaymentsModule],
  providers: [YooKassaProvider],
  controllers: [WebhookController],
})
export class WebhookModule {}
