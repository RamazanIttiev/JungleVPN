import { BotContext } from '@bot/bot.types';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@user/user.model';
import { Api, Bot, GrammyError, RawApi } from 'grammy';
import { Other } from 'grammy/out/core/api';
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
    month: 'long',
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

export async function safeSendMessage(
  bot: Bot<BotContext, Api<RawApi>>,
  userId: number,
  content: string,
  options?: Other<RawApi, 'sendMessage', 'chat_id' | 'text'> | undefined,
  onBlocked?: () => Promise<void>,
) {
  try {
    await bot.api.sendMessage(userId, content, options);
  } catch (err) {
    const error = err as GrammyError;
    if (error.error_code === 403 && error.description.includes('bot was blocked')) {
      if (onBlocked) {
        await onBlocked();
      }
    } else {
      // rethrow other errors
      throw err;
    }
  }
}

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
