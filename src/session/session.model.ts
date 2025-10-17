import { PaymentAmount, PaymentPeriod } from '@payments/payment.entity';
import { ClientDevice } from '@xui/xui.model';
import { SessionFlavor as GrammySessionFlavor } from 'grammy';

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  selectedDevice?: ClientDevice;
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
  };
};
