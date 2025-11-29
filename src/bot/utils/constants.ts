import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';

export const paymentPeriods: PaymentPeriod[] = JSON.parse(
  process.env.PAYMENT_PERIODS || '["1mo", "3mo", "6mo"]',
);

export const paymentAmounts: PaymentAmount[] = JSON.parse(
  process.env.PAYMENT_AMOUNTS || '["2", "4", "10"]',
);
