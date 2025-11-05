import { UserDevice } from '@bot/bot.types';
import { mapAmountLabel, mapPeriodLabel } from '@bot/utils/utils';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { isValidUsername } from '@utils/utils';

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
<blockquote>${validUntil}</blockquote>`;
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

В <code>JUNGLE</code> скорость и безопасность — на первом месте. ⚡️

${getSubStatusContent(isExpired, validUntil)}
`;
};

export const getNewUserMainPageContent = (options: { username: string | undefined }) => {
  return `
🌴 Добро пожаловать в Jungle, <b>${options.username || 'Дорогой друг'}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте. ⚡️

Твои данные здесь под надежной защитой. 🛡️

Первые 3 месяца бесплатно❤️
`;
};

export const getDevicesPageContent = () => {
  return `
📱 <b>Выбери платформу, на которой хочешь настроить VPN:</b>

___________________________

⚠️ Ознакомься с параметрами

📍 <b>Локация</b>: Амстердам, Нидерланды 🇳🇱 
🌐 <b>IP</b>: 144.124.231.221
🔒 <b>Протокол</b>: VLESS
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
<b>Как только оплатишь, возвращайся обратно, чтоб получить ссылку на подключение</b>

<blockquote>Ты платишь <b>${mapAmountLabel(amount)}₽</b> за <b>${mapPeriodLabel(period)}</b></blockquote>
  `;
};

export const getSubscriptionPageContent = (options: {
  device: UserDevice | undefined;
  subUrl: string | undefined;
}) => {
  const { subUrl, device } = options;

  const appDownloadLink = getAppLink(device);

  switch (device) {
    case 'ios':
    case 'android':
    case 'macOS':
    case 'windows':
      return `
<b>Установи приложение  <a href='${appDownloadLink}'>v2rayTun</a></b>

<b>Нажми «🔐Подключиться» 👇</b>


<blockquote><code>${subUrl}</code></blockquote>
<b>Если у тебя уже есть приложение 🔗</b>
  `;
    default:
      return subUrl || '';
  }
};
