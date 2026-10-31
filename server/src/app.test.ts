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
    CANONICAL_HOST: "rimarcai.com",
  });
  server = createApp(cfg, createLogger("test")).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const goodForm = (over: Record<string, unknown> = {}) => ({
  full_name: "Rohan Mehta",
  email: "rohan@example.com",
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

test("www redirects to the main domain", async () => {
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
  const www = await get("www.rimarcai.com", "/about?x=1");
  assert.equal(www.status, 301);
  assert.equal(www.location, "https://rimarcai.com/about?x=1");
  const other = await get("evil.com", "/api/health");
  assert.equal(other.status, 200);
});
