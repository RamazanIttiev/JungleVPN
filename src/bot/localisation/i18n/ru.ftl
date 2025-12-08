dear-friend = Дорогой друг!
provider-description-text = Рад видеть тебя в JUNGLE 🌴

connect-button-label = Подключиться 📶
extend-button-label = Продлить ➕
support-button-label = Нужна помощь?
back-button-label = ⤴ Назад
payment-period-button-label-1 = 1 месяц ({ $amount }{ $currency })
payment-period-button-label-2 = 3 месяца ({ $amount }{ $currency })
payment-period-button-label-3 = 6 месяцев ({ $amount }{ $currency })
payment-method-eur = 💶 Оплата в €
payment-method-rub = 💳 Оплата в ₽
profile-button-label = Профиль 👤
subscription-button-label = Автоплатеж 🔄
pay-button-label = Оплатить подписку 💳
home-button-label = Главное меню 🏠
chanel-button-label = Телеграм канал 🌟
download-button-label = Скачать 🔽
add-profile-button-label = Добавить профиль 🔗
new-link-button-label = Новая ссылка 🔄
broadcast-sent-success = ✅ Сообщение отправлено всем пользователям!
error-menu-outdated = Что-то изменилось, попробуй заново /start
payment-success = ✅ Оплата прошла успешно! Спасибо за вашу поддержку.
error-generic-restart = ❗ Что-то пошло не так. Попробуй снова /start
payment-not-found = ❗ Платеж не найден. Попробуй заново /start
payment-pending = ❗ Платеж еще не оплачен.
period-month_1 = 1 месяц
period-month_3 = 3 месяца
period-month_6 = 6 месяцев

days-left-label = { $daysLeft ->
    [one] { $daysLeft } день
    [few] { $daysLeft } дня
    *[many] { $daysLeft } дней
  }


main-text =
    🌴 Добро пожаловать в <b>Jungle</b>, <b>{ $username }</b>!

    В <code>JUNGLE</code> скорость и безопасность — на первом месте ❤️

    ⚡️Неограниченное количество трафика
    🆓Первые 2 месяца бесплатно


    🌍Доступные страны:
    ├ 🇳🇱 Нидерланды
    ├ 🇩🇪 Германия
    ├ 🇷🇺 Россия
    └ Дальше будет больше...


    { $isExpired ->
    [true]  🆘🆘🆘 <b>У тебя закончилась подписка 🥲</b>
    *[false]  📅 <b>Подписка закончится:</b>
    <blockquote>{ $expireAt } (МСК)</blockquote>
    }



devices-text =
    📱<b>Выбери платформу, на котором хочешь настроить VPN:</b>

    Дальше будет инструкция, как установить и настроить




payment-periods-text =
    <b>На какой срок хочешь подключить VPN?</b>

    <blockquote>Если подписка активна, то оплаченный период добавится к текущему</blockquote>


payment-methods-text =
    Плати любым удобным способом!

    Мы принимаем 🇷🇺Российские и 🌍Международные способы оплаты


payment-text =
    <b>Как только оплатишь, возвращайся обратно, чтобы получить ссылку на подключение</b>

    <blockquote>Ты платишь <b>{ $amount }{ $currency }</b> за <b>{ $period }</b></blockquote>



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



user-not-connected-24 =
    🌴🐵🌴

    Псст... Вижу ты еще не подключился

    Подключайся и наслаждайся безопасным интернетом



user-not-connected-72 =
    Вижу ты все еще не подключался 🥲

    Давай я помогу? Займет меньше минуты 🙂



torrent-warning =
    Внимание!

    В <code>Jungle</code> скачивание торрентов пока запрещено.

    <blockquote>Нарушение этого правила блокирует соединение на 5 минут. (Так будет каждый раз)</blockquote>

    Пожалуйста, используй VPN только для легальных целей и соблюдай правила сервиса.

    Спасибо за понимание!



invoice-payment-success-text =
    Оплата прошла успешно! 🙂

    Спасибо, что остаешься в <code>Jungle</code>

    Ты можешь управлять подпиской, нажав на кнопку ниже



profile-text =
    Тут ты можешь управлять своим профилем

    <blockquote>Автоплатеж</blockquote>
    Автоплатежи пока доступны только для международных способов оплаты



no-active-subscription-text =
    У тебя пока нет автоплатежа, но ты можешь активировать его оформив подписку с помощью международного способа оплаты



invoice-payment-failed-text =
    ❗ <b>Автоплатеж не прошел</b>

    Мы не смогли списать оплату за продление подписки.
    Пожалуйста, проверьте карту или обновите данные.

    Управлять подпиской можно в меню Профиль.