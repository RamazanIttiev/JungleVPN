import { YookassaNotificationEvent } from '@payments/providers/yookassa/yookassa.model';

export interface RemnaResponse<Data> {
  response: Data;
}

export type WebHookEvent =
  | 'user.expired'
  | 'user.expires_in_24_hours'
  | 'user.expires_in_48_hours'
  | 'user.expires_in_72_hours'
  | 'user.expired_24_hours_ago'
  | YookassaNotificationEvent;
