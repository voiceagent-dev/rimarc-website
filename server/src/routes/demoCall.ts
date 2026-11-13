import { Router } from "express";
import type { Config } from "../config.js";
import type { Logger } from "../logger.js";
import { maskPhone } from "../logger.js";
import { DemoCallSchema } from "../lib/schemas.js";
import { checkPhone } from "../lib/phone.js";
import { keyedHash, TtlSet, withinCallingHours } from "../lib/security.js";
import { startVapiCall, verifyTurnstile } from "../lib/outbound.js";
import type { Limiters } from "../middleware/security.js";
import { firstIssue } from "./util.js";

const DAY = 24 * 60 * 60 * 1000;
const MIN_FILL_MS = 2500;

export function demoCallRouter(cfg: Config, log: Logger, limiters: Limiters) {
  const router = Router();
  // One demo call per phone number and per email address every 24 hours.
  const recentPhones = new TtlSet(DAY);
  const recentEmails = new TtlSet(DAY);

  router.post("/demo-call", limiters.demoCall, async (req, res) => {
    const parsed = DemoCallSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) });
      return;
    }
    const input = parsed.data;

    // Bots: filled the hidden field or submitted faster than a person can.
    if (input.company_website || input.elapsed_ms < MIN_FILL_MS) {
      log.warn({ reason: "bot-check" }, "demo call rejected");
      res.status(400).json({ error: "Please try submitting the form again." });
      return;
    }
    if (!(await verifyTurnstile(cfg, input.turnstile_token, req.ip))) {
      res.status(400).json({ error: "Please complete the verification and try again." });
      return;
    }

    // In sheet mode nothing is dialled, so any country's mobile number is accepted and saved.
    const saveOnly = cfg.DEMO_CALL_MODE === "sheet";
    const phone = checkPhone(input.dial_code, input.phone_number, saveOnly ? "any" : cfg.ALLOWED_CALL_COUNTRIES);
    if (!phone.ok) {
      const msg =
        phone.reason === "country_not_allowed"
          ? "Live demo calls are currently available for Indian mobile numbers only."
          : phone.reason === "not_mobile"
            ? "Please enter a mobile number."
            : "Please enter a valid phone number.";
      res.status(400).json({ error: msg });
      return;
    }

    if (!saveOnly && !withinCallingHours(cfg.CALL_TIMEZONE, cfg.CALL_WINDOW_START_HOUR, cfg.CALL_WINDOW_END_HOUR)) {
      res.status(409).json({
        error: `Demo calls run between ${cfg.CALL_WINDOW_START_HOUR}:00 and ${cfg.CALL_WINDOW_END_HOUR}:00 India time. Please try again then.`,
      });
      return;
    }

    const phoneKey = keyedHash(cfg.HASH_SECRET, phone.e164);
    const emailKey = keyedHash(cfg.HASH_SECRET, input.email);
    if (recentPhones.has(phoneKey) || recentEmails.has(emailKey)) {
      res.status(429).json({
        error: saveOnly ? "We've already received your request today. Our team will be in touch." : "We've already sent a demo call to these details today.",
      });
      return;
    }
    // Reserve before calling so two quick submissions can't both get through.
    recentPhones.add(phoneKey);
    recentEmails.add(emailKey);

    try {
      const result = await startVapiCall(cfg, input, phone.e164);
      if (!result.ok) {
        recentPhones.delete(phoneKey);
        recentEmails.delete(emailKey);
        log.error({ status: result.status, phone: maskPhone(phone.e164), mode: cfg.DEMO_CALL_MODE }, "demo request failed");
        res.status(502).json({
          error: saveOnly ? "We couldn't save your request right now. Please try again in a few minutes." : "We couldn't start the call right now. Please try again in a few minutes.",
        });
        return;
      }
      log.info({ callId: result.callId, phone: maskPhone(phone.e164), mode: cfg.DEMO_CALL_MODE }, "demo call started");
      res.status(202).json({
        ok: true,
        mode: cfg.DEMO_CALL_MODE,
        message:
          cfg.DEMO_CALL_MODE === "mock"
            ? "Test mode: the form works, but no real call was placed."
            : saveOnly
              ? "Thanks! We've received your details. Our team will contact you shortly to set up your demo."
              : "Your demo call is on its way. Please keep your phone nearby.",
      });
    } catch (err) {
      recentPhones.delete(phoneKey);
      recentEmails.delete(emailKey);
      log.error({ err: (err as Error).name, mode: cfg.DEMO_CALL_MODE }, "demo request error");
      res.status(502).json({
        error: saveOnly ? "We couldn't save your request right now. Please try again in a few minutes." : "We couldn't start the call right now. Please try again in a few minutes.",
      });
    }
  });

  return router;
}
