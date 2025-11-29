export type PaymentProvider = 'yookassa' | 'stripe';
export type PaymentStatus = 'pending' | 'succeeded';

export type PaymentPeriod = '1mo' | '3mo' | '6mo';
export type PaymentAmount = '2' | '4' | '10';
export type PaymentCurrency = 'RUB' | 'USD';
export type PaymentNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';

export interface PaymentMetadata {
  selectedPeriod: number;
  telegramId: number;
  telegramMessageId: number | undefined;
}

export interface CreatePaymentDto {
  readonly userId: string;
  readonly payment: {
    provider: PaymentProvider;
    amount: PaymentAmount;
    currency: PaymentCurrency;
    description?: string;
  };
  readonly metadata?: Record<string, any>;
}

export type PaymentSession = {
  id: string;
  url: string;
};
