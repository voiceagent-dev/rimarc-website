import type { NextFunction, Request, RequestHandler, Response } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { Config } from "../config.js";

/** Strict security headers. Only our own scripts, styles, fonts and images are allowed. */
export function securityHeaders(cfg: Config): RequestHandler {
  const turnstile = cfg.TURNSTILE_SECRET_KEY ? ["https://challenges.cloudflare.com"] : [];
  const isProd = cfg.NODE_ENV === "production";
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", ...turnstile],
        styleSrc: ["'self'"],
        // Only style attributes (used for image placeholders), never <style> blocks.
        styleSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        // The forms can also post straight to the Google Apps Script that saves leads to the sheet.
        connectSrc: ["'self'", "https://script.google.com", "https://script.googleusercontent.com"],
        frameSrc: turnstile.length ? turnstile : ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
        ...(isProd ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    strictTransportSecurity: isProd ? { maxAge: 63072000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    xFrameOptions: { action: "deny" },
  });
}

/** Turns off browser features the site never uses. */
export const permissionsPolicy: RequestHandler = (_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  );
  next();
};

/**
 * Blocks cross-site form posts (CSRF): state-changing API calls must come from our own origin,
 * as JSON, with our custom header. Browsers won't send that combination from another site.
 */
export function requireSameOriginJson(cfg: Config): RequestHandler {
  const allowed = new Set(cfg.PUBLIC_ORIGINS);
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get("origin");
    if (!origin || !allowed.has(origin)) {
      res.status(403).json({ error: "Request not allowed." });
      return;
    }
    if (!req.is("application/json")) {
      res.status(415).json({ error: "Unsupported content type." });
      return;
    }
    if (req.get("x-requested-with") !== "rimarc-web") {
      res.status(403).json({ error: "Request not allowed." });
      return;
    }
    next();
  };
}

const limiterDefaults = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
};

export function createLimiters(cfg: Config) {
  return {
    api: rateLimit({ ...limiterDefaults, windowMs: 60_000, limit: cfg.RATE_LIMIT_API_PER_MINUTE }),
    demoCall: rateLimit({ ...limiterDefaults, windowMs: 60 * 60_000, limit: cfg.RATE_LIMIT_DEMO_PER_HOUR }),
    contact: rateLimit({ ...limiterDefaults, windowMs: 60 * 60_000, limit: cfg.RATE_LIMIT_CONTACT_PER_HOUR }),
    webhook: rateLimit({ ...limiterDefaults, windowMs: 60_000, limit: 120 }),
  };
}
export type Limiters = ReturnType<typeof createLimiters>;
