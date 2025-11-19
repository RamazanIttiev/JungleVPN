import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice, UserDto } from '@user/user.model';
import { Context, SessionFlavor as GrammySessionFlavor } from 'grammy';

export type BotContext = Context & SessionFlavor;

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  redirectUrl?: string;
  selectedDevice?: UserDevice;
  selectedAmount?: PaymentAmount;
  selectedPeriod?: PaymentPeriod;
  user: Partial<UserDto>;
}

export type SessionFlavor = GrammySessionFlavor<SessionData>;

export const initialSession = (): SessionData => {
  return {
    paymentUrl: undefined,
    paymentId: undefined,
    selectedDevice: undefined,
    selectedAmount: undefined,
    selectedPeriod: undefined,
    redirectUrl: undefined,
    user: {
      uuid: undefined,
      telegramId: undefined,
      username: undefined,
      expireAt: undefined,
      subscriptionUrl: undefined,
    },
  };
};
