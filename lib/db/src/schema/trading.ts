import { sql } from "drizzle-orm";
import { pgTable, text, integer, varchar, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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
});

export const insertSignalSchema = createInsertSchema(signals).omit({ createdAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

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
});

export const insertOrderSchema = createInsertSchema(orders).omit({ createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

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
});

export const insertPositionSchema = createInsertSchema(positions).omit({ openedAt: true, closedAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey(),
  level: text("level").notNull(),
  source: text("source").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({ createdAt: true });
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;
