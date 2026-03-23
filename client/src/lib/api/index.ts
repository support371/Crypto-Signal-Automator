import { Metric, Position, Signal, SystemAlert, Order, SystemLog, ModuleHealth } from "@/types/api";

// This file documents the expected external backend contract.
// Currently returning mock data, to be replaced with actual fetch calls.
// Expected Backend Base URL: e.g., https://api.external-backend.com/v1

const MOCK_DELAY = 500; // Simulate network latency

export const api = {
  // GET /api/dashboard/metrics
  getMetrics: async (): Promise<Metric[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { label: "Total PnL (Paper)", value: "+$4,230.50", trend: "up", percentage: "+12.4%" },
      { label: "Win Rate", value: "68.5%", trend: "up", percentage: "+2.1%" },
      { label: "Active Positions", value: "4", trend: "neutral", percentage: "0%" },
      { label: "Risk Exposure", value: "Low", trend: "down", percentage: "-5%" },
    ]), MOCK_DELAY));
  },

  // GET /api/signals/recent
  getRecentSignals: async (): Promise<Signal[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: "1", pair: "SOL/USDT", type: "MOMENTUM", score: 92, action: "BUY", price: "145.23", timestamp: "2 mins ago", status: "EXECUTED", exchange: "Bitget" },
      { id: "2", pair: "MEME/USDT", type: "NEW_LISTING", score: 88, action: "BUY", price: "0.00234", timestamp: "15 mins ago", status: "PENDING_RISK", exchange: "Bitget" },
      { id: "3", pair: "BTC/USDT", type: "MOMENTUM", score: 45, action: "IGNORE", price: "64,230.00", timestamp: "1 hour ago", status: "REJECTED", exchange: "BTCC" },
      { id: "4", pair: "ETH/USDT", type: "VOLATILITY", score: 78, action: "SELL", price: "3,450.10", timestamp: "2 hours ago", status: "EXECUTED", exchange: "Bitget" },
    ]), MOCK_DELAY));
  },

  // GET /api/system/alerts
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: "a1", level: "warning", title: "High Volatility Detected", message: "Risk controller has temporarily reduced max position size by 20% for SOL/USDT due to abnormal spread.", timestamp: Date.now().toString() },
      { id: "a2", level: "critical", title: "API Rate Limit Warning", message: "BTCC adapter approaching rate limit (45/50 req/s). Pausing non-critical syncs.", timestamp: Date.now().toString() },
      { id: "a3", level: "info", title: "New Listing Detected", message: "Possible new asset 'PEPE2' detected on Bitget streams. Scoring in progress...", timestamp: Date.now().toString() },
    ]), MOCK_DELAY));
  },

  // GET /api/watchlist
  getWatchlist: async () => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { pair: "SOL/USDT", exchange: "Bitget", status: "Active", price: "145.23", change24h: "+5.4%", volume: "1.2B", score: 85, trend: "up" },
      { pair: "MEME/USDT", exchange: "Bitget", status: "New Listing", price: "0.00234", change24h: "+120%", volume: "450M", score: 92, trend: "up" },
      { pair: "ETH/USDT", exchange: "BTCC", status: "Active", price: "3,450.10", change24h: "-1.2%", volume: "3.4B", score: 45, trend: "down" },
      { pair: "BNB/USDT", exchange: "Bitget", status: "Active", price: "580.45", change24h: "+0.8%", volume: "890M", score: 60, trend: "up" },
    ]), MOCK_DELAY));
  },

  // GET /api/positions/active
  getActivePositions: async (): Promise<Position[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: "p1", pair: "SOL/USDT", side: "LONG", entryPrice: "140.50", currentPrice: "145.23", size: "15.5", pnl: "+$73.31", pnlPercent: "+3.36%", duration: "2h 15m" },
      { id: "p2", pair: "MEME/USDT", side: "LONG", entryPrice: "0.00210", currentPrice: "0.00234", size: "150000", pnl: "+$36.00", pnlPercent: "+11.42%", duration: "45m" },
      { id: "p3", pair: "ETH/USDT", side: "SHORT", entryPrice: "3500.00", currentPrice: "3450.10", size: "2.5", pnl: "+$124.75", pnlPercent: "+1.42%", duration: "5h 30m" },
    ]), MOCK_DELAY));
  },

  // GET /api/positions/closed
  getClosedPositions: async (): Promise<Position[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: "p4", pair: "BTC/USDT", side: "LONG", entryPrice: "63100.00", currentPrice: "64200.00", closePrice: "64200.00", size: "0.1", pnl: "+$110.00", pnlPercent: "+1.74%", duration: "1d 2h", status: "TAKE_PROFIT" },
      { id: "p5", pair: "AVAX/USDT", side: "LONG", entryPrice: "36.20", currentPrice: "34.50", closePrice: "34.50", size: "50", pnl: "-$85.00", pnlPercent: "-4.69%", duration: "12h", status: "STOP_LOSS" },
    ]), MOCK_DELAY));
  },

  // GET /api/orders
  getOrders: async (): Promise<Order[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
      { id: "ORD-9821", pair: "SOL/USDT", side: "BUY", type: "MARKET", price: "140.50", amount: "15.5", total: "$2,177.75", status: "FILLED", timestamp: "2026-03-23 14:32:11", exchange: "Bitget" },
      { id: "ORD-9820", pair: "MEME/USDT", side: "BUY", type: "LIMIT", price: "0.00210", amount: "150000", total: "$315.00", status: "FILLED", timestamp: "2026-03-23 14:15:00", exchange: "Bitget" },
      { id: "ORD-9819", pair: "ETH/USDT", side: "SELL", type: "MARKET", price: "3500.00", amount: "2.5", total: "$8,750.00", status: "FILLED", timestamp: "2026-03-23 13:45:22", exchange: "BTCC" },
      { id: "ORD-9816", pair: "DOGE/USDT", side: "BUY", type: "MARKET", price: "0.15", amount: "10000", total: "$1,500.00", status: "FAILED", timestamp: "2026-03-21 16:45:12", exchange: "Bitget", note: "Insufficient balance" },
    ]), MOCK_DELAY));
  },

  // GET /api/system/health
  getHealth: async (): Promise<{ modules: ModuleHealth[], logs: SystemLog[], uptime: string }> => {
    return new Promise((resolve) => setTimeout(() => resolve({
      uptime: "14d 02h 45m",
      modules: [
        { name: "Engine CPU", status: "ok", metricValue: "12.4%", description: "Avg over last 5 minutes" },
        { name: "Memory Usage", status: "ok", metricValue: "1.2 GB", description: "Of 4.0 GB allocated limit" },
        { name: "Database Latency", status: "ok", metricValue: "4 ms", description: "Read/write roundtrip" },
        { name: "Bitget WS Stream", status: "ok", metricValue: "45 ms", description: "Ping / connection stable" },
        { name: "BTCC REST API", status: "warning", metricValue: "Disconnected", description: "Adapter not configured" },
      ],
      logs: [
        { id: "l1", timestamp: "14:45:02.123", level: "INFO", source: "CoreEngine", message: "Initialized market data listeners for Bitget." },
        { id: "l2", timestamp: "14:45:03.050", level: "INFO", source: "RiskGuardian", message: "Loaded global rules. Validating active positions..." },
        { id: "l3", timestamp: "14:46:12.890", level: "WARN", source: "Exchange[BTCC]", message: "Connection timeout. Attempting reconnect (1/3)." },
        { id: "l4", timestamp: "14:50:22.450", level: "ERROR", source: "MarketStream", message: "Dropped 5 websocket frames due to high latency." },
      ]
    }), MOCK_DELAY));
  }
};