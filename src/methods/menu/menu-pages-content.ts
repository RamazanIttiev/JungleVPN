import { ClientDevice } from '../../modules/xui/xui.model';

export const getMainPageContent = (options: { username: string | undefined }) => {
  return `
🌴 Добро пожаловать в Jungle, <b>${options.username || ''}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте.  

Твои данные здесь под надежной защитой. 🛡️
`;
};

export const getConnectionsPageContent = () => {
  return `📱 <b>Выбери платформу, на которой хочешь настроить VPN:</b>`;
};

export const getDevicePageContent = (options: { device: ClientDevice; url: string }) => {
  const { url } = options;

  switch (options.device) {
    case 'ios':
      return `
<b>Установи приложение  <a href="https://apps.apple.com/pt/app/v2box-v2ray-client/id6446814690?l=en-GB">V2box</a></b>

<b>Нажми ссылку 👇. Она скопируется</b>

<blockquote><code>${url}</code></blockquote>

🏃‍♂️ <b>Следуй инструкции по настройке V2box</b>

      1. Открой V2box.  
      2. На панели снизу перейди в раздел "Configurations"
      3. Найди там иконку ➕.  
      4. Выбери «Import from clipboard» 🔗.  
      5. Подключайся!
      
✅ Готово! Ты подключен к быстрому и надежному VPN!

<span class="tg-spoiler">Одну ссылку можно использовать максимум на 2 устройствах.</span>
  `;
    case 'android':
      return `
🤖 <b>Установи приложение <a href="https://play.google.com/store/apps/details?id=app.hiddify.com&pcampaignid=web_share">Hiddify</a></b>

<b>Нажми ссылку 👇. Она скопируется</b>

<blockquote><code>${url}</code></blockquote>

🏃‍♂️ <b>Следуй инструкции по настройке</b>

      1. Открой Hiddify.  
      2. Нажми кнопку ➕.  
      3. Выбери «Add From Clipboard».  
      4. Подключайся!
      
✅ Готово! Ты подключен к быстрому и надежному VPN!

<span class="tg-spoiler">Одну ссылку можно использовать максимум на 2 устройствах.</span>
  `;
    case 'macbook':
      return `
🔗 <b>Установи приложение <a href="https://apps.apple.com/us/app/happ-proxy-utility/id6504287215">Happ</a></b>

<b>Скопируй ссылку 👇</b>

<blockquote><code>${url}</code></blockquote>

🏃‍♂️ <b>Следуй инструкции по настройке</b>

      1. Открой Happ.  
      2. Нажми кнопку ➕.  
      3. Выбери «Import from clipboard».  
      4. Подключайся!
      
✅ Готово! Ты подключен к быстрому и надежному VPN!

<span class="tg-spoiler">Одну ссылку можно использовать максимум на 2 устройствах.</span>
  `;
    default:
      return url;
  }
};
