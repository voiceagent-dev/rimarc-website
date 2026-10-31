import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { createApp } from "./app.js";

const cfg = loadConfig();
const log = createLogger(cfg.NODE_ENV);
const app = createApp(cfg, log);

const server = app.listen(cfg.PORT, () => {
  log.info({ port: cfg.PORT, mode: cfg.DEMO_CALL_MODE }, "RIMARC AI server listening");
});
// Defend against slow-client attacks.
server.headersTimeout = 15_000;
server.requestTimeout = 20_000;
server.keepAliveTimeout = 5_000;

const shutdown = () => {
  log.info("shutting down");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
