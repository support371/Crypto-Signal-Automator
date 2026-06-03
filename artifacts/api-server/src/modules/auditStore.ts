import { randomUUID } from "crypto";

export type SignalType = "MOMENTUM" | "NEW_LISTING" | "VOLATILITY";
export type OrderSide = "BUY" | "SELL";
export type OrderStatus =
  | "PENDING_RISK"
  | "EXECUTED"
  | "REJECTED"
  | "FILLED"
  | "CANCELED"
  | "FAILED";

export interface Signal {
  id: string;
  pair: string;
  type: SignalType;
  score: number;
  action: "BUY" | "SELL" | "IGNORE";
  price: string;
  timestamp: string;
  status: OrderStatus;
  exchange: "Bitget" | "BTCC" | "Binance";
}

export interface Order {
  id: string;
  pair: string;
  side: OrderSide;
  type: "MARKET" | "LIMIT" | "STOP_LIMIT";
  price: string;
  amount: string;
  total: string;
  status: OrderStatus;
  timestamp: string;
  exchange: string;
  note?: string;
}

export interface Position {
  id: string;
  pair: string;
  side: "LONG" | "SHORT";
  entryPrice: string;
  currentPrice: string;
  size: string;
  pnl: string;
  pnlPercent: string;
  duration: string;
  status?: "TAKE_PROFIT" | "STOP_LOSS";
  closePrice?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
}

export interface WatchlistItem {
  id: string;
  pair: string;
  exchange: string;
  status: string;
  price: string;
  change24h: string;
  volume: string;
  trend: "up" | "down" | "neutral";
  score: number;
}

const LOG_SOURCES = ["CoreEngine", "RiskGuardian", "MarketStream", "Exchange[Bitget]", "Exchange[BTCC]", "SignalScorer", "ExecutionRouter"];
const LOG_MESSAGES: Record<"INFO" | "WARN" | "ERROR", string[]> = {
  INFO: [
    "Initialized market data listeners for Bitget.",
    "Signal scored: SOL/USDT MOMENTUM score=92 → BUY",
    "Position opened: SOL/USDT LONG @145.23 size=15.5",
    "Heartbeat OK — all streams healthy",
    "Risk check passed for ETH/USDT BUY order",
    "Loaded global rules. Validating active positions...",
    "Paper order filled: ORD-{id} SOL/USDT LONG @145.23",
    "Watchlist scan complete — 12 pairs scored",
  ],
  WARN: [
    "High volatility detected on MEME/USDT — reducing position size 20%",
    "Connection timeout. Attempting reconnect (1/3).",
    "API rate limit approaching: 45/50 req/s",
    "Score below threshold for BTC/USDT — signal ignored",
    "Daily drawdown at 3.2% of 5% limit",
  ],
  ERROR: [
    "Dropped 5 websocket frames due to high latency.",
    "Failed to parse tick data from BTCC stream",
    "Order placement failed: insufficient paper balance",
  ],
};

class AuditStore {
  signals: Signal[] = [];
  orders: Order[] = [];
  activePositions: Position[] = [];
  closedPositions: Position[] = [];
  watchlist: WatchlistItem[] = [];
  logs: SystemLog[] = [];
  startTime = Date.now();

  constructor() {
    this.seed();
  }

