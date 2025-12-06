dear-friend=Dear Friend
provider-description-text = Happy to see you in the JUNGLE 🌴

connect-button-label = Connect 📶
extend-button-label = Extend ➕
support-button-label = Need help?
home-button-label = Home 🏠
download-button-label = Install 🔽
back-button-label = ⤴ Back
payment-method-usd = 💰Visa/Master Card
payment-method-rub = 💳 MIR/SPB
payment-period-button-label-1 =  1  month ({ $amount }{ $currency })
payment-period-button-label-2 =  3  months ({ $amount }{ $currency })
payment-period-button-label-3 =  6  months ({ $amount }{ $currency })
pay-button-label = Pay 💳
add-profile-button-label = Add profile 🔗
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
    🆓 First 2 months free


    🌍 Available countries:
    ├ 🇳🇱 Netherlands
    ├ 🇩🇪 Germany
    ├ 🇷🇺 Russia
    └ More coming…


    { $isExpired ->
    [true]   🆘🆘🆘 <b>Your subscription has expired 🥲</b>
    *[false]  📅 <b>Subscription end date:</b>
    <blockquote>{ $validUntil } (MSK)</blockquote>
    }


devices-text =
    📱 <b>Choose the platform where you want to set up the VPN:</b>

    Next you’ll get instructions on how to install and configure it 🙂


payment-periods-text =
    <b>How long do you want to subscribe to the VPN?</b>

    <blockquote>If your subscription is active, the paid period will be added to the current one</blockquote>


payment-methods-text =
    You can pay any way you like!

    We accept 🇷🇺Russian and 💰International payment methods

payment-text =
    <b>As soon as you pay, come back to get the connection link</b>

    <blockquote>You’re paying <b>{ $amount }{ $currency }</b> for <b>{ $period }</b></blockquote>


subscription-text =
    📖 Setting up VPN on { $deviceLabel }:

    1️⃣ Install the «v2RayTun» app.
    <i>Tap the «Download» button</i>

    2️⃣ Tap «Add profile».

    <i>Choose the desired location and tap the connect button</i>


    <blockquote><code>{ $subUrl }</code></blockquote>

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

    You can easily manage it by clicking the button below