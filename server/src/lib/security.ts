import { createHmac, timingSafeEqual } from "node:crypto";

/** Keyed hash so phone numbers and emails can be de-duplicated without storing them. */
export function keyedHash(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/** Constant-time comparison for shared secrets (prevents timing attacks). */
export function safeEqual(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * In-memory store that remembers a key for a fixed time (used for "one demo call per number per day").
 * Single-instance only: for several servers, replace with Redis using the same interface.
 */
export class TtlSet {
  private readonly items = new Map<string, number>();
  constructor(private readonly ttlMs: number, private readonly maxSize = 50_000) {}

  has(key: string, now = Date.now()): boolean {
    const exp = this.items.get(key);
    if (exp === undefined) return false;
    if (exp <= now) {
      this.items.delete(key);
      return false;
    }
    return true;
  }

  add(key: string, now = Date.now()): void {
    if (this.items.size >= this.maxSize) this.sweep(now);
    if (this.items.size >= this.maxSize) {
      const oldest = this.items.keys().next().value;
      if (oldest !== undefined) this.items.delete(oldest);
    }
    this.items.set(key, now + this.ttlMs);
  }

  delete(key: string): void {
    this.items.delete(key);
  }

  private sweep(now: number): void {
    for (const [k, exp] of this.items) if (exp <= now) this.items.delete(k);
  }
}

/** Is "now" inside the allowed calling window in the given time zone? */
export function withinCallingHours(timeZone: string, startHour: number, endHour: number, now = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now),
  );
  return hour >= startHour && hour < endHour;
}
