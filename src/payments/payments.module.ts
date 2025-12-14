import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { PaymentProviderFactory } from '@payments/payments.factory';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [PaymentsService, PaymentProviderFactory, YooKassaProvider, StripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
