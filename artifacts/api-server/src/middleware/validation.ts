import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

// Validation schemas for API routes
export const schemas = {
  // Query params for paginated endpoints
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Order filters
  orderFilters: z.object({
    status: z.enum(["FILLED", "PENDING", "CANCELLED", "REJECTED"]).optional(),
    symbol: z.string().optional(),
    side: z.enum(["BUY", "SELL"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  // Position filters
  positionFilters: z.object({
    status: z.enum(["ACTIVE", "CLOSED"]).optional(),
    symbol: z.string().optional(),
  }),

  // Exchange configuration (for settings)
  exchangeConfig: z.object({
    exchange: z.enum(["bitget", "binance", "btcc"]),
    apiKey: z.string().min(10).max(200),
    apiSecret: z.string().min(10).max(200),
    passphrase: z.string().optional(),
    testnet: z.boolean().default(true),
  }),

  // Risk settings
  riskSettings: z.object({
    maxExposure: z.number().min(0).max(1000000),
    maxPositionSize: z.number().min(0).max(100000),
    maxDailyLoss: z.number().min(0).max(100000),
    enableKillSwitch: z.boolean(),
    allowedSymbols: z.array(z.string()).optional(),
  }),

  // Watchlist item
  watchlistItem: z.object({
    symbol: z.string().min(1).max(20),
    targetScore: z.number().min(0).max(100).optional(),
    enabled: z.boolean().default(true),
  }),

  // Signal processing
  signal: z.object({
    symbol: z.string().min(1).max(20),
    side: z.enum(["BUY", "SELL"]),
    price: z.number().positive(),
    quantity: z.number().positive(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
  }),
};

// Validation error response type
interface ValidationErrorResponse {
  error: {
    code: string;
    message: string;
    details: Array<{ field: string; message: string }>;
  };
}

// Generic validation middleware factory
export function validate<T extends z.ZodSchema>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : source === "query" ? req.query : req.params;

    const result = schema.safeParse(data);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      logger.warn(
        { path: req.path, source, errors: details },
        "Validation failed"
      );

      const response: ValidationErrorResponse = {
        error: {
          code: "VALIDATION_ERROR",
          message: `Invalid ${source} parameters`,
          details,
        },
      };

      return res.status(400).json(response);
    }

    // Attach validated data to request
    if (source === "body") {
      req.body = result.data;
    } else if (source === "query") {
      (req as Request & { validatedQuery: z.infer<T> }).validatedQuery = result.data;
    } else {
      (req as Request & { validatedParams: z.infer<T> }).validatedParams = result.data;
    }

    next();
  };
}

// Type helpers for validated requests
export type ValidatedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> = Request & {
  body: TBody;
  validatedQuery?: TQuery;
  validatedParams?: TParams;
};
