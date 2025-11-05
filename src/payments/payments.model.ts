import { Payment } from '@payments/payment.entity';

export type PaymentPeriod = '1mo' | '3mo' | '6mo';
export type PaymentAmount = '99.00' | '149.00' | '499.00';
export type PaymentStatus = 'pending' | 'succeeded';
export type PaymentProvider = 'yookassa';
export type PaymentCurrency = 'RUB';

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
