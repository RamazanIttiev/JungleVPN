import { I18nFlavor } from '@grammyjs/i18n';
import { PaymentPeriod, PaymentProvider } from '@payments/payments.model';
import { UserDevice, UserDto } from '@user/user.model';
import { Context, SessionFlavor as GrammySessionFlavor } from 'grammy';

export type BotContext = Context & SessionFlavor & I18nFlavor;

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  redirectUrl?: string;
  selectedDevice?: UserDevice;
  selectedProvider?: PaymentProvider;
  selectedPeriod?: PaymentPeriod;
  billingPortalUrl?: string;
  hasActiveSubscription?: boolean;
  user: Partial<UserDto>;
}

export type SessionFlavor = GrammySessionFlavor<SessionData>;

export const initialSession = (): SessionData => {
  return {
    paymentUrl: undefined,
    paymentId: undefined,
    selectedDevice: undefined,
    selectedPeriod: undefined,
    redirectUrl: undefined,
    billingPortalUrl: undefined,
    hasActiveSubscription: false,
    user: {
      uuid: undefined,
      telegramId: undefined,
      username: undefined,
      expireAt: undefined,
      subscriptionUrl: undefined,
    },
  };
};
