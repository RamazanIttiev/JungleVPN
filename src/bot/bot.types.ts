import { RouterLocation } from '@bot/navigation/core/conversations/conversations.types';
import { ConversationFlavor } from '@grammyjs/conversations';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { Context, SessionFlavor as GrammySessionFlavor } from 'grammy';

export type BotContext = ConversationFlavor<Context & SessionFlavor>;

export type UserDevice = 'ios' | 'android' | 'macOS' | 'windows';

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  subUrl?: string;
  redirectUrl?: string;
  selectedDevice?: UserDevice;
  selectedAmount?: PaymentAmount;
  selectedPeriod?: PaymentPeriod;
  location: RouterLocation;
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
    subUrl: undefined,
    location: 'main',
  };
};
