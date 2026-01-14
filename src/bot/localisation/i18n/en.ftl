dear-friend=Dear Friend
provider-description-text = Happy to see you in the JUNGLE 🌴

connect-button-label = Connect 📶
extend-button-label = Extend ➕
support-button-label = VPN is not working 🚨
support-chanel-button-label = Support
home-button-label = Home 🏠
profile-button-label = Profile 👤
invoice-button-label = Invoice 📄
subscription-button-label = Autopayment 🔄
download-button-label = Install 🔽
back-button-label = ⤴ Back
payment-method-eur = 💶 Pay in €
payment-method-rub = 💳 Pay in ₽
payment-period-button-label-1 =  1  month ({ $amount }{ $currency })
payment-period-button-label-2 =  3  months ({ $amount }{ $currency })
payment-period-button-label-3 =  6  months ({ $amount }{ $currency })
pay-button-label = Pay 💳
add-link-button-label = Add link 🔗
add-v2raytun-profile-button-label = Add to v2raytun 🔗
add-happ-profile-button-label = Add to Happ 🔗
new-link-button-label = New link 🔄
chanel-button-label = Telegram chanel 🌟
broadcast-sent-success = ✅ Message sent to all users!
payment-success = ✅ Payment successful! Thank you for your support.
error-menu-outdated = Something changed, try /start again
error-generic-restart = ❗ Something went wrong. Try /start again
payment-not-found = ❗ Payment not found. Try /start again
payment-pending = ❗ Payment is still pending.
period-month_1 = 1 month
period-month_3 = 3 months
period-month_6 = 6 months

days-left-label = { $daysLeft ->
    [one] { $daysLeft } day
    *[other] { $daysLeft } days
  }


main-text =
    🌴 Welcome to the <code>Jungle</code>, <b>{ $username }</b>!

    In the <code>JUNGLE</code> speed and security come first ❤️


    ⚡️ Unlimited traffic
    🆓 First { $trial_period } days are free


    🌍 Available countries:
    ╠ 🇳🇱 Netherlands
    ╠ 🇩🇪 Germany
    ╠ 🇷🇺 Russia
    ╚ More coming…


    { $isExpired ->
    [true]   🆘🆘🆘 <b>Your subscription has expired 🥲</b>
    *[false]  📅 <b>Subscription end date:</b>
    <blockquote>{ $expireAt } (MSK)</blockquote>
    }


devices-text =
    📱 <b>Choose the platform where you want to set up the VPN:</b>

    Next you’ll get instructions on how to install and configure it 🙂


payment-periods-text =
    <b>How long do you want to subscribe to the VPN?</b>

    <blockquote>If your subscription is active, the paid period will be added to the current one</blockquote>


payment-methods-text =
    You can pay any way you like!

    We accept 🇷🇺Russian and 🌍International payment methods

payment-text =
    <b>As soon as you pay, come back to get the connection link</b>

    <blockquote>You’re paying <b>{ $amount }{ $currency }</b> for <b>{ $period }</b></blockquote>


subscription-text =
    📖 Setting up VPN on { $deviceLabel }:

    1️⃣ Install the «{ $clientAppLabel }» app.
    <i>Tap the «Download» button</i>

    2️⃣ Tap «Add profile».

    <i>Choose the desired location and tap the connect button</i>


    <b><i>{ $subUrl }</i></b>

    <b>Here’s the link if you already have the app</b>



user-not-connected-24 =
    🌴🐵🌴

    Psst... You haven't connected yet
    Keep your data safe in the <code>Jungle</code>

    Connect and enjoy 🙂



user-not-connected-72 =
    You are still not connected

    Let me help you, it will take less then a minute 🙂



expired-subscription-text =
    { $daysLeft ->
    [1] <b>Your subscription expires <blockquote>{ $formattedDate }</blockquote></b>

    This is already in <b>{ $daysLeftLabel }</b> 😨

    To keep using the VPN, renew your subscription
    *[other] Jungle reminds you:

    <b>Your subscription expires <blockquote>{ $formattedDate }</blockquote></b>

    Only <b>{ $daysLeftLabel }</b> left
    }




torrent-warning-text =
    Warning!

    Downloading torrents is currently prohibited.

    <blockquote>Repeated violation of this rule will block your connection for 5 minutes. (Every time)</blockquote>

    Please use the VPN only for legal purposes and follow the service rules.

    Thank you for understanding!



invoice-payment-success-text =
    Your payment has been successful! 🙂

    Thank you for staying in the <code>Jungle</code>

    You can easily manage your subscription by clicking the button below

    📅 <b>New subscription end date:</b> 🌟
    <blockquote>{ $expireAt }</blockquote>



invoice-payment-failed-text =
    ❗ <b>Autopayment failed</b>

    We couldn't charge your card for the subscription renewal.
    Please check your payment method or update your card details.

    You can manage your subscription via the Profile menu.




profile-text =
    Here you can manage your profile.

    <blockquote>Autopayments</blockquote>
    Currently, autopayments are supported only for non-Russian payment methods.



no-active-subscription-text =
    You don't have any active autopayment set up.

    Currently, autopayments are supported only for non-Russian payment methods.

    Purchase a subscription via international payment method to enable autopayments.




support-text =
    So I guess it doesn't work 😭

    1️⃣ First of all, just try to update the subscription in the app, by pressing refresh 🔄icon near to service name <b><code>🌴JungleVPN</code></b>

    2️⃣ If that didn't help, delete old subscription and generate a new one (button below). Then import it as before

    3️⃣ In case non of above helped, contact the support team. It might be a temporary issue 🥲