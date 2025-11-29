import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentProviderFactory } from './payments.factory';
import { CreatePaymentDto } from './payments.model';
import { StripeProvider } from './providers/stripe.provider';
import { YooKassaProvider } from './providers/yookassa.provider';

describe('Payment System', () => {
  let factory: PaymentProviderFactory;
  let stripeProvider: StripeProvider;
  let yookassaProvider: YooKassaProvider;

  beforeEach(() => {
    // Mock providers
    stripeProvider = new StripeProvider();
    yookassaProvider = new YooKassaProvider();

    // Manually inject dependencies
    factory = new PaymentProviderFactory(yookassaProvider, stripeProvider);
  });

  describe('PaymentProviderFactory', () => {
    it('should be defined', () => {
      expect(factory).toBeDefined();
    });

    it('should return stripe provider', () => {
      const provider = factory.getProvider('stripe');
      expect(provider).toBe(stripeProvider);
      expect(provider.id).toBe('stripe');
    });

    it('should return yookassa provider', () => {
      const provider = factory.getProvider('yookassa');
      expect(provider).toBe(yookassaProvider);
      expect(provider.id).toBe('yookassa');
    });

    it('should throw error for unknown provider', () => {
      expect(() => factory.getProvider('unknown')).toThrowError(
        'Unsupported payment provider: unknown',
      );
    });
  });

  describe('StripeProvider', () => {
    it('should return correct link for amount 2', async () => {
      process.env.STRIPE_SUB_LINK_1 = 'link_1';
      const dto: CreatePaymentDto = {
        userId: '1',
        payment: {
          amount: '2',
          currency: 'USD',
          provider: 'stripe',
        },
      };
      const result = await stripeProvider.createPayment(dto);
      expect(result.id).toBe('link_1');
      expect(result.url).toBe('link_1');
    });

    it('should return correct link for amount 4', async () => {
      process.env.STRIPE_SUB_LINK_2 = 'link_2';
      const dto: CreatePaymentDto = {
        userId: '1',
        payment: {
          amount: '4',
          currency: 'USD',
          provider: 'stripe',
        },
      };
      const result = await stripeProvider.createPayment(dto);
      expect(result.id).toBe('link_2');
      expect(result.url).toBe('link_2');
    });
  });
});
