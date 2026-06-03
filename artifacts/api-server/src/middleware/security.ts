import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import type { Express, Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

// CORS configuration - restrict origins in production
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
};

// Rate limiting - general API
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT_MAX || "100"), // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
  },
  handler: (req: Request, res: Response) => {
    logger.warn({ ip: req.ip, path: req.path }, "Rate limit exceeded");
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
      },
    });
  },
});

// Rate limiting - stricter for write operations
export const writeRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 write operations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many write operations, please try again later.",
    },
  },
});

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some external resources
});

// Request ID middleware for tracing
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"]?.toString() || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
};

// Apply all security middleware
export function applySecurityMiddleware(app: Express) {
  // Request ID first for logging
  app.use(requestIdMiddleware);

  // Security headers
  app.use(securityHeaders);

  // CORS
  app.use(cors(corsOptions));

  // Rate limiting
  app.use("/api", generalRateLimiter);

  logger.info("Security middleware applied");
}
