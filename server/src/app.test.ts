import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApp } from "./app.js";
import { checkPhone } from "./lib/phone.js";
import { TtlSet, withinCallingHours } from "./lib/security.js";

const ORIGIN = "http://localhost:5173";
let server: Server;
let base = "";

before(async () => {
  const cfg = loadConfig({
    NODE_ENV: "test",
    HASH_SECRET: "test-secret-that-is-long-enough-123456",
    DEMO_CALL_MODE: "mock",
    CALL_WINDOW_START_HOUR: "0",
    CALL_WINDOW_END_HOUR: "24",
    RATE_LIMIT_DEMO_PER_HOUR: "100",
    RATE_LIMIT_CONTACT_PER_HOUR: "100",
    RATE_LIMIT_API_PER_MINUTE: "1000",
    VAPI_WEBHOOK_SECRET: "webhook-secret",
    CLIENT_DIST: "/nonexistent",
    CANONICAL_HOST: "www.rimarcai.com",
  });
  server = createApp(cfg, createLogger("test")).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const goodForm = (over: Record<string, unknown> = {}) => ({
  full_name: "Stevie Mehta",
  email: "stevie@example.com",
  dial_code: "+91",
  phone_number: "98765 43210",
  location: "India",
  purpose: "Investment",
  configuration: "2 Bedroom",
  consent: true,
  company_website: "",
  elapsed_ms: 8000,
  ...over,
});

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, "X-Requested-With": "rimarc-web", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("security headers are set", async () => {
  const res = await fetch(base + "/api/health");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-security-policy") ?? "", /default-src 'self'/);
  assert.match(res.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
  assert.match(res.headers.get("permissions-policy") ?? "", /microphone=\(\)/);
  assert.equal(res.headers.get("x-powered-by"), null);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("rejects requests from another origin (CSRF)", async () => {
  const res = await post("/api/demo-call", goodForm(), { Origin: "https://evil.example" });
  assert.equal(res.status, 403);
});

test("rejects missing custom header", async () => {
  const res = await post("/api/demo-call", goodForm(), { "X-Requested-With": "" });
  assert.equal(res.status, 403);
});

test("rejects non-JSON bodies", async () => {
  const res = await fetch(base + "/api/demo-call", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: ORIGIN, "X-Requested-With": "rimarc-web" },
    body: "full_name=x",
  });
  assert.equal(res.status, 415);
});

test("rejects oversized bodies", async () => {
  const res = await post("/api/demo-call", goodForm({ full_name: "a".repeat(20_000) }));
  assert.equal(res.status, 413);
});

test("rejects unknown fields and invalid choices", async () => {
  assert.equal((await post("/api/demo-call", goodForm({ admin: true }))).status, 400);
  assert.equal((await post("/api/demo-call", goodForm({ configuration: "Castle" }))).status, 400);
  assert.equal((await post("/api/demo-call", goodForm({ full_name: "<script>alert(1)</script>" }))).status, 400);
  assert.equal((await post("/api/demo-call", goodForm({ consent: false }))).status, 400);
});

test("rejects bots (honeypot and instant submit)", async () => {
  assert.equal((await post("/api/demo-call", goodForm({ company_website: "spam.com" }))).status, 400);
  assert.equal((await post("/api/demo-call", goodForm({ elapsed_ms: 100 }))).status, 400);
});

test("rejects numbers outside the allowed countries", async () => {
  const res = await post("/api/demo-call", goodForm({ dial_code: "+44", phone_number: "7400 123456", email: "uk@example.com" }));
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error: string };
  assert.match(body.error, /Indian mobile numbers only/);
});

test("accepts a valid request once, then blocks duplicates for 24h", async () => {
  const first = await post("/api/demo-call", goodForm());
  assert.equal(first.status, 202);
  const again = await post("/api/demo-call", goodForm({ email: "other@example.com" }));
  assert.equal(again.status, 429);
});

test("error responses never echo user input", async () => {
  const res = await post("/api/demo-call", goodForm({ full_name: "Robert'); DROP TABLE--" }));
  const text = await res.text();
  assert.ok(!text.includes("DROP TABLE"));
});

test("contact form validates and accepts", async () => {
  assert.equal((await post("/api/contact", { full_name: "A B", email: "x" })).status, 400);
  const ok = await post("/api/contact", {
    full_name: "Priya Shah",
    email: "priya@example.com",
    company: "Acme",
    message: "We'd like a voice agent for our clinic.",
    consent: true,
    company_website: "",
    elapsed_ms: 9000,
  });
  assert.equal(ok.status, 202);
});

test("Vapi webhook requires the shared secret", async () => {
  const body = { message: { type: "end-of-call-report", call: { id: "c1" } } };
  const bad = await fetch(base + "/api/vapi/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vapi-secret": "wrong" },
    body: JSON.stringify(body),
  });
  assert.equal(bad.status, 401);
  const good = await fetch(base + "/api/vapi/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vapi-secret": "webhook-secret" },
    body: JSON.stringify(body),
  });
  assert.equal(good.status, 200);
});

