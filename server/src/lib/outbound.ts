import type { Config } from "../config.js";
import type { DemoCallInput } from "./schemas.js";

const TIMEOUT_MS = 10_000;

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "error",
  });
  return res;
}

/** Map the website's location choice to the value the voice agent's prompt expects. */
function toProspectLocation(location: DemoCallInput["location"]): string {
  switch (location) {
    case "India":
      return "India";
    case "Middle East":
      return "Middle East";
    default:
      return "Other country";
  }
}

export type CallResult = { ok: true; callId: string } | { ok: false; status: number };

/** Places the outbound demo call through Vapi. The API key never leaves the server. */
export async function startVapiCall(cfg: Config, input: DemoCallInput, e164: string): Promise<CallResult> {
  if (cfg.DEMO_CALL_MODE === "mock") return { ok: true, callId: "mock-call" };
  if (cfg.DEMO_CALL_MODE === "n8n") return sendToN8n(cfg, input, e164);

  const firstName = input.full_name.split(" ")[0] ?? input.full_name;
  const res = await postJson(
    "https://api.vapi.ai/call",
    {
      assistantId: cfg.VAPI_ASSISTANT_ID,
      phoneNumberId: cfg.VAPI_PHONE_NUMBER_ID,
      customer: { number: e164, name: input.full_name },
      assistantOverrides: {
        variableValues: {
          prospect_name: firstName,
          email: input.email,
          phone_number: e164,
          purpose: input.purpose,
          configuration: input.configuration,
          prospect_location: toProspectLocation(input.location),
          lead_source_line: "You'd requested a demo call on our website.",
        },
      },
    },
    { Authorization: `Bearer ${cfg.VAPI_API_KEY}` },
  );
  if (!res.ok) return { ok: false, status: res.status };
  const data = (await res.json().catch(() => ({}))) as { id?: unknown };
  return { ok: true, callId: typeof data.id === "string" ? data.id : "unknown" };
}

/** Sends data to an automation webhook (Make, n8n, Zapier), signed with a shared secret header. */
export async function forwardToWebhook(cfg: Config, url: string | undefined, payload: unknown): Promise<boolean> {
  if (!url) return false;
  const headers: Record<string, string> = {};
  if (cfg.OUTBOUND_WEBHOOK_SECRET) headers["X-Rimarc-Secret"] = cfg.OUTBOUND_WEBHOOK_SECRET;
  const res = await postJson(url, payload, headers);
  return res.ok;
}

/** Server-side check of a Cloudflare Turnstile token (only when Turnstile is configured). */
export async function verifyTurnstile(cfg: Config, token: string | undefined, ip: string | undefined): Promise<boolean> {
  if (!cfg.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const form = new URLSearchParams({ secret: cfg.TURNSTILE_SECRET_KEY, response: token });
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

/**
 * n8n mode: send the validated demo request to the n8n webhook, signed with X-Rimarc-Secret.
 * The n8n workflow places the Vapi call and logs the lead. Field names match the Vapi variables.
 */
async function sendToN8n(cfg: Config, input: DemoCallInput, e164: string): Promise<CallResult> {
  const firstName = input.full_name.split(" ")[0] ?? input.full_name;
  const res = await postJson(
    cfg.N8N_DEMO_WEBHOOK_URL!,
    {
      type: "demo-call-request",
      received_at: new Date().toISOString(),
      prospect_name: firstName,
      full_name: input.full_name,
      email: input.email,
      phone_number: e164,
      location: input.location,
      prospect_location: toProspectLocation(input.location),
      purpose: input.purpose,
      configuration: input.configuration,
      consent: true,
      source: "rimarcai.com demo form",
    },
    { "X-Rimarc-Secret": cfg.OUTBOUND_WEBHOOK_SECRET ?? "" },
  );
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, callId: "n8n" };
}
