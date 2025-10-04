export const getMainContent = (options: { username: string | undefined }) => {
  return `
🌴 Добро пожаловать в Jungle, <b>${options.username || ''}</b>!

В <code>JUNGLE</code> скорость и безопасность — на первом месте.  

Твои данные здесь под надежной защитой. 🛡️
`;
};

export const getConnectionsPage = () => {
  return `📱 <b>Выбери платформу, на которой хочешь настроить VPN:</b>`;
};

export const getConnectionsContent = (options: { label: 'Mobile' | 'Macbook'; url: string }) => {
  const { url } = options;

  switch (options.label) {
    case 'Mobile':
      return `
🔗 <b>Установи приложение Hiddify</b>

🤖 <a href="https://play.google.com/store/apps/details?id=app.hiddify.com&pcampaignid=web_share">Google Play (Android)</a>  
🍏 <a href="https://apps.apple.com/ru/app/hiddify-proxy-vpn/id6596777532">AppStore (Россия)</a> | <a href="https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532">AppStore (Global)</a>  

<b>Скопируйте ссылку 👇</b>
<blockquote><code>${url}</code></blockquote>

🏃‍♂️ <b>Следуй инструкции по настройке</b>

      1. Открой Hiddify.  
      2. Нажми кнопку ➕.  
      3. Выбери «Add From Clipboard».  
      4. Подключайся!
      
✅ Готово! Ты подключен к быстрому и надежному VPN!

<span class="tg-spoiler">Одну ссылку можно использовать максимум на 2 устройствах.</span>
  `;
    case 'Macbook':
      return `
🔗 <b>Установи приложение Happ</b>

<a href="https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973">AppStore (Россия)</a> | <a href="https://apps.apple.com/us/app/happ-proxy-utility/id6504287215">AppStore (Global)</a>

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

// export const getMainContent = (options: { username: string | undefined }) => {
//   return `
// 🌴 Welcome to the Jungle, <b>${options.username || ''}</b>!
//
// Here in the Jungle, speed and security come first.
// Relax — your data is safe in our territory. 🛡️
// `;
// };
//
// export const getConnectionsPage = () => {
//   return `
// 📱 <b>Select your device</b>
//
// Choose the platform you want to set up the VPN on:
// `;
// };
//
// export const getConnectionsContent = (options: { label: 'Mobile' | 'Macbook'; url: string }) => {
//   const { url } = options;
//
//   switch (options.label) {
//     case 'Mobile':
//       return `
// 🔗 <b>Install the Hiddify app</b>
//
// 🤖 <a href="https://play.google.com/store/apps/details?id=app.hiddify.com&pcampaignid=web_share">Google Play (Android)</a>
// 🍏 <a href="https://apps.apple.com/ru/app/hiddify-proxy-vpn/id6596777532">AppStore (Russia)</a> | <a href="https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532">AppStore (Global)</a>
//
// <b>Copy the url 👇</b>
// <blockquote><code>${url}</code></blockquote>
//
// 🏃‍♂️ <b>Follow the setup guide</b>
//
//       1. Open Hiddify.
//       2. Tap the ➕ button.
//       3. Choose "Add From Clipboard".
//       4. Tap To Connect!
//
// Done! You are now connected to a fast and reliable VPN!
//
// <span class="tg-spoiler">Only 2 devices can use the same link.</span>
//   `;
//     case 'Macbook':
//       return `
// 🔗 <b>Install the Happ app from </b>
//
// <a href="https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973">AppStore (Russia)</a> | <a href="https://apps.apple.com/us/app/happ-proxy-utility/id6504287215">AppStore (Global)</a>
//
// <b>Copy the url 👇</b>
// <blockquote><code>${url}</code></blockquote>
//
// 🏃‍♂️ <b>Follow the setup guide</b>
//
//       1. Open Happ.
//       2. Tap the ➕ button.
//       2. Click "Import from clipboard".
//       4. Connect!
//
// Done! You are now connected to a fast and reliable VPN!
//
// <span class="tg-spoiler">Only 2 devices can use the same link.</span>
//   `;
//     default:
//       return url;
//   }
// };
