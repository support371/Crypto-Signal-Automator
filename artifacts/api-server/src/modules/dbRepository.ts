import { db, signals, orders, systemLogs, type InsertSignal, type InsertOrder, type InsertSystemLog } from "@workspace/db";
import { desc } from "drizzle-orm";
import { logger } from "../lib/logger";

/** Persist a new signal to the database. Errors are logged, not thrown. */
export async function persistSignal(s: InsertSignal): Promise<void> {
  try {
    await db.insert(signals).values(s).onConflictDoNothing();
  } catch (err) {
    logger.warn({ err }, "Failed to persist signal to DB");
  }
}

/** Persist a new order to the database. Errors are logged, not thrown. */
export async function persistOrder(o: InsertOrder): Promise<void> {
  try {
    await db.insert(orders).values(o).onConflictDoNothing();
  } catch (err) {
    logger.warn({ err }, "Failed to persist order to DB");
  }
}

/** Persist a system log entry to the database. Errors are logged, not thrown. */
export async function persistLog(l: InsertSystemLog): Promise<void> {
  try {
    await db.insert(systemLogs).values(l).onConflictDoNothing();
  } catch (err) {
    // silently skip — log persistence is best-effort
  }
}

/** Load the most recent signals from the database (up to `limit`). */
export async function loadSignals(limit = 20) {
  try {
    return await db.select().from(signals).orderBy(desc(signals.createdAt)).limit(limit);
  } catch (err) {
    logger.warn({ err }, "Failed to load signals from DB — using seeded data");
    return [];
  }
}

/** Load the most recent orders from the database (up to `limit`). */
export async function loadOrders(limit = 50) {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  } catch (err) {
    logger.warn({ err }, "Failed to load orders from DB — using seeded data");
    return [];
  }
}

/** Load the most recent system logs from the database (up to `limit`). */
export async function loadLogs(limit = 100) {
  try {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.createdAt)).limit(limit);
  } catch (err) {
    logger.warn({ err }, "Failed to load logs from DB — using seeded data");
    return [];
  }
}
