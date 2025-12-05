import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Payment])],
      providers: [
        StripeProvider,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService) => configService.get('STRIPE_API_KEY'),
          inject: [ConfigService],
        },
      ],
    };
  }
}
