import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentsModule } from '@payments/payments.module';
import { StripeModule } from '@payments/providers/stripe/stripe.module';
import { YookassaModule } from '@payments/providers/yookassa/yookassa.module';
import { RemnaModule } from '@remna/remna.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    PaymentsModule,
    RemnaModule,
    YookassaModule,
    StripeModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
