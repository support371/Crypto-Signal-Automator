import { 
  db, 
  withRetry,
  signals, 
  orders, 
  systemLogs, 
  watchlist,
  exchangeConfigs,
  riskSettings as riskSettingsTable,
  type InsertSignal, 
  type InsertOrder, 
  type InsertSystemLog,
  type InsertWatchlist,
  type InsertExchangeConfig,
  type InsertRiskSettings,
} from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";

// ============ Signals ============

/** Persist a new signal to the database. Errors are logged, not thrown. */
export async function persistSignal(s: InsertSignal): Promise<void> {
  if (!db) return;
  
  await withRetry(async () => {
    await db.insert(signals).values(s).onConflictDoNothing();
  }, "persistSignal");
}

/** Load the most recent signals from the database (up to `limit`). */
export async function loadSignals(limit = 20) {
  if (!db) return [];

  const result = await withRetry(async () => {
    return await db.select().from(signals).orderBy(desc(signals.createdAt)).limit(limit);
  }, "loadSignals");

  return result ?? [];
}

// ============ Orders ============

/** Persist a new order to the database. Errors are logged, not thrown. */
export async function persistOrder(o: InsertOrder): Promise<void> {
  if (!db) return;

  await withRetry(async () => {
    await db.insert(orders).values(o).onConflictDoNothing();
  }, "persistOrder");
}

/** Load the most recent orders from the database (up to `limit`). */
export async function loadOrders(limit = 50) {
  if (!db) return [];

  const result = await withRetry(async () => {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  }, "loadOrders");

  return result ?? [];
}

// ============ System Logs ============

/** Persist a system log entry to the database. Errors are logged, not thrown. */
export async function persistLog(l: InsertSystemLog): Promise<void> {
  if (!db) return;

  // Log persistence is best-effort, don't retry
  try {
    await db.insert(systemLogs).values(l).onConflictDoNothing();
  } catch {
    // silently skip — log persistence is best-effort
  }
}

/** Load the most recent system logs from the database (up to `limit`). */
export async function loadLogs(limit = 100) {
  if (!db) return [];

  const result = await withRetry(async () => {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.createdAt)).limit(limit);
  }, "loadLogs");

  return result ?? [];
}

// ============ Watchlist ============

/** Persist a watchlist item. */
export async function persistWatchlistItem(item: InsertWatchlist): Promise<void> {
  if (!db) return;

  await withRetry(async () => {
    await db.insert(watchlist).values(item).onConflictDoNothing();
  }, "persistWatchlistItem");
}

/** Load all watchlist items. */
export async function loadWatchlist() {
  if (!db) return [];

  const result = await withRetry(async () => {
    return await db.select().from(watchlist).orderBy(desc(watchlist.createdAt));
  }, "loadWatchlist");

  return result ?? [];
}

/** Remove a watchlist item by symbol. */
export async function removeWatchlistItem(symbol: string): Promise<void> {
  if (!db) return;

  await withRetry(async () => {
    await db.delete(watchlist).where(eq(watchlist.symbol, symbol));
  }, "removeWatchlistItem");
}

// ============ Exchange Configs ============

/** Persist or update exchange configuration. */
export async function persistExchangeConfig(config: InsertExchangeConfig): Promise<void> {
  if (!db) return;

  await withRetry(async () => {
    await db
      .insert(exchangeConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: exchangeConfigs.exchange,
        set: {
          enabled: config.enabled,
          testnet: config.testnet,
          apiKeyEncrypted: config.apiKeyEncrypted,
          apiSecretEncrypted: config.apiSecretEncrypted,
          passphraseEncrypted: config.passphraseEncrypted,
        },
      });
  }, "persistExchangeConfig");
}

/** Load all exchange configurations. */
export async function loadExchangeConfigs() {
  if (!db) return [];

  const result = await withRetry(async () => {
    return await db.select().from(exchangeConfigs);
  }, "loadExchangeConfigs");

  return result ?? [];
}

/** Get a single exchange configuration. */
export async function getExchangeConfig(exchange: string) {
  if (!db) return null;

  const result = await withRetry(async () => {
    return await db.select().from(exchangeConfigs).where(eq(exchangeConfigs.exchange, exchange)).limit(1);
  }, "getExchangeConfig");

  return result?.[0] ?? null;
}

// ============ Risk Settings ============

/** Persist or update risk settings. */
export async function persistRiskSettings(settings: InsertRiskSettings): Promise<void> {
  if (!db) return;

  await withRetry(async () => {
    await db
      .insert(riskSettingsTable)
      .values({ ...settings, id: settings.id || "default" })
      .onConflictDoUpdate({
        target: riskSettingsTable.id,
        set: {
          maxExposure: settings.maxExposure,
          maxPositionSize: settings.maxPositionSize,
          maxDailyLoss: settings.maxDailyLoss,
          enableKillSwitch: settings.enableKillSwitch,
          allowedSymbols: settings.allowedSymbols,
        },
      });
  }, "persistRiskSettings");
}

/** Load risk settings. */
export async function loadRiskSettings() {
  if (!db) return null;

  const result = await withRetry(async () => {
    return await db.select().from(riskSettingsTable).where(eq(riskSettingsTable.id, "default")).limit(1);
  }, "loadRiskSettings");

  return result?.[0] ?? null;
}

// ============ Initialization ============

/** Initialize database with seed data if empty. */
export async function initializeDatabase(): Promise<boolean> {
  if (!db) {
    logger.warn("Database not configured - running in memory-only mode");
    return false;
  }

  try {
    // Check if we have any data
    const existingSignals = await loadSignals(1);
    
    if (existingSignals.length === 0) {
      logger.info("Database appears empty - seed data will be used from auditStore");
    } else {
      logger.info({ count: existingSignals.length }, "Database has existing data");
    }

    return true;
  } catch (error) {
    logger.error({ error }, "Failed to initialize database");
    return false;
  }
}
