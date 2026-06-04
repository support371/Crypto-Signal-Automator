import app from "./app";
import { logger } from "./lib/logger";
import { startListener } from "./modules/listener";
import { startScorer } from "./modules/scorer";
import { startGuardian } from "./modules/guardian";
import { startExecutor } from "./modules/executor";

const rawPort = process.env["PORT"] || "3001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  startListener();
  startScorer();
  startGuardian();
  startExecutor();

  logger.info("All 6 core modules started (paper-trading mode)");
});
