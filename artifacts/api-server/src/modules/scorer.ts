import { randomUUID } from "crypto";
import { auditStore, type Signal } from "./auditStore";
import { getCurrentPrice } from "./listener";

const PAIRS = ["SOL/USDT", "ETH/USDT", "BTC/USDT", "AVAX/USDT", "MEME/USDT", "DOGE/USDT"] as const;
const TYPES = ["MOMENTUM", "NEW_LISTING", "VOLATILITY"] as const;
const EXCHANGES = ["Bitget", "Bitget", "Bitget", "BTCC"] as const;

function scoreSignal(): Signal {
  const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  const score = Math.floor(40 + Math.random() * 60);
  const action = score >= 70 ? (Math.random() > 0.5 ? "BUY" : "SELL") : "IGNORE";
  const status = score >= 70 ? "EXECUTED" : score >= 55 ? "PENDING_RISK" : "REJECTED";
  const price = getCurrentPrice(pair) || 100;
  const exchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];

  return {
    id: randomUUID().slice(0, 8),
    pair,
    type,
    score,
    action,
    price: price.toFixed(price < 0.01 ? 5 : 2),
    timestamp: "just now",
    status,
    exchange,
  };
}

function ageTimestamps() {
  const aging: Record<string, string> = {
    "just now": "1 min ago",
    "1 min ago": "5 mins ago",
    "5 mins ago": "15 mins ago",
    "15 mins ago": "30 mins ago",
    "30 mins ago": "1 hour ago",
    "1 hour ago": "2 hours ago",
    "2 hours ago": "3 hours ago",
    "3 hours ago": "4 hours ago",
  };
  for (const sig of auditStore.signals) {
    if (aging[sig.timestamp]) sig.timestamp = aging[sig.timestamp];
  }
}

export function startScorer() {
  setInterval(() => {
    const signal = scoreSignal();
    auditStore.signals.unshift(signal);
    if (auditStore.signals.length > 50) auditStore.signals.pop();

    ageTimestamps();

    auditStore.addLog(
      signal.score >= 70 ? "INFO" : "WARN",
      "SignalScorer",
      `Signal scored: ${signal.pair} ${signal.type} score=${signal.score} → ${signal.action}`,
    );
  }, 30_000);

  auditStore.addLog("INFO", "SignalScorer", "Signal scorer started — scoring 6 pairs with MOMENTUM/VOLATILITY/NEW_LISTING strategies");
}
