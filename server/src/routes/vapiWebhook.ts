import express, { Router } from "express";
import type { Config } from "../config.js";
import type { Logger } from "../logger.js";
import { safeEqual } from "../lib/security.js";
import { forwardToWebhook } from "../lib/outbound.js";
import type { Limiters } from "../middleware/security.js";

/**
 * Receives Vapi's end-of-call report. Vapi must send the shared secret in the
 * "x-vapi-secret" header (set it as the server URL secret in Vapi). Results are
 * forwarded to LEAD_WEBHOOK_URL (e.g. a Make/n8n flow that writes the Google Sheet).
 */
export function vapiWebhookRouter(cfg: Config, log: Logger, limiters: Limiters) {
  const router = Router();

  router.post("/vapi/webhook", limiters.webhook, express.json({ limit: "1mb" }), async (req, res) => {
    if (!cfg.VAPI_WEBHOOK_SECRET || !safeEqual(req.get("x-vapi-secret"), cfg.VAPI_WEBHOOK_SECRET)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const message = (req.body as { message?: Record<string, unknown> })?.message;
    if (!message || message.type !== "end-of-call-report") {
      res.status(200).json({ ok: true });
      return;
    }

    const call = (message.call ?? {}) as Record<string, unknown>;
    const artifact = (message.artifact ?? {}) as Record<string, unknown>;
    try {
      const sent = await forwardToWebhook(cfg, cfg.LEAD_WEBHOOK_URL, {
        type: "call-report",
        call_id: call.id,
        ended_reason: message.endedReason,
        started_at: message.startedAt,
        ended_at: message.endedAt,
        structured_outputs: artifact.structuredOutputs ?? null,
        summary: (message.analysis as Record<string, unknown> | undefined)?.summary ?? null,
      });
      log.info({ callId: call.id, endedReason: message.endedReason, forwarded: sent }, "call report received");
    } catch (err) {
      log.error({ err: (err as Error).name }, "call report forward failed");
    }
    res.status(200).json({ ok: true });
  });

  return router;
}
