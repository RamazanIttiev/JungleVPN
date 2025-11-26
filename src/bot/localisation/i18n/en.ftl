dear-friend=Dear Friend

main =
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
    *[false]  📅 <b>Subscription ends:</b>
    <blockquote>{ $validUntil } (MSK)</blockquote>
    }


devices-text =
    📱 <b>Choose the platform where you want to set up the VPN:</b>

    Next you’ll get instructions on how to install and configure it 🙂


payment-periods-text =
    <b>How long do you want to subscribe to the VPN?</b>

    <blockquote>If your subscription is active, the paid period will be added to the current one</blockquote>


payment-text =
    <b>As soon as you pay, come back here to get the connection link</b>

    <blockquote>You’re paying <b>{ $amount }₽</b> for <b>{ $period }</b></blockquote>


subscription-text =
    📖 Setting up VPN on { $deviceLabel }:

    1️⃣ Install the «v2RayTun» app.
    <i>Tap the «Download» button</i>

    2️⃣ Tap «Add profile».

    <i>Choose the desired location and tap the connect button</i>


    <blockquote><code>{ $subUrl }</code></blockquote>

    <b>Here’s the link if you already have the app</b>



user-not-connected =
    🌴🐵🌴

    Psst... You haven't connected yet
    Keep your data safe in the <code>Jungle</code>

    Connect and enjoy 🙂



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