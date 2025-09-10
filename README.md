## VPN MVP (Telegram Bot + Nest.js + WireGuard)

### Quick start

1. Start Postgres locally
```bash
docker compose up -d postgres
```

2. Create env files from examples in both apps (`backend/.env`, `bot/.env`).

3. Start backend then bot:
```bash
cd backend && npm i && npm run start:dev
# in another terminal
cd bot && npm i && npm run dev
```

### Stack
- Backend: Nest.js (TypeScript) + TypeORM + PostgreSQL
- Bot: grammY (TypeScript)
- WireGuard: server with `wg0` configured

### Flow (MVP)
- User starts bot → taps "Add device" → taps "Mock pay"
- Bot calls backend to create a payment and issue config
- Backend generates WireGuard keys, assigns next IP, updates `wg0.conf`, returns `.conf`
- Bot sends the `.conf` as a file to the user

### Notes
- Payment is mocked for MVP; replace with real PSP later (Stripe/YooKassa)
- Backend protects endpoints with simple API key
- WireGuard actions run via shell commands; can be toggled to "mock" mode in env

### Local testing with real VPS server

Run the backend locally and point generated client configs to your real VPS WireGuard server. This does NOT modify the VPS from local dev.

1. Ensure your VPS WireGuard (`wg0`) is running and you know:
   - `WG_SERVER_PUBLIC_IP` (public IP/hostname)
   - `WG_SERVER_PUBLIC_KEY` (server public key)
   - Subnet in use (e.g., `10.0.0.0/24`)

2. Backend env (`backend/.env`):
```env
PORT=3000
API_KEY=changeme-api-key
# Use compose Postgres port mapping here, adjust if needed
DATABASE_URL=postgres://vpn:vpn@localhost:5433/vpn

# WireGuard (pointing to real VPS)
WG_INTERFACE=wg0
WG_NETWORK_CIDR=10.0.0.0/24
WG_SERVER_PUBLIC_IP=YOUR_VPS_PUBLIC_IP
WG_SERVER_PUBLIC_KEY=YOUR_VPS_PUBLIC_KEY
WG_DNS=1.1.1.1,8.8.8.8
WG_ALLOWED_IPS=0.0.0.0/0, ::/0
# Keep mock=true for local so backend does NOT attempt to change VPS
WG_MOCK=true
```

Bot (`bot/.env`):
```env
TELEGRAM_BOT_TOKEN=YOUR_TOKEN
BACKEND_BASE_URL=http://localhost:3000/api
BACKEND_API_KEY=changeme-api-key
```

3. Start services:
```bash
docker compose up -d postgres
cd backend && npm i && npm run start:dev
```

4. Use the bot to create a device and receive a `.conf`. The config will include:
   - Client keys and IP allocated from `WG_NETWORK_CIDR`
   - Server public key/IP from env
   - DNS/AllowedIPs from env

5. To actually connect, you must add the client peer on the VPS manually (since `WG_MOCK=true` prevents auto-registration):
```ini
[Peer]
PublicKey = <CLIENT_PUBLIC_KEY>
AllowedIPs = <CLIENT_IP>/32
PersistentKeepalive = 25
```
Then reload WireGuard on the VPS:
```bash
sudo systemctl reload wg-quick@wg0
```

### API endpoints (Nest.js)
- `GET /api/users/ensure?telegramId=...` (API key) → ensures user exists
- `POST /api/payments/mock` (API key) body: `{ telegramId, amount? }` → creates paid payment, marks user active
- `GET /api/peers/issue?telegramId=...` (API key) → returns `{ filename, content }` WireGuard client config

# VPN
