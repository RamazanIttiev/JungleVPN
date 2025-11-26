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

⚡️️  YouTube без рекламы
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

  const deviceLabel = mapDeviceLabel(device!);

  switch (device) {
    case 'ios':
    case 'android':
    case 'macOS':
    case 'windows':
      return `
📖 Подключение VPN на ${deviceLabel}:


1️⃣ Установи приложение «v2RayTun». 
<i>кнопка «🔽 Скачать»</i>

2️⃣ Нажми «🔗 Добавить профиль».

<i>Выбери нужную локацию и нажми кнопку подключения</i>

3️⃣ Всё готово! 🎉 Интернет теперь под защитой JungleVPN.


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
<b>Твоя подписка закончится <blockquote>${formattedDate}</blockquote></b>

😱Это уже через <b>${mapDaysLeftLabel(daysLeft)}</b>


Чтобы продолжить пользоваться VPN, продли подписку 🙂
`;
    default:
      return `
🌴Jungle напоминает:

<b>Твоя подписка закончится <blockquote>${formattedDate}</blockquote></b>


⏳Осталось всего <b>${mapDaysLeftLabel(daysLeft)}</b>
      `;
  }
};

export const getUserNotConnectedContent = () => {
  return `
🌴🐵🌴

Псст... В <code>Jungle</code> youtube без рекламы!
А еще... В <code>Jungle</code> нет лимита на трафик!


Подключайся и наслаждайся безопасным интернетом 🙂
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
