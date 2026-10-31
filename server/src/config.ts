import { z } from "zod";

// All configuration comes from environment variables and is validated at start-up,
// so the server refuses to run with a missing or weak secret instead of failing later.
const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080),
    // Origins allowed to call the API, e.g. "https://rimarcai.com,https://www.rimarcai.com"
    PUBLIC_ORIGINS: z.string().default("http://localhost:5173,http://localhost:8080").transform(csv),
    // Main address. Visits to other hosts that end with it (e.g. www.rimarcai.com) are redirected here.
    CANONICAL_HOST: z.string().regex(/^[a-z0-9.-]+$/).optional(),
    // Number of proxies in front of the app (e.g. 1 behind a load balancer). Needed for correct client IPs.
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),

    // "mock" never places real calls (safe for local development); "live" calls Vapi.
    DEMO_CALL_MODE: z.enum(["mock", "live"]).default("mock"),
    VAPI_API_KEY: z.string().optional(),
    VAPI_ASSISTANT_ID: z.string().optional(),
    VAPI_PHONE_NUMBER_ID: z.string().optional(),
    VAPI_WEBHOOK_SECRET: z.string().optional(),

    // Secret used to hash phone numbers and emails for duplicate checks; raw values are never stored.
    HASH_SECRET: z.string().min(32, "HASH_SECRET must be at least 32 characters"),

    // ISO country codes we place demo calls to, e.g. "IN" or "IN,AE".
    ALLOWED_CALL_COUNTRIES: z.string().default("IN").transform((v) => csv(v).map((c) => c.toUpperCase())),
    CALL_TIMEZONE: z.string().default("Asia/Kolkata"),
    CALL_WINDOW_START_HOUR: z.coerce.number().int().min(0).max(23).default(9),
    CALL_WINDOW_END_HOUR: z.coerce.number().int().min(1).max(24).default(21),

    // Optional: Cloudflare Turnstile bot protection.
    TURNSTILE_SECRET_KEY: z.string().optional(),

    // Optional: forward contact messages and call results to an automation (Make, n8n, Zapier).
    CONTACT_WEBHOOK_URL: z.string().url().optional(),
    LEAD_WEBHOOK_URL: z.string().url().optional(),
    OUTBOUND_WEBHOOK_SECRET: z.string().optional(),

    // Per-IP limits. Keep the defaults in production.
    RATE_LIMIT_API_PER_MINUTE: z.coerce.number().int().min(1).default(60),
    RATE_LIMIT_DEMO_PER_HOUR: z.coerce.number().int().min(1).default(3),
    RATE_LIMIT_CONTACT_PER_HOUR: z.coerce.number().int().min(1).default(5),

    CLIENT_DIST: z.string().default("../client/dist"),
  })
  .superRefine((env, ctx) => {
    if (env.DEMO_CALL_MODE === "live") {
      for (const key of ["VAPI_API_KEY", "VAPI_ASSISTANT_ID", "VAPI_PHONE_NUMBER_ID"] as const) {
        if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when DEMO_CALL_MODE=live` });
      }
    }
    if (env.NODE_ENV === "production" && env.PUBLIC_ORIGINS.some((o) => o.startsWith("http://"))) {
      ctx.addIssue({ code: "custom", path: ["PUBLIC_ORIGINS"], message: "Production origins must use https" });
    }
    if (env.CALL_WINDOW_END_HOUR <= env.CALL_WINDOW_START_HOUR) {
      ctx.addIssue({ code: "custom", path: ["CALL_WINDOW_END_HOUR"], message: "End hour must be after start hour" });
    }
  });

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid configuration:\n${issues}`);
  }
  return parsed.data;
}
