import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Database configuration with connection resilience
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || "10"),
  min: parseInt(process.env.DB_POOL_MIN || "2"),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || "5000"),
  // Retry settings
  maxRetries: parseInt(process.env.DB_MAX_RETRIES || "3"),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || "1000"),
};

// Track connection state
let isConnected = false;
let connectionAttempts = 0;

// Create pool with error handling
function createPool(): pg.Pool | null {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - running in memory-only mode");
    return null;
  }

  const pool = new Pool({
    connectionString: DB_CONFIG.connectionString,
    max: DB_CONFIG.max,
    min: DB_CONFIG.min,
    idleTimeoutMillis: DB_CONFIG.idleTimeoutMillis,
    connectionTimeoutMillis: DB_CONFIG.connectionTimeoutMillis,
  });

  // Pool event handlers
  pool.on("connect", () => {
    isConnected = true;
    connectionAttempts = 0;
    console.log("[DB] Connected to database");
  });

  pool.on("error", (err) => {
    isConnected = false;
    console.error("[DB] Pool error:", err.message);
  });

  pool.on("remove", () => {
    console.log("[DB] Client removed from pool");
  });

  return pool;
}

// Initialize pool
export const pool = createPool();

// Create drizzle instance (or null if no DB)
export const db = pool ? drizzle(pool, { schema }) : null;

// Health check function
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  if (!pool || !db) {
    return { connected: false, error: "Database not configured" };
  }

  const start = Date.now();
  try {
    await pool.query("SELECT 1");
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: (error as Error).message,
    };
  }
}

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName = "DB operation"
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < DB_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[DB] ${operationName} failed (attempt ${attempt + 1}/${DB_CONFIG.maxRetries}):`, lastError.message);

      if (attempt < DB_CONFIG.maxRetries - 1) {
        const delay = DB_CONFIG.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`[DB] ${operationName} failed after ${DB_CONFIG.maxRetries} attempts:`, lastError?.message);
  return null;
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    isConnected = false;
    console.log("[DB] Database pool closed");
  }
}

// Export connection state
export function isDatabaseConnected(): boolean {
  return isConnected;
}

export * from "./schema";
