import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@users/users.model';

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const mapDeviceLabel = (device: UserDevice) => {
  switch (device) {
    case 'ios':
      return '🍏 IOS';
    case 'android':
      return '🤖 Android';
    case 'macOS':
      return '💻 MacOS';
    case 'windows':
      return '🖥 Windows';
    default:
      return device;
  }
};

export const toDateString = (value: string) => {
  return new Date(value).toLocaleDateString('ru-EU', {
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
    case '1d':
      return '1 day';
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
    case '1d':
      return '1';
    case '1mo':
      return '1 месяц (199 ₽)';
    case '3mo':
      return '3 месяца (599 ₽)';
    case '6mo':
      return '6 месяцев (999 ₽)';
  }
};