test("phone checks", () => {
  assert.deepEqual(checkPhone("+91", "98765 43210", ["IN"]), { ok: true, e164: "+919876543210", country: "IN" });
  assert.equal(checkPhone("+91", "12345", ["IN"]).ok, false);
  assert.equal(checkPhone("+44", "7400123456", ["IN"]).ok, false);
});

test("TTL set expires entries", () => {
  const s = new TtlSet(1000);
  s.add("k", 0);
  assert.equal(s.has("k", 500), true);
  assert.equal(s.has("k", 1500), false);
});

test("calling hours", () => {
  const noonIst = new Date("2026-10-31T06:30:00Z");
  const lateIst = new Date("2026-10-31T17:00:00Z");
  assert.equal(withinCallingHours("Asia/Kolkata", 9, 21, noonIst), true);
  assert.equal(withinCallingHours("Asia/Kolkata", 9, 21, lateIst), false);
});

test("config refuses weak secrets and http origins in production", () => {
  assert.throws(() => loadConfig({ HASH_SECRET: "short" }));
  assert.throws(() =>
    loadConfig({ NODE_ENV: "production", HASH_SECRET: "x".repeat(40), PUBLIC_ORIGINS: "http://rimarcai.com" }),
  );
  assert.throws(() => loadConfig({ HASH_SECRET: "x".repeat(40), DEMO_CALL_MODE: "live" }));
});

test("bare domain redirects to www", async () => {
  const { request } = await import("node:http");
  const get = (host: string, path: string) =>
    new Promise<{ status: number; location?: string }>((resolve, reject) => {
      const req = request(base + path, { headers: { Host: host } }, (res) => {
        res.resume();
        resolve({ status: res.statusCode ?? 0, location: res.headers.location });
      });
      req.on("error", reject);
      req.end();
    });
  const bare = await get("rimarcai.com", "/about?x=1");
  assert.equal(bare.status, 301);
  assert.equal(bare.location, "https://www.rimarcai.com/about?x=1");
  const main = await get("www.rimarcai.com", "/api/health");
  assert.equal(main.status, 200);
  const other = await get("evil.com", "/api/health");
  assert.equal(other.status, 200);
});

test("n8n mode forwards a signed, validated request to the n8n webhook", async () => {
  const { createServer } = await import("node:http");
  let received: { headers: Record<string, unknown>; body: Record<string, unknown> } | undefined;
  const n8n = createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      received = { headers: req.headers, body: JSON.parse(raw) };
      res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
    });
  }).listen(0);
  await new Promise((r) => n8n.once("listening", r));
  const hookUrl = `http://127.0.0.1:${(n8n.address() as AddressInfo).port}/webhook/rimarc-demo-call`;

  const cfg = loadConfig({
    NODE_ENV: "test",
    HASH_SECRET: "test-secret-that-is-long-enough-123456",
    DEMO_CALL_MODE: "n8n",
    N8N_DEMO_WEBHOOK_URL: hookUrl,
    OUTBOUND_WEBHOOK_SECRET: "n8n-shared-secret-0123456789",
    CALL_WINDOW_START_HOUR: "0",
    CALL_WINDOW_END_HOUR: "24",
    CLIENT_DIST: "/nonexistent",
  });
  const app = createApp(cfg, createLogger("test")).listen(0);
  await new Promise((r) => app.once("listening", r));
  const url = `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/demo-call`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, "X-Requested-With": "rimarc-web" },
    body: JSON.stringify(goodForm({ email: "n8n@example.com", phone_number: "91234 56789" })),
  });
  app.close();
  n8n.close();

  assert.equal(res.status, 202);
  assert.ok(received, "n8n webhook was called");
  assert.equal(received.headers["x-rimarc-secret"], "n8n-shared-secret-0123456789");
  assert.equal(received.body.phone_number, "+919123456789");
  assert.equal(received.body.prospect_name, "Stevie");
  assert.equal(received.body.configuration, "2 Bedroom");
  assert.equal(received.body.type, "demo-call-request");
});

test("n8n mode refuses to start without a webhook URL and secret", () => {
  assert.throws(() => loadConfig({ HASH_SECRET: "x".repeat(40), DEMO_CALL_MODE: "n8n" }));
  assert.throws(() =>
    loadConfig({ HASH_SECRET: "x".repeat(40), DEMO_CALL_MODE: "n8n", N8N_DEMO_WEBHOOK_URL: "https://x.app.n8n.cloud/webhook/a" }),
  );
});

