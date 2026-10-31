# RIMARC AI website

Company website for **RIMARC AI** with live AI agent demos. The first demo, the AI Voice Sales Agent, lets a visitor fill in a form and receive a real call from the Vapi voice agent.

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7
- **Backend:** Node 22, Express 5, Zod 4 validation, Helmet, rate limiting, Pino logging
- **Images:** 17 Unsplash photos (free for commercial use), each used once, served as AVIF/WebP at 640–2400 px

## Run it locally

```bash
npm install
cp .env.example .env          # set HASH_SECRET (openssl rand -hex 32); keep DEMO_CALL_MODE=mock
# in .env for local use: NODE_ENV=development, PUBLIC_ORIGINS=http://localhost:5173
npm run dev                   # site on http://localhost:5173, API on :8080
npm test                      # 16 server tests (security headers, CSRF, validation, bots, duplicates...)
```

In `mock` mode the form works end to end, but no call is placed.

## Go live

1. Fill in `.env` on the server: `NODE_ENV=production`, your https `PUBLIC_ORIGINS`, `HASH_SECRET`, and the three `VAPI_*` values. Then set `DEMO_CALL_MODE=live`.
2. Build and start:
   ```bash
   npm ci && npm run build && npm start
   ```
   Or with Docker: `docker build -t rimarc-web . && docker run --env-file .env -p 8080:8080 rimarc-web`
3. Put the app behind HTTPS (Render, Railway, Fly.io, a VPS with Nginx/Caddy, or Cloudflare) and point `www.rimarcai.com` at it. Set `TRUST_PROXY=1` when there is a proxy in front.
4. In Vapi, set the server URL to `https://www.rimarcai.com/api/vapi/webhook`, with the secret from `VAPI_WEBHOOK_SECRET`. Call reports are then forwarded to `LEAD_WEBHOOK_URL` (for example a Make/n8n flow that writes the "Call Analysis Output" Google Sheet).

## What the demo form sends to Vapi

| Form field | Vapi variable |
|---|---|
| Full name (first name) | `prospect_name` |
| Email | `email` |
| Phone number (E.164) | `phone_number` and the number dialled |
| Location | `prospect_location` (India / Middle East / Other country) |
| What are you buying for? | `purpose` |
| Which home are you interested in? | `configuration` |

## Security built into the code

| Area | What's in place |
|---|---|
| Secrets | Vapi key and all credentials live only in server env vars; config is validated at start-up (weak `HASH_SECRET`, http origins in production, or missing Vapi keys in live mode stop the server) |
| Headers | Strict Content-Security-Policy (only our own scripts, styles, fonts, images; no inline scripts; no framing), HSTS with preload, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, Permissions-Policy blocking camera, microphone, location and payment, `X-Powered-By` removed |
| CSRF | API posts must come from an allowed origin, as JSON, with the `X-Requested-With: rimarc-web` header; no cookies are used |
| Input validation | Zod schemas with exact allowed values, length limits, Unicode-safe name rules, strict objects (unknown fields rejected), 16 KB body limit; error messages never echo user input |
| Phone numbers | Validated with libphonenumber, mobile numbers only, allowed countries only (`ALLOWED_CALL_COUNTRIES`) |
| Abuse and cost control | Per-IP rate limits (3 demo calls/hour, 5 contact messages/hour, 60 API requests/minute); one call per phone number and per email every 24 hours; calls only within 9 am–9 pm IST; honeypot field and minimum fill time to stop bots; optional Cloudflare Turnstile check on the server |
| Privacy | Nothing is stored in a database. Duplicate checks keep only a keyed HMAC-SHA256 fingerprint, for 24 hours. Logs record only method, path and status; phone numbers are masked and bodies are never logged |
| Webhooks | Vapi webhook protected by a shared secret, compared in constant time; outgoing webhooks carry `X-Rimarc-Secret` and refuse redirects; all outbound calls time out after 10 s |
| Server | Request and header timeouts against slow-client attacks, graceful shutdown, Docker image runs as a non-root user |
| Dependencies | Exact versions pinned; `npm audit --omit=dev` reports 0 vulnerabilities |

Notes:
- The duplicate check and rate limits are in memory, which suits one server. If you run several instances, move them to Redis.
- Turnstile is checked on the server when `TURNSTILE_SECRET_KEY` is set; the browser widget still needs to be added to the forms before you turn it on.

## Add a new demo

1. Add an entry to `client/src/data/demos.ts` (status `live`, image, link).
2. Create its page in `client/src/pages/` (copy `VoiceDemo.tsx` as a template) and add the route in `client/src/App.tsx`.
3. If it needs a backend action, add a route in `server/src/routes/` with its own Zod schema and rate limit.

## Images

`npm run images` downloads the photos listed in `scripts/optimize-images.mjs` and regenerates the AVIF/WebP files. Each photo slug is used in exactly one place on the site. (If Node can't reach Unsplash through a proxy, download the files into `scripts/.source-images/<slug>.jpg` first and rerun.)
