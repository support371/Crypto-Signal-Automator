import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "../lib/logger";

// Standardized error response format
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

// Custom error class for API errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factory functions
export const errors = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(400, "BAD_REQUEST", message, details),

  unauthorized: (message = "Unauthorized") =>
    new AppError(401, "UNAUTHORIZED", message),

  forbidden: (message = "Forbidden") =>
    new AppError(403, "FORBIDDEN", message),

  notFound: (resource = "Resource") =>
    new AppError(404, "NOT_FOUND", `${resource} not found`),

  conflict: (message: string) =>
    new AppError(409, "CONFLICT", message),

  tooManyRequests: (message = "Too many requests") =>
    new AppError(429, "TOO_MANY_REQUESTS", message),

  internal: (message = "Internal server error") =>
    new AppError(500, "INTERNAL_ERROR", message),

  serviceUnavailable: (message = "Service temporarily unavailable") =>
    new AppError(503, "SERVICE_UNAVAILABLE", message),
};

// Async handler wrapper to catch errors
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Global error handler middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.headers["x-request-id"]?.toString();

  // Handle known AppError instances
  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    const response: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    };

    if (err.details && process.env.NODE_ENV !== "production") {
      response.error.details = err.details;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    logger.warn({ requestId, path: req.path }, "Validation error");
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        requestId,
      },
    });
  }

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    logger.warn({ requestId, origin: req.headers.origin }, "CORS rejected");
    return res.status(403).json({
      error: {
        code: "CORS_ERROR",
        message: "Origin not allowed",
        requestId,
      },
    });
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Invalid JSON in request body",
        requestId,
      },
    });
  }

  // Unknown errors - log full stack in development
  logger.error(
    {
      requestId,
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    },
    `Unhandled error: ${err.message}`
  );

  // Generic error response (don't leak internal details)
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
      requestId,
    },
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  const requestId = req.headers["x-request-id"]?.toString();
  
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      requestId,
    },
  });
};