test("serves pre-rendered pages, trims trailing slashes and returns a real 404", async () => {
  const { mkdtemp, mkdir, writeFile } = await import("node:fs/promises");
  const os = await import("node:os");
  const path = await import("node:path");
  const dir = await mkdtemp(path.join(os.tmpdir(), "rimarc-dist-"));
  await mkdir(path.join(dir, "about"), { recursive: true });
  await writeFile(path.join(dir, "index.html"), "<p>home page</p>");
  await writeFile(path.join(dir, "about", "index.html"), "<p>about page</p>");
  await writeFile(path.join(dir, "404.html"), "<p>not found page</p>");

  const cfg = loadConfig({ NODE_ENV: "test", HASH_SECRET: "test-secret-that-is-long-enough-123456", CLIENT_DIST: dir });
  const app = createApp(cfg, createLogger("test")).listen(0);
  await new Promise((r) => app.once("listening", r));
  const site = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
  try {
    const home = await fetch(site + "/");
    assert.equal(home.status, 200);
    assert.match(await home.text(), /home page/);
    const about = await fetch(site + "/about");
    assert.equal(about.status, 200);
    assert.match(await about.text(), /about page/);
    assert.equal(about.headers.get("cache-control"), "no-cache");
    const slash = await fetch(site + "/about/?ref=x", { redirect: "manual" });
    assert.equal(slash.status, 301);
    assert.equal(slash.headers.get("location"), "/about?ref=x");
    const missing = await fetch(site + "/no-such-page");
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /not found page/);
    assert.equal((await fetch(site + "/../etc/passwd")).status, 404);
  } finally {
    app.close();
  }
});

test("sheet mode saves the request to the Google Sheet script and places no call", async () => {
  const { createServer } = await import("node:http");
  let received: Record<string, unknown> | undefined;
  let accept = true;
  // Imitates Apps Script: the POST is answered with a redirect, and the output is served at the new address.
  const script = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/macros/s/abc/exec") {
      let raw = "";
      req.on("data", (c) => (raw += c));
      req.on("end", () => {
        received = JSON.parse(raw);
        res.writeHead(302, { Location: "/echo" }).end();
      });
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: accept }));
  }).listen(0);
  await new Promise((r) => script.once("listening", r));
  const url = `http://127.0.0.1:${(script.address() as AddressInfo).port}/macros/s/abc/exec`;

  const cfg = loadConfig({
    NODE_ENV: "test",
    HASH_SECRET: "test-secret-that-is-long-enough-123456",
    DEMO_CALL_MODE: "sheet",
    SHEET_WEBHOOK_URL: url,
    OUTBOUND_WEBHOOK_SECRET: "sheet-shared-secret-0123456789",
    // Outside calling hours: sheet mode must still accept the request.
    CALL_WINDOW_START_HOUR: "0",
    CALL_WINDOW_END_HOUR: "1",
    CLIENT_DIST: "/nonexistent",
  });
  const app = createApp(cfg, createLogger("test")).listen(0);
  await new Promise((r) => app.once("listening", r));
  const api = `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/demo-call`;
  const send = (over: Record<string, unknown>) =>
    fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN, "X-Requested-With": "rimarc-web" },
      body: JSON.stringify(goodForm(over)),
    });
  try {
    // A UAE mobile number is fine in sheet mode, because nothing is dialled.
    const ok = await send({ email: "sheet@example.com", dial_code: "+971", phone_number: "50 123 4567", location: "Middle East" });
    assert.equal(ok.status, 202);
    assert.match(((await ok.json()) as { message: string }).message, /received your details/);
    assert.ok(received, "sheet script was called");
    assert.equal(received.secret, "sheet-shared-secret-0123456789");
    assert.equal(received.full_name, "Stevie Mehta");
    assert.equal(received.phone_number, "+971501234567");
    assert.equal(received.location, "Middle East");

    accept = false; // the script refuses (for example, a wrong secret)
    const refused = await send({ email: "sheet2@example.com", phone_number: "91234 56780" });
    assert.equal(refused.status, 502);
    assert.match(((await refused.json()) as { error: string }).error, /couldn't save/);
  } finally {
    app.close();
    script.close();
  }
});

test("sheet mode refuses to start without the script URL and secret", () => {
  assert.throws(() => loadConfig({ HASH_SECRET: "x".repeat(40), DEMO_CALL_MODE: "sheet" }));
  assert.throws(() =>
    loadConfig({ HASH_SECRET: "x".repeat(40), DEMO_CALL_MODE: "sheet", SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/a/exec" }),
  );
});
