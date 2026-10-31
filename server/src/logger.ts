import { pino } from "pino";

// Logs never contain request bodies, cookies, auth headers or personal data.
export function createLogger(nodeEnv: string) {
  return pino({
    level: nodeEnv === "test" ? "silent" : nodeEnv === "production" ? "info" : "debug",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-vapi-secret']",
        "res.headers['set-cookie']",
        "*.email",
        "*.phone",
        "*.phone_number",
        "*.full_name",
      ],
      censor: "[redacted]",
    },
    transport: nodeEnv === "development" ? { target: "pino-pretty", options: { colorize: true } } : undefined,
  });
}

export type Logger = ReturnType<typeof createLogger>;

/** Shows only the last two digits, for support logs: +91******10 */
export function maskPhone(e164: string): string {
  return e164.length <= 5 ? "***" : e164.slice(0, 3) + "*".repeat(e164.length - 5) + e164.slice(-2);
}
