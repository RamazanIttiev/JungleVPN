import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@user/user.model';
import { z } from 'zod';

export const isValidUsername = (username: string | undefined | null): boolean => {
  if (!username) return false;
  const regex = /^[A-Za-z0-9_-]+$/;
  return regex.test(username);
};

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
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
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

export const mapPeriodToDate = (period: PaymentPeriod | undefined) => {
  switch (period) {
    case '1mo':
      return 1;
    case '3mo':
      return 3;
    case '6mo':
      return 6;
    default:
      return 1;
  }
};

export const mapDaysLeftLabel = (daysLeft: number | undefined) => {
  switch (daysLeft) {
    case 1:
      return '1 день';
    case 2:
    case 3:
      return `${daysLeft} дня`;
    default:
      return `${daysLeft} дней`;
  }
};

export const mapPeriodLabelToPriceLabel = (period: PaymentPeriod) => {
  switch (period) {
    case '1mo':
      return '1️⃣ месяц (99 ₽)';
    case '3mo':
      return '3️⃣ месяца (159 ₽)';
    case '6mo':
      return '6️⃣ месяцев (499 ₽)';
  }
};

export const getAppLink = (device: UserDevice | undefined): string => {
  switch (device) {
    case 'ios':
      return (
        process.env.IPHONE_APP_DOWNLOAD_LINK ||
        'https://apps.apple.com/pt/app/v2raytun/id6476628951?l=en-GB'
      );
    case 'macOS':
      return (
        process.env.MACOS_APP_DOWNLOAD_LINK ||
        'https://apps.apple.com/pt/app/v2raytun/id6476628951?l=en-GB'
      );
    case 'android':
      return (
        process.env.ANDROID_APP_DOWNLOAD_LINK ||
        'https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ruB'
      );
    case 'windows':
      return (
        process.env.WINDOWS_APP_DOWNLOAD_LINK || 'https://storage.v2raytun.com/v2RayTun_Setup.exe'
      );
    default:
      return (
        process.env.IPHONE_APP_DOWNLOAD_LINK ||
        'https://apps.apple.com/pt/app/v2raytun/id6476628951?l=en-GB'
      );
  }
};

export const isValidValue = <T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): value is z.infer<T> => {
  return schema.safeParse(value).success;
};

export const getRandomNumber = (): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 90000000) + 100000;
};
