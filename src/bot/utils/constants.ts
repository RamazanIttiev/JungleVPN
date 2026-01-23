import * as process from 'node:process';
import { PaymentPeriod } from '@payments/payments.model';

export const paymentPeriods: PaymentPeriod[] = JSON.parse(
  process.env.PAYMENT_PERIODS || '["month_1", "month_3", "month_6"]',
);

export const PROD = 'prod';
export const STAGE = 'stage';
export const DEV = 'dev';
