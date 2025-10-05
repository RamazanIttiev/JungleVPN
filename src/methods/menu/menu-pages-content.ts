import { ClientDevice } from '../../modules/xui/xui.model';

export const getAppLink = (device: ClientDevice): string => {
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

export const getMainPageContent = (options: { username: string | undefined }) => {
  return `
🌴 Добро пожаловать в Jungle, <b>${options.username || ''}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте.  

Твои данные здесь под надежной защитой. 🛡️
`;
};

export const getConnectionsPageContent = () => {
  return `
📱 <b>Выбери платформу, на которой хочешь настроить VPN:</b>

___________________________

⚠️ Ознакомься с параметрами

📍 <b>Локация</b>: Амстердам, Нидерланды 🇳🇱 
🌐 <b>IP</b>: 144.124.231.221
🔒 <b>Протокол</b>: VLESS
`;
};

export const getDevicePageContent = (options: { device: ClientDevice; subUrl: string }) => {
  const { subUrl, device } = options;

  const appDownloadLink = getAppLink(device);

  switch (options.device) {
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
