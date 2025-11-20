import { Payment } from '@payments/payment.entity';

export type PaymentPeriod = '1mo' | '3mo' | '6mo';
export type PaymentAmount = '99.00' | '149.00' | '499.00';
export type PaymentStatus = 'pending' | 'succeeded';
export type PaymentProvider = 'yookassa';
export type PaymentCurrency = 'RUB';
export type PaymentNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';

export interface PaymentDescription {
  selectedPeriod: 1 | 3 | 6;
  telegramId: number;
  telegramMessageId: number | undefined;
}

export interface PaymentPayload {
  id: string;
  status: 'waiting_for_capture' | 'succeeded' | 'canceled' | 'pending' | string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  authorization_details?: {
    rrn?: string;
    auth_code?: string;
    three_d_secure?: {
      applied: boolean;
    };
  };
  created_at: string; // ISO timestamp
  description?: string;
  expires_at?: string; // ISO timestamp
  metadata: Record<string, any>;
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    card?: {
      first6?: string;
      last4?: string;
      expiry_month?: string;
      expiry_year?: string;
      card_type?: string;
      issuer_country?: string;
      issuer_name?: string;
    };
    title?: string;
  };
  refundable: boolean;
  test: boolean;
}

export interface IPaymentProvider {
  /**
   * Creates a payment link or invoice for the user.
   * @param dto - Required info like amount, currency, description, user ID, etc.
   * @returns A payment session object with provider-specific data (link, id, etc.)
   */
  createPayment: (dto: CreatePaymentDto, providerName: PaymentProvider) => Promise<PaymentSession>;

  /**
   * Verifies the payment status (usually called after redirect or webhook).
   * @param paymentId - The provider-specific payment ID.
   * @returns PaymentStatus (e.g., 'pending', 'succeeded', 'failed').
   */
  checkPaymentStatus: (paymentId: string, providerName: PaymentProvider) => Promise<PaymentStatus>;

  updatePayment: (id: string, partial: Partial<Payment>) => Promise<void>;

  /**
   * Optional: Handles provider webhook callback.
   * Useful for asynchronous confirmation.
   */
  handleWebhook?: (data: any) => Promise<void>;
}

export class CreatePaymentDto {
  readonly userId: number;
  readonly amount: string;
  readonly currency: PaymentCurrency;
  readonly description?: string;
  readonly metadata?: Record<string, any>;
}

export type PaymentSession = {
  id: string;
  url: string;
};
