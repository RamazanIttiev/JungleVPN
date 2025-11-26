dear-friend = Дорогой друг!
connect-button-label = Подключиться 📶
extend-button-label = Продлить ➕
support-button-label = Нужна помощь?
back-button-label = ⤴ Назад
payment-period-button-label-1 = 1 месяц ({ $amount } { $currency })
payment-period-button-label-2 = 3 месяца ({ $amount } { $currency })
payment-period-button-label-3 = 6 месяцев ({ $amount } { $currency })
pay-button-label = 💳 Оплатить подписку
paid-button-label = Я оплатил ✅
main-menu-button-label = Главное меню 🏠
download-button-label = 🔽 Скачать
add-profile-button-label = 🔗 Добавить профиль
new-link-button-label = 🔄 Новая ссылка
broadcast-sent-success = ✅ Сообщение отправлено всем пользователям!
error-menu-outdated = Что-то изменилось, попробуй заново /start
payment-success = ✅ Оплата прошла успешно! Спасибо за вашу поддержку.
error-generic-restart = ❗ Что-то пошло не так. Попробуй снова /start
payment-not-found = ❗ Платеж не найден. Попробуй заново /start
payment-pending = ❗ Платеж еще не оплачен.
period-1mo = 1 месяц
period-3mo = 3 месяца
period-6mo = 6 месяцев
days-left-label = { $daysLeft ->
    [one] { $daysLeft } день
    [few] { $daysLeft } дня
    *[many] { $daysLeft } дней
  }


main-welcome =
    🌴 Добро пожаловать в <b>Jungle</b>, <b>{ $name }</b>!

    В <code>JUNGLE</code> скорость и безопасность — на первом месте ❤️

    ⚡️Неограниченное количество трафика
    🆓Первые 2 месяца бесплатно


    🌍Доступные страны:
    ├ Нидерланды
    ├ Германия
    ├ Россия
    └ Дальше будет больше...


    { $isExpired ->
    [true]  🆘🆘🆘 <b>У тебя закончилась подписка 🥲</b>
    *[false]  📅 <b>Подписка закончится:</b>
    <blockquote>{ $validUntil } (МСК)</blockquote>
    }



devices-page =
    📱<b>Выбери платформу, на котором хочешь настроить VPN:</b>

    Дальше будет инструкция, как установить и настроить




payment-periods-text =
    <b>На какой срок хочешь подключить VPN?</b>

    <blockquote>Если подписка активна, то оплаченный период добавится к текущему</blockquote>




payment-text =
    <b>Как только оплатишь, возвращайся обратно, чтобы получить ссылку на подключение</b>

    <blockquote>Ты платишь <b>{ $amount }₽</b> за <b>{ $period }</b></blockquote>




subscription-text =
    📖Подключение VPN на { $deviceLabel }:


    1️⃣ Установи приложение «v2RayTun».
    <i>кнопка «Скачать»</i>

    2️⃣ Нажми «Добавить профиль».

    <i>Выбери нужную локацию и нажми кнопку подключения</i>


    <blockquote><code>{ $subUrl }</code></blockquote>

    <b>Вот ссылка, если у тебя уже есть приложение</b>


expired-subscription-text =
    { $daysLeft ->
    [1] <b>Твоя подписка закончится <blockquote>{ $formattedDate }</blockquote></b>

    Это уже через <b>{ $daysLeftLabel }</b> 😨

    Чтобы продолжить пользоваться VPN, продли подписку
    *[other] Jungle напоминает:

    <b>Твоя подписка закончится <blockquote>{ $formattedDate }</blockquote></b>

    Осталось всего <b>{ $daysLeftLabel }</b>
    }



user-not-connected =
    🌴🐵🌴

    Псст... Вижу ты еще не подключился

    Подключайся и наслаждайся безопасным интернетом



torrent-warning =
    Внимание!

    В <code>Jungle</code> скачивание торрентов пока запрещено.

    <blockquote>Нарушение этого правила блокирует соединение на 5 минут. (Так будет каждый раз)</blockquote>

    Пожалуйста, используй VPN только для легальных целей и соблюдай правила сервиса.

    Спасибо за понимание!