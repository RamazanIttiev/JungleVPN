import { BotContext } from '@bot/bot.types';
import { PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@user/user.model';
import { Api, Bot, GrammyError, RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';

export const isValidUsername = (username: string | undefined | null): boolean => {
  if (!username) return false;
  const regex = /^[A-Za-z0-9_-]+$/;
  return regex.test(username);
};

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

export const mapPeriodToDate = (period: PaymentPeriod | undefined) => {
  switch (period) {
    case 'month_1':
      return 1;
    case 'month_3':
      return 3;
    case 'month_6':
      return 6;
    default:
      return 1;
  }
};

export const mapPeriodLabelToPriceLabel = (period: PaymentPeriod) => {
  switch (period) {
    case 'month_1':
      return 'payment-period-button-label-1';
    case 'month_3':
      return 'payment-period-button-label-2';
    case 'month_6':
      return 'payment-period-button-label-3';
  }
};

export async function safeSendMessage(
  bot: Bot<BotContext, Api<RawApi>>,
  userId: number,
  content: string,
  options?: Other<RawApi, 'sendMessage', 'chat_id' | 'text'> | undefined,
  onBlocked?: (error: GrammyError) => Promise<void>,
) {
  try {
    await bot.api.sendMessage(userId, content, options);
  } catch (err) {
    const error = err as GrammyError;
    if (error.error_code === 403 && error.description.includes('bot was blocked')) {
      if (onBlocked) {
        await onBlocked(error);
      }
    } else {
      // rethrow other errors
      throw error;
    }
  }
}

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
