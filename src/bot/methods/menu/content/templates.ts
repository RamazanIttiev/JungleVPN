import { mapAmountLabel, mapDeviceLabel, mapPeriodLabel, toDateString } from '@bot/methods/utils';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { UserDevice } from '@users/users.model';

export const getAppLink = (device: UserDevice): string => {
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
    default:
      return (
        process.env.IPHONE_APP_DOWNLOAD_LINK ||
        'https://apps.apple.com/pt/app/v2raytun/id6476628951?l=en-GB'
      );
  }
};

const getPaymentStatusContent = (isExpired: boolean, validUntil: number | undefined) => {
  if (!isExpired) {
    return `📅 <b>Подписка активна до:</b>
<blockquote>${toDateString(validUntil!)}</blockquote>`;
  } else {
    return `
🆘🆘🆘
<b>У тебя закончилась подписка 🥲</b>`;
  }
};

export const getMainPageContent = (options: {
  username: string | undefined;
  validUntil: number | undefined;
  isExpired: boolean;
  clients:
    | Array<{
        device: UserDevice;
      }>
    | undefined;
}) => {
  const { username, validUntil, clients } = options;

  const formattedClients = clients?.map((client) => `${mapDeviceLabel(client.device)}`).join('\n');

  return `
🌴 Добро пожаловать в <b>Jungle</b>, <b>${username || 'Дорогой друг'}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте. ⚡️

${getPaymentStatusContent(options.isExpired, options.validUntil)}


<b>Твои подключенные устройства:</b>
<blockquote>${formattedClients}</blockquote>
`;
};

export const getNewUserMainPageContent = (options: {
  username: string | undefined;
  isExpired: boolean;
}) => {
  return `
🌴 Добро пожаловать в Jungle, <b>${options.username || 'Дорогой друг'}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте.  

Твои данные здесь под надежной защитой. 🛡️
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

Если подписка активна, что оплаченный период добавится к текущему
`;
};

export const getPaymentPageContent = (period: PaymentPeriod, amount: PaymentAmount) => {
  return `
<b>Как только оплатишь, возвращайся обратно, чтоб получить ссылку на подключение</b>

<blockquote>Ты платишь <b>${mapAmountLabel(amount)}₽</b> за <b>${mapPeriodLabel(period)}</b></blockquote>
  `;
};

export const getConnectionPageContent = (options: { device: UserDevice; subUrl: string }) => {
  const { subUrl, device } = options;

  const appDownloadLink = getAppLink(device);

  switch (device) {
    case 'ios':
    case 'android':
    case 'macOS':
      return `
<b>Установи приложение  <a href='${appDownloadLink}'>v2rayTun</a></b>

<b>Нажми «🔐Подключиться» 👇</b>


<blockquote><code>${subUrl}</code></blockquote>
<b>Если у тебя уже есть приложение 🔗</b>

<span class="tg-spoiler">Одну ссылку можно использовать максимум на 2 устройствах.</span>
  `;
    default:
      return subUrl;
  }
};
