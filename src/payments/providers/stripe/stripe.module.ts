import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { StripeWebhookService } from '@payments/providers/stripe/stripe-webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  exports: [StripeProvider, StripeWebhookService],
  providers: [StripeProvider, StripeWebhookService],
})
export class StripeModule {}
