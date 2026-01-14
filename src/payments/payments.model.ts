import { YookassaPaymentStatus } from '@payments/providers/yookassa/yookassa.model';
import Stripe from 'stripe';

export type PaymentProvider = 'yookassa' | 'stripe';
export type PaymentStatus = YookassaPaymentStatus | Stripe.Invoice.Status;

export type PaymentPeriod = 'month_1' | 'month_3' | 'month_6';
export type PaymentCurrency = 'RUB' | 'EUR';
export type PaymentNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';

export interface IPayment {
  id: string;
  userId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  provider: PaymentProvider;
  amount: number | null;
  currency: PaymentCurrency | null;
  status: PaymentStatus;
  url: string | null;
  invoiceUrl: string | null;
  paidAt: Date | null;
  metadata?: Record<string, any>;
}

export interface PaymentMetadata {
  selectedPeriod: number;
  telegramId: number;
  telegramMessageId: number | string | undefined;
}

export interface CreatePaymentDto {
  readonly userId: string;
  readonly payment: {
    readonly provider: PaymentProvider;
    readonly amount: number;
    readonly currency: PaymentCurrency;
    readonly description?: string;
  };
  readonly metadata?: Record<string, any>;
}

export type PaymentSession = {
  id: string;
  url: string;
  customer?: string | null;
};

export interface StripeInvoicePayload extends IPayment {
  metadata: Stripe.Metadata;
}
