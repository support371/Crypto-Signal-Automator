import express, { type Express } from "express";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { applySecurityMiddleware } from "./middleware/security";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app: Express = express();

// Request ID and security middleware first
applySecurityMiddleware(app);

// Logging (after request ID is set)
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
          requestId: req.headers["x-request-id"],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    customProps: (req) => ({
      requestId: req.headers["x-request-id"],
    }),
  }),
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check endpoint (no rate limiting)
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Readiness probe
app.get("/readyz", async (_req, res) => {
  try {
    // TODO: Add DB health check when persistence is implemented
    res.status(200).json({ status: "ready", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "not ready", timestamp: new Date().toISOString() });
  }
});

// API routes
app.use("/api", router);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
