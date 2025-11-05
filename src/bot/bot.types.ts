import { ConversationFlavor } from '@grammyjs/conversations';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { User } from '@remna/remna.model';
import { Context, SessionFlavor as GrammySessionFlavor } from 'grammy';

export type BotContext = ConversationFlavor<Context & SessionFlavor>;

export type UserDevice = 'ios' | 'android' | 'macOS' | 'windows';

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  redirectUrl?: string;
  selectedDevice?: UserDevice;
  selectedAmount?: PaymentAmount;
  selectedPeriod?: PaymentPeriod;
  user: Partial<User>;
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
