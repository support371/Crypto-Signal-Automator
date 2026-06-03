import app from "./app";
import { logger } from "./lib/logger";
import { startListener, stopListener } from "./modules/listener";
import { startScorer, stopScorer } from "./modules/scorer";
import { startGuardian, stopGuardian } from "./modules/guardian";
import { startExecutor, stopExecutor } from "./modules/executor";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Track server instance for graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress, forcing exit");
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info({ signal }, "Received shutdown signal, starting graceful shutdown");

  // Stop accepting new connections
  if (server) {
    server.close((err) => {
      if (err) {
        logger.error({ err }, "Error closing HTTP server");
      } else {
        logger.info("HTTP server closed");
      }
    });
  }

  // Stop all modules
  try {
    logger.info("Stopping modules...");
    stopListener();
    stopScorer();
    stopGuardian();
    stopExecutor();
    logger.info("All modules stopped");
  } catch (error) {
    logger.error({ error }, "Error stopping modules");
  }

  // Give in-flight requests time to complete
  const shutdownTimeout = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || "10000");
  
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      logger.warn("Shutdown timeout reached, forcing exit");
      resolve();
    }, shutdownTimeout);

    // Clear timeout if server closes cleanly
    if (server) {
      server.on("close", () => {
        clearTimeout(timeout);
        resolve();
      });
    } else {
      clearTimeout(timeout);
      resolve();
    }
  });

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason, promise }, "Unhandled promise rejection");
  // Don't exit, just log - let the error boundary handle it
});

// Start the server
server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, env: process.env.NODE_ENV || "development" }, "Server listening");

  // Start all modules with error handling
  try {
    startListener();
    startScorer();
    startGuardian();
    startExecutor();
    logger.info("All 4 core modules started (paper-trading mode)");
  } catch (error) {
    logger.error({ error }, "Failed to start modules");
    process.exit(1);
  }
});

// Handle server errors
server.on("error", (error) => {
  logger.error({ error }, "Server error");
});
