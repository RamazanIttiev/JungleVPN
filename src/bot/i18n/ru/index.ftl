# ── Global placeables ─────────────────────────────────────
-name = { $username ->
*[no]  Dear friend!
[yes] {$username}
}

-sub-status = { $isExpired ->
*[false] 📅 <b>Subscription ends:</b>
<blockquote>{$validUntil} (MSK)</blockquote>
[true]  🆘🆘🆘
<b>Your subscription has expired 🥲</b>
}

# ── Main message ────────────────────────────────────────
main =
🌴 Welcome to <b>Jungle</b>, <b>{ -name }</b>!

In <code>JUNGLE</code> speed and security come first ♥️

⚡️ YouTube without ads
⚡️ Unlimited traffic
🆓 First 2 months free


🌍 Available countries:
├ 🇳🇱 Netherlands
├ 🇩🇪 Germany
├ 🇷🇺 Russia
└ More coming…

{ -sub-status }