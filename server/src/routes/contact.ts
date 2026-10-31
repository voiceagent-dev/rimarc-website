import { Router } from "express";
import type { Config } from "../config.js";
import type { Logger } from "../logger.js";
import { ContactSchema } from "../lib/schemas.js";
import { forwardToWebhook, verifyTurnstile } from "../lib/outbound.js";
import type { Limiters } from "../middleware/security.js";
import { firstIssue } from "./util.js";

export function contactRouter(cfg: Config, log: Logger, limiters: Limiters) {
  const router = Router();

  router.post("/contact", limiters.contact, async (req, res) => {
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) });
      return;
    }
    const input = parsed.data;
    if (input.company_website || input.elapsed_ms < 2500) {
      res.status(400).json({ error: "Please try submitting the form again." });
      return;
    }
    if (!(await verifyTurnstile(cfg, input.turnstile_token, req.ip))) {
      res.status(400).json({ error: "Please complete the verification and try again." });
      return;
    }

    try {
      const sent = await forwardToWebhook(cfg, cfg.CONTACT_WEBHOOK_URL, {
        type: "contact",
        received_at: new Date().toISOString(),
        full_name: input.full_name,
        email: input.email,
        company: input.company,
        message: input.message,
      });
      // Nothing is stored on this server. Without a webhook configured, messages are not kept.
      log.info({ forwarded: sent }, "contact message received");
      res.status(202).json({ ok: true, message: "Thanks! We'll get back to you within one working day." });
    } catch (err) {
      log.error({ err: (err as Error).name }, "contact forward failed");
      res.status(502).json({ error: "We couldn't send your message right now. Please email us instead." });
    }
  });

  return router;
}
