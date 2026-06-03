import { sql } from "drizzle-orm";
import { pgTable, text, integer, varchar, real, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Signals table with indexes for common queries
export const signals = pgTable("signals", {
  id: varchar("id").primaryKey(),
  pair: text("pair").notNull(),
  type: text("type").notNull(),
  score: integer("score").notNull(),
  action: text("action").notNull(),
  price: text("price").notNull(),
  status: text("status").notNull(),
  exchange: text("exchange").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("signals_created_at_idx").on(table.createdAt),
  index("signals_pair_idx").on(table.pair),
  index("signals_status_idx").on(table.status),
]);

export const insertSignalSchema = createInsertSchema(signals).omit({ createdAt: true, updatedAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

// Orders table with indexes
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),
  type: text("type").notNull(),
  price: text("price").notNull(),
  amount: text("amount").notNull(),
  total: text("total").notNull(),
  status: text("status").notNull(),
  exchange: text("exchange").notNull(),
  note: text("note"),
  timestamp: text("timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("orders_created_at_idx").on(table.createdAt),
  index("orders_pair_idx").on(table.pair),
  index("orders_status_idx").on(table.status),
]);

export const insertOrderSchema = createInsertSchema(orders).omit({ createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Positions table with indexes
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey(),
  pair: text("pair").notNull(),
  side: text("side").notNull(),
  entryPrice: text("entry_price").notNull(),
  size: text("size").notNull(),
  status: text("status").notNull().default("OPEN"),
  closePrice: text("close_price"),
  exchange: text("exchange").notNull().default("Bitget"),
  openedAt: timestamp("opened_at").notNull().default(sql`now()`),
  closedAt: timestamp("closed_at"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("positions_status_idx").on(table.status),
  index("positions_pair_idx").on(table.pair),
]);

export const insertPositionSchema = createInsertSchema(positions).omit({ openedAt: true, closedAt: true, updatedAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

// System logs table with indexes
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey(),
  level: text("level").notNull(),
  source: text("source").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => [
  index("system_logs_created_at_idx").on(table.createdAt),
  index("system_logs_level_idx").on(table.level),
]);

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({ createdAt: true });
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;

// Watchlist table (new)
export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  pair: text("pair").notNull(),
  exchange: text("exchange").notNull().default("Bitget"),
  enabled: boolean("enabled").notNull().default(true),
  targetScore: integer("target_score").default(70),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("watchlist_symbol_idx").on(table.symbol),
  index("watchlist_enabled_idx").on(table.enabled),
]);

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({ createdAt: true, updatedAt: true });
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;

// Exchange configurations table (new) - credentials stored encrypted
export const exchangeConfigs = pgTable("exchange_configs", {
  id: varchar("id").primaryKey(),
  exchange: text("exchange").notNull().unique(), // bitget, binance, btcc
  enabled: boolean("enabled").notNull().default(false),
  testnet: boolean("testnet").notNull().default(true),
  // API credentials stored encrypted - in production use proper encryption
  apiKeyEncrypted: text("api_key_encrypted"),
  apiSecretEncrypted: text("api_secret_encrypted"),
  passphraseEncrypted: text("passphrase_encrypted"),
  // Connection status
  lastConnectedAt: timestamp("last_connected_at"),
  connectionStatus: text("connection_status").default("disconnected"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  index("exchange_configs_exchange_idx").on(table.exchange),
]);

export const insertExchangeConfigSchema = createInsertSchema(exchangeConfigs).omit({ 
  createdAt: true, 
  updatedAt: true,
  lastConnectedAt: true,
});
export type InsertExchangeConfig = z.infer<typeof insertExchangeConfigSchema>;
export type ExchangeConfig = typeof exchangeConfigs.$inferSelect;

// Risk settings table (new)
export const riskSettings = pgTable("risk_settings", {
  id: varchar("id").primaryKey().default("default"),
  maxExposure: real("max_exposure").notNull().default(10000),
  maxPositionSize: real("max_position_size").notNull().default(2000),
  maxDailyLoss: real("max_daily_loss").notNull().default(500),
  enableKillSwitch: boolean("enable_kill_switch").notNull().default(false),
  allowedSymbols: jsonb("allowed_symbols").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertRiskSettingsSchema = createInsertSchema(riskSettings).omit({ createdAt: true, updatedAt: true });
export type InsertRiskSettings = z.infer<typeof insertRiskSettingsSchema>;
export type RiskSettings = typeof riskSettings.$inferSelect;
