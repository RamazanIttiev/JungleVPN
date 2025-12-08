import 'reflect-metadata';
import * as process from 'node:process';
import { Payment } from '@payments/payment.entity';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentProviderFactory } from './payments.factory';
import { CreatePaymentDto } from './payments.model';
import { StripeProvider } from './providers/stripe/stripe.provider';
import { YooKassaProvider } from './providers/yookassa.provider';

// Mock Stripe class
const mockSessionsCreate = vi.fn();
const mockCustomersSearch = vi.fn();
const mockSubscriptionsList = vi.fn();
const mockCustomersCreate = vi.fn();
const mockBillingPortalSessionsCreate = vi.fn();

vi.mock('@payments/payment.entity', () => {
  return {
    Payment: class {},
  };
});

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockSessionsCreate,
        },
      },
      customers: {
        search: mockCustomersSearch,
        create: mockCustomersCreate,
      },
      subscriptions: {
        list: mockSubscriptionsList,
      },
      billingPortal: {
        sessions: {
          create: mockBillingPortalSessionsCreate,
        },
      },
    })),
  };
});

describe('Payment System', () => {
  let factory: PaymentProviderFactory;
  let stripeProvider: StripeProvider;
  let yookassaProvider: YooKassaProvider;
  let paymentRepository: Repository<Payment>;
  let mockPaymentRepositoryFind: any;
  let mockPaymentRepositoryFindOne: any;
  let mockPaymentRepositoryUpdate: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaymentRepositoryFind = vi.fn();
    mockPaymentRepositoryFindOne = vi.fn();
    mockPaymentRepositoryUpdate = vi.fn();

    // Mock providers
    paymentRepository = {
      find: mockPaymentRepositoryFind,
      findOne: mockPaymentRepositoryFindOne,
      update: mockPaymentRepositoryUpdate,
    } as unknown as Repository<Payment>;
    stripeProvider = new StripeProvider(paymentRepository);
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
    it('should create session for amount 2 (new customer)', async () => {
      process.env.PRICE_EUR_MONTH_1 = '2';
      process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
      process.env.STRIPE_SECRET_KEY = 'sk_test';

      mockPaymentRepositoryFindOne.mockResolvedValue(null);
      mockCustomersCreate.mockResolvedValue({ id: 'cus_new' });
      mockSessionsCreate.mockResolvedValue({
        id: 'sess_123',
        url: 'https://checkout.stripe.com/sess_123',
      });

      const dto: CreatePaymentDto = {
        userId: '123',
        payment: {
          amount: 2,
          currency: 'EUR',
          provider: 'stripe',
        },
      };

      const result = await stripeProvider.createPayment(dto);

      expect(mockPaymentRepositoryFindOne).toHaveBeenCalled();
      expect(mockCustomersCreate).toHaveBeenCalled();
      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new',
          line_items: [{ price: 'price_1', quantity: 1 }],
          mode: 'subscription',
          metadata: expect.objectContaining({ telegramId: '123' }),
        }),
      );
      expect(result.id).toBe('cus_new');
      expect(result.url).toBe('https://checkout.stripe.com/sess_123');
    });

    it('should reuse customer if exists but no active subscription', async () => {
      process.env.PRICE_EUR_MONTH_1 = '2';
      process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
      process.env.STRIPE_SECRET_KEY = 'sk_test';

      mockPaymentRepositoryFindOne.mockResolvedValue({ stripeCustomerId: 'cus_existing' });
      mockSubscriptionsList.mockResolvedValue({ data: [] });
      mockSessionsCreate.mockResolvedValue({
        id: 'sess_456',
        url: 'https://checkout.stripe.com/sess_456',
      });

      const dto: CreatePaymentDto = {
        userId: '123',
        payment: {
          amount: 2,
          currency: 'EUR',
          provider: 'stripe',
        },
      };

      const result = await stripeProvider.createPayment(dto);

      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
          line_items: [{ price: 'price_1', quantity: 1 }],
          mode: 'subscription',
          metadata: expect.objectContaining({ telegramId: '123' }),
        }),
      );
      expect(result.id).toBe('cus_existing');
      expect(result.url).toBe('https://checkout.stripe.com/sess_456');
    });

    it('should return portal link if active subscription exists', async () => {
      process.env.PRICE_EUR_MONTH_1 = '2';
      process.env.STRIPE_PRICE_ID_MONTH_1 = 'price_1';
      process.env.STRIPE_SECRET_KEY = 'sk_test';

      mockPaymentRepositoryFindOne.mockResolvedValue({ stripeCustomerId: 'cus_active' });
      mockSubscriptionsList.mockResolvedValue({
        data: [{ status: 'active', cancel_at_period_end: false }],
      });
      mockBillingPortalSessionsCreate.mockResolvedValue({
        id: 'portal_123',
        url: 'https://billing.stripe.com/portal_123',
        customer: 'cus_active',
      });

      const dto: CreatePaymentDto = {
        userId: '123',
        payment: {
          amount: 2,
          currency: 'EUR',
          provider: 'stripe',
        },
      };

      const result = await stripeProvider.createPayment(dto);

      expect(mockSessionsCreate).not.toHaveBeenCalled();
      expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_active',
        }),
      );
      expect(result.id).toBe('cus_active');
      expect(result.url).toBe('https://billing.stripe.com/portal_123');
    });
  });
});
