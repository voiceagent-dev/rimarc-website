import path from "node:path";
import { existsSync } from "node:fs";
import express, { type NextFunction, type Request, type Response } from "express";
import compression from "compression";
import { pinoHttp } from "pino-http";
import type { Config } from "./config.js";
import type { Logger } from "./logger.js";
import { createLimiters, permissionsPolicy, requireSameOriginJson, securityHeaders } from "./middleware/security.js";
import { demoCallRouter } from "./routes/demoCall.js";
import { contactRouter } from "./routes/contact.js";
import { vapiWebhookRouter } from "./routes/vapiWebhook.js";

export function createApp(cfg: Config, log: Logger) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", cfg.TRUST_PROXY);

  app.use(
    pinoHttp({
      logger: log,
      // Only method, path and status are logged: no bodies, query strings, IPs or headers.
      serializers: {
        req: (req) => ({ method: req.method, url: String(req.url).split("?")[0] }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      autoLogging: { ignore: (req) => !String(req.url).startsWith("/api") },
    }),
  );
  // Send every other address of the domain (rimarcai.com, or www.rimarcai.com when the bare
  // domain is the main one) to the main address with one permanent redirect.
  if (cfg.CANONICAL_HOST) {
    const canonical = cfg.CANONICAL_HOST;
    const base = canonical.replace(/^www\./, "");
    app.use((req, res, next) => {
      const host = req.hostname;
      const sameSite = host === base || host.endsWith(`.${base}`);
      // The free *.onrender.com address would be a duplicate copy of the site in Google.
      const renderHost = host.endsWith(".onrender.com") && !req.path.startsWith("/api/");
      if (host !== canonical && (sameSite || renderHost) && (req.method === "GET" || req.method === "HEAD")) {
        res.redirect(301, `https://${canonical}${req.originalUrl}`);
        return;
      }
      next();
    });
  }
  app.use(securityHeaders(cfg));
  app.use(permissionsPolicy);
  app.use(compression());

  // API
  const limiters = createLimiters(cfg);
  const api = express.Router();
  api.use(limiters.api);
  api.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  // The Vapi webhook is server-to-server, so it uses its own secret check instead of the origin check.
  api.use(vapiWebhookRouter(cfg, log, limiters));
  api.use(requireSameOriginJson(cfg), express.json({ limit: "16kb", strict: true }));
  api.use(demoCallRouter(cfg, log, limiters));
  api.use(contactRouter(cfg, log, limiters));
  api.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use("/api", api);

  // Website (built React app)
  const dist = path.resolve(process.cwd(), cfg.CLIENT_DIST);
  if (existsSync(dist)) {
    app.use("/.well-known", express.static(path.join(dist, ".well-known"), { dotfiles: "allow", maxAge: "1d" }));
    app.use(
      "/assets",
      express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y", index: false, dotfiles: "deny" }),
    );
    app.use(express.static(dist, { maxAge: "1d", index: false, dotfiles: "deny", redirect: false }));

    // Every page is pre-rendered to its own HTML file at build time (client/scripts/prerender.mjs).
    // Paths are limited to lowercase letters, digits, "-" and "/", so they can't leave the dist folder.
    const pageCache = new Map<string, string | null>();
    const pageFor = (urlPath: string) => {
      if (!/^\/[a-z0-9\-/]*$/.test(urlPath) || urlPath.includes("//")) return null;
      if (!pageCache.has(urlPath)) {
        // Pages are written as "about.html" (the GitHub Pages layout) or, in older builds, "about/index.html".
        const candidates =
          urlPath === "/" ? ["index.html"] : [`${urlPath.slice(1)}.html`, path.join(urlPath.slice(1), "index.html")];
        const found = candidates.map((c) => path.join(dist, c)).find((f) => existsSync(f));
        pageCache.set(urlPath, found ?? null);
      }
      return pageCache.get(urlPath) ?? null;
    };
    const notFoundPage = existsSync(path.join(dist, "404.html")) ? path.join(dist, "404.html") : path.join(dist, "index.html");

    app.get(/.*/, (req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      // One address per page: "/about/" -> "/about".
      if (req.path.length > 1 && req.path.endsWith("/")) {
        const trimmed = req.path.replace(/\/+$/, "");
        if (pageFor(trimmed)) {
          const q = req.originalUrl.indexOf("?");
          res.redirect(301, trimmed + (q === -1 ? "" : req.originalUrl.slice(q)));
          return;
        }
      }
      const file = pageFor(req.path);
      if (file) {
        res.sendFile(file);
        return;
      }
      res.status(404).sendFile(notFoundPage);
    });
  }

  // Errors: log the type only, never the details, and never leak stack traces.
  app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === "entity.too.large") {
      res.status(413).json({ error: "Request too large." });
      return;
    }
    if (err.type === "entity.parse.failed") {
      res.status(400).json({ error: "Invalid request." });
      return;
    }
    log.error({ err: err.name }, "unhandled error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}
