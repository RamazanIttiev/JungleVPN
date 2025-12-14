import {
  YookassaPaymentStatus,
  YookassaWebhookPayload,
} from '@payments/providers/yookassa/yookassa.model';

export type PaymentPeriod = '1mo' | '3mo' | '6mo';
export type PaymentAmount = '99.00' | '149.00' | '499.00';
export type PaymentStatus = YookassaPaymentStatus;
export type PaymentWebhookPayload = YookassaWebhookPayload;
export type PaymentProvider = 'yookassa';
export type PaymentCurrency = 'RUB';

export interface PaymentMetadata {
  selectedPeriod: number;
  telegramId: number;
  telegramMessageId: number | undefined;
}

export interface WebhookResult {
  paymentId: string;
  status: PaymentStatus;
  event: string;
}

export interface IPaymentProvider {
  /**
   * Creates a payment link or invoice for the user.
   * @param dto - Required info like amount, currency, description, user ID, etc.
   * @returns A payment session object with provider-specific data (link, id, etc.)
   */
  createPayment: (dto: CreatePaymentDto, providerName: PaymentProvider) => Promise<PaymentSession>;

  isValidWebhookPayload: (payload: any) => boolean;

  parseWebhook: (payload: any) => WebhookResult;

  checkPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
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
