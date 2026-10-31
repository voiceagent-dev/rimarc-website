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

## Go live on https://www.rimarcai.com (Render)

1. **Put the code on GitHub** in a private repository.
2. **Create the web service:** on [render.com](https://render.com), choose New → Web Service, connect the repository, and choose **Docker** (it uses the included `Dockerfile`). The paid "Starter" plan stays awake; the free plan sleeps after inactivity, so the first visitor waits about 30 seconds.
3. **Environment variables** (Render → Environment), from `.env.example`:
   - `NODE_ENV=production`, `TRUST_PROXY=1`
   - `PUBLIC_ORIGINS=https://rimarcai.com,https://www.rimarcai.com`
   - `CANONICAL_HOST=www.rimarcai.com`
   - `HASH_SECRET=` a random 64-character value (`openssl rand -hex 32`)
   - `DEMO_CALL_MODE=mock` until the phone line works, then `live` plus the three `VAPI_*` values and `VAPI_WEBHOOK_SECRET`
4. **Add the domain:** Render → Settings → Custom Domains → add `rimarcai.com` and `www.rimarcai.com`. Render shows the exact DNS records to create.
5. **DNS at your domain registrar:** create the records Render shows (normally an **A record** for `@`/`rimarcai.com` and a **CNAME** for `www` pointing to your `…onrender.com` address). Delete any old A, AAAA or CNAME records for `@` and `www` (for example the registrar's parking page).
6. **Wait for verification:** Render checks the records and issues the free HTTPS certificate automatically, usually within minutes, sometimes up to a few hours.
7. **Check:** open https://www.rimarcai.com, then https://rimarcai.com (should redirect to www), and https://www.rimarcai.com/api/health (should show `{"ok":true}`).
8. **Vapi call reports (optional):** set Vapi's server URL to `https://www.rimarcai.com/api/vapi/webhook`, with the same secret as `VAPI_WEBHOOK_SECRET`.

Any host that runs Docker or Node 22 works the same way (Railway, Fly.io, a VPS with Caddy or Nginx). Without Docker: `npm ci && npm run build && npm start`.

## Trigger an n8n workflow from the demo form

1. In n8n: **Workflows → Import from File** → `n8n/rimarc-demo-call.workflow.json`.
2. Create the three credentials it asks for:
   - **RIMARC website secret** (Header Auth): Name `X-Rimarc-Secret`, Value = a long random string.
   - **Vapi API key** (Header Auth): Name `Authorization`, Value `Bearer <your Vapi private key>`.
   - **Google Sheets account**: sign in with the Google account that owns "Call Analysis Output".
3. In **Start Vapi call**, replace `PASTE_VAPI_ASSISTANT_ID` and `PASTE_VAPI_PHONE_NUMBER_ID`.
4. **Activate** the workflow, open the **Website demo form** node and copy the **Production URL**.
5. In Render → Environment set `DEMO_CALL_MODE=n8n`, `N8N_DEMO_WEBHOOK_URL=<Production URL>` and `OUTBOUND_WEBHOOK_SECRET=<same value as the header credential>`.

The website validates everything first (phone, consent, duplicates, calling hours, rate limits), so n8n only receives clean, consented requests.

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
