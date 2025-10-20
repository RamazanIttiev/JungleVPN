import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@users/users.model';

export const mapDeviceLabel = (device: UserDevice) => {
  switch (device) {
    case 'ios':
      return '🍏 IOS';
    case 'android':
      return '🤖 Android';
    case 'macOS':
      return '💻 macOS';
      case 'windows':
      return '🖥 windows';
    default:
      return device;
  }
};

export const toDateString = (timestamp: string) => {
  return new Date(Number(timestamp)).toLocaleDateString('ru-EU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const mapAmountLabel = (amount: PaymentAmount) => {
  return parseInt(amount, 10);
};

export const mapPeriodLabel = (period: PaymentPeriod) => {
  switch (period) {
    case '1mo':
      return '1 месяц';
    case '3mo':
      return '3 месяца';
    case '6mo':
      return '6 месяцев';
  }
};

export const mapPeriodLabelToPriceLabel = (period: PaymentPeriod) => {
  switch (period) {
    case '1mo':
      return '1 месяц (199 ₽)';
    case '3mo':
      return '3 месяца (599 ₽)';
    case '6mo':
      return '6 месяцев (999 ₽)';
  }
};
