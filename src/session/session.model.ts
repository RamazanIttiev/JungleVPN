import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@users/users.model';
import { SessionFlavor as GrammySessionFlavor } from 'grammy';

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  subUrl?: string;
  redirectUrl?: string;
  selectedDevice?: UserDevice;
  selectedAmount?: PaymentAmount;
  selectedPeriod?: PaymentPeriod;
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
  };
};
