import { PaymentNotificationEvent } from '@payments/payments.model';

export interface RemnaResponse<Data> {
  response: Data;
}

export type WebHookEvent =
  | 'user.expires_in_24_hours'
  | 'user.expires_in_48_hours'
  | 'user.expires_in_72_hours'
  | PaymentNotificationEvent;
