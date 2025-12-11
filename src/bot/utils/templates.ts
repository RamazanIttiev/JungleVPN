import * as process from 'node:process';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@user/user.model';
import {
  isValidUsername,
  mapAmountLabel,
  mapDaysLeftLabel,
  mapDeviceLabel,
  mapPeriodLabel,
  toDateString,
} from '@utils/utils';
import { differenceInCalendarDays } from 'date-fns';

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

const getSubStatusContent = (isExpired: boolean, validUntil: string) => {
  if (!isExpired) {
    return `📅 <b>Подписка закончится:</b>
<blockquote>${validUntil} по МСК</blockquote>`;
  } else {
    return `
🆘🆘🆘
<b>У тебя закончилась подписка 🥲</b>`;
  }
};

export const getMainPageContent = (options: {
  username: string;
  validUntil: string;
  isExpired: boolean;
}) => {
  const { username, validUntil, isExpired } = options;
  const name = isValidUsername(username) ? username : 'Дорогой друг!';

  return `
🌴 Добро пожаловать в <b>Jungle</b>, <b>${name}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте ♥️

⚡️️  Неограниченное количество трафика
🆓  Первые 2 месяца бесплатно


🌍 Доступные страны:
├ 🇳🇱 Нидерланды
├ 🇩🇪 Германия
├ 🇷🇺 Россия
└ Дальше будет больше...


${getSubStatusContent(isExpired, validUntil)}
`;
};

export const getDevicesPageContent = () => {
  return `
📱 <b>Выбери платформу, на котором хочешь настроить VPN:</b>

Дальше будет инструкция, как установить и настроить 🙂
`;
};

export const getPaymentPeriodsPage = () => {
  return `
<b>На какой срок хочешь подключить VPN?</b>

<blockquote>Если подписка активна, то оплаченный период добавится к текущему</blockquote>
`;
};

export const getPaymentPageContent = (period: PaymentPeriod, amount: PaymentAmount) => {
  return `
<b>Как только оплатишь, возвращайся обратно, чтобы получить ссылку на подключение</b>

<blockquote>Ты платишь <b>${mapAmountLabel(amount)}₽</b> за <b>${mapPeriodLabel(period)}</b></blockquote>
  `;
};

export const getSubscriptionPageContent = (options: {
  device: UserDevice | undefined;
  subUrl: string | undefined;
}) => {
  const { subUrl, device } = options;

  const deviceLink = getAppLink(device);
  const deviceLabel = mapDeviceLabel(device!);

  switch (device) {
    case 'ios':
    case 'android':
    case 'macOS':
    case 'windows':
      return `
📖 Подключение VPN на ${deviceLabel}:


1️⃣ Установи приложение <a href='${deviceLink}'>«v2RayTun»</a> 
<a>кнопка «🔽 Скачать»</a>

2️⃣ Нажми «🔗 Добавить профиль».

<i>Выбери нужную локацию и нажми кнопку подключения</i>



<blockquote><code>${subUrl}</code></blockquote>

<b> 🔗 Вот ссылка, если у тебя уже есть приложение</b>
  `;
    default:
      return subUrl || '';
  }
};

export const getExpiredSubscriptionContent = (expireAt: string) => {
  const formattedDate = toDateString(expireAt);
  const daysLeft = differenceInCalendarDays(new Date(expireAt), Date.now());

  switch (daysLeft) {
    case 1:
      return `
🌴Jungle напоминает:

<b>Твоя подписка закончится <blockquote>${formattedDate}</blockquote></b>


⏳У тебя еще есть <b>${mapDaysLeftLabel(daysLeft)}</b> 🙂
`;
    default:
      return `
У тебя только что истекла подписка. Это очень грустно 🥲

Но не переживай, ты можешь легко продлить её и продолжить пользоваться VPN 🙂

Снова жду тебя в Jungle! 🌴
`;
  }
};

export const getUserNotConnected24Content = () => {
  return `
🌴🐵🌴

Вижу ты еще не подключался 🥲

Давай я помогу? Займет меньше минуты 🙂
`;
};

export const getTorrentWarningContent = () => {
  return `
⚠️ Внимание!

В <code>Jungle</code> скачивание торрентов пока запрещено.

<blockquote>❗️ Нарушение этого правила блокирует соединение на 5 минут. (Так будет каждый раз)</blockquote>

Пожалуйста, используй VPN только для легальных целей и соблюдай правила сервиса.

Спасибо за понимание! 🙏
`;
};