  private seed() {
    this.signals = [
      { id: "1", pair: "SOL/USDT", type: "MOMENTUM", score: 92, action: "BUY", price: "145.23", timestamp: "2 mins ago", status: "EXECUTED", exchange: "Bitget" },
      { id: "2", pair: "MEME/USDT", type: "NEW_LISTING", score: 88, action: "BUY", price: "0.00234", timestamp: "15 mins ago", status: "PENDING_RISK", exchange: "Bitget" },
      { id: "3", pair: "BTC/USDT", type: "MOMENTUM", score: 45, action: "IGNORE", price: "64230.00", timestamp: "1 hour ago", status: "REJECTED", exchange: "BTCC" },
      { id: "4", pair: "ETH/USDT", type: "VOLATILITY", score: 78, action: "SELL", price: "3450.10", timestamp: "2 hours ago", status: "EXECUTED", exchange: "Bitget" },
      { id: "5", pair: "AVAX/USDT", type: "MOMENTUM", score: 61, action: "BUY", price: "36.80", timestamp: "3 hours ago", status: "EXECUTED", exchange: "Bitget" },
    ];

    this.orders = [
      { id: "ORD-9821", pair: "SOL/USDT", side: "BUY", type: "MARKET", price: "140.50", amount: "15.5", total: "$2,177.75", status: "FILLED", timestamp: "2026-03-23 14:32:11", exchange: "Bitget" },
      { id: "ORD-9820", pair: "MEME/USDT", side: "BUY", type: "LIMIT", price: "0.00210", amount: "150000", total: "$315.00", status: "FILLED", timestamp: "2026-03-23 14:15:00", exchange: "Bitget" },
      { id: "ORD-9819", pair: "ETH/USDT", side: "SELL", type: "MARKET", price: "3500.00", amount: "2.5", total: "$8,750.00", status: "FILLED", timestamp: "2026-03-23 13:45:22", exchange: "BTCC" },
      { id: "ORD-9818", pair: "AVAX/USDT", side: "BUY", type: "LIMIT", price: "36.20", amount: "50", total: "$1,810.00", status: "FILLED", timestamp: "2026-03-22 09:12:44", exchange: "Bitget" },
      { id: "ORD-9817", pair: "BTC/USDT", side: "BUY", type: "STOP_LIMIT", price: "63100.00", amount: "0.1", total: "$6,310.00", status: "CANCELED", timestamp: "2026-03-21 21:00:00", exchange: "BTCC" },
      { id: "ORD-9816", pair: "DOGE/USDT", side: "BUY", type: "MARKET", price: "0.15", amount: "10000", total: "$1,500.00", status: "FAILED", timestamp: "2026-03-21 16:45:12", exchange: "Bitget", note: "Insufficient balance" },
    ];

    this.activePositions = [
      { id: "p1", pair: "SOL/USDT", side: "LONG", entryPrice: "140.50", currentPrice: "145.23", size: "15.5", pnl: "+$73.32", pnlPercent: "+3.37%", duration: "2h 14m" },
      { id: "p2", pair: "MEME/USDT", side: "LONG", entryPrice: "0.00210", currentPrice: "0.00234", size: "150000", pnl: "+$36.00", pnlPercent: "+11.43%", duration: "45m" },
      { id: "p3", pair: "AVAX/USDT", side: "SHORT", entryPrice: "38.10", currentPrice: "36.80", size: "30", pnl: "+$39.00", pnlPercent: "+3.41%", duration: "5h 30m" },
      { id: "p4", pair: "ETH/USDT", side: "LONG", entryPrice: "3380.00", currentPrice: "3450.10", size: "2.0", pnl: "+$140.20", pnlPercent: "+2.07%", duration: "1d 1h" },
    ];

    this.closedPositions = [
      { id: "p5", pair: "BTC/USDT", side: "LONG", entryPrice: "63100.00", currentPrice: "64200.00", closePrice: "64200.00", size: "0.1", pnl: "+$110.00", pnlPercent: "+1.74%", duration: "1d 2h", status: "TAKE_PROFIT" },
      { id: "p6", pair: "AVAX/USDT", side: "LONG", entryPrice: "36.20", currentPrice: "34.50", closePrice: "34.50", size: "50", pnl: "-$85.00", pnlPercent: "-4.69%", duration: "12h", status: "STOP_LOSS" },
    ];

    this.watchlist = [
      { id: "w1", pair: "SOL/USDT", exchange: "Bitget", status: "Active", price: "145.23", change24h: "+8.2%", volume: "$4.2B", trend: "up", score: 92 },
      { id: "w2", pair: "ETH/USDT", exchange: "Bitget", status: "Active", price: "3450.10", change24h: "+3.1%", volume: "$18.7B", trend: "up", score: 74 },
      { id: "w3", pair: "BTC/USDT", exchange: "BTCC", status: "Active", price: "64230.00", change24h: "+1.4%", volume: "$42.1B", trend: "up", score: 45 },
      { id: "w4", pair: "AVAX/USDT", exchange: "Bitget", status: "Active", price: "36.80", change24h: "-2.3%", volume: "$890M", trend: "down", score: 38 },
      { id: "w5", pair: "MEME/USDT", exchange: "Bitget", status: "New Listing", price: "0.00234", change24h: "+24.7%", volume: "$120M", trend: "up", score: 88 },
      { id: "w6", pair: "DOGE/USDT", exchange: "Bitget", status: "Active", price: "0.1512", change24h: "-1.1%", volume: "$2.1B", trend: "down", score: 52 },
    ];

    this.seedLogs();
  }

  private seedLogs() {
    const now = new Date();
    const entries: SystemLog[] = [];
    for (let i = 60; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 65_000);
      const levels: ("INFO" | "WARN" | "ERROR")[] = i % 15 === 0 ? ["ERROR"] : i % 5 === 0 ? ["WARN"] : ["INFO"];
      const level = levels[0];
      const msgs = LOG_MESSAGES[level];
      const source = LOG_SOURCES[Math.floor(Math.random() * LOG_SOURCES.length)];
      const message = msgs[Math.floor(Math.random() * msgs.length)].replace("{id}", randomUUID().slice(0, 4).toUpperCase());
      entries.push({
        id: randomUUID(),
        timestamp: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}:${t.getSeconds().toString().padStart(2, "0")}.${t.getMilliseconds().toString().padStart(3, "0")}`,
        level,
        source,
        message,
      });
    }
    this.logs = entries.slice(-50);
  }

  addLog(level: "INFO" | "WARN" | "ERROR", source: string, message: string) {
    const now = new Date();
    this.logs.push({
      id: randomUUID(),
      timestamp: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`,
      level,
      source,
      message,
    });
    if (this.logs.length > 200) this.logs = this.logs.slice(-200);
  }

  getUptimeString(): string {
    const ms = Date.now() - this.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    return d > 0
      ? `${d}d ${(h % 24).toString().padStart(2, "0")}h ${(m % 60).toString().padStart(2, "0")}m`
      : `${h.toString().padStart(2, "0")}h ${(m % 60).toString().padStart(2, "0")}m ${(s % 60).toString().padStart(2, "0")}s`;
  }
}

export const auditStore = new AuditStore();
