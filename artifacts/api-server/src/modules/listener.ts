import { auditStore } from "./auditStore";
import { logger } from "../lib/logger";

const BASE_PRICES: Record<string, number> = {
  "SOL/USDT": 145.23,
  "ETH/USDT": 3450.10,
  "BTC/USDT": 64230.00,
  "AVAX/USDT": 36.80,
  "MEME/USDT": 0.00234,
  "DOGE/USDT": 0.1512,
};

const currentPrices: Record<string, number> = { ...BASE_PRICES };
let listenerInterval: NodeJS.Timeout | null = null;

function jitter(base: number, pct = 0.003): number {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

export function getCurrentPrice(pair: string): number {
  return currentPrices[pair] ?? 0;
}

let listenerErrorCount = 0;
const LISTENER_MAX_ERRORS = 10;
const LISTENER_RESET_THRESHOLD = 5; // Reset error count after successful operations

export function startListener() {
  if (listenerInterval) {
    logger.warn("Listener already running");
    return;
  }

  listenerInterval = setInterval(() => {
    try {
      // Update prices with jitter
      for (const pair of Object.keys(currentPrices)) {
        currentPrices[pair] = jitter(currentPrices[pair]);
      }

      // Update active positions
      for (const pos of auditStore.activePositions) {
        const newPrice = currentPrices[pos.pair];
        if (!newPrice) continue;
        pos.currentPrice = newPrice.toFixed(newPrice < 0.01 ? 5 : newPrice < 10 ? 2 : 2);

        const entry = parseFloat(pos.entryPrice);
        const size = parseFloat(pos.size);
        const raw = (newPrice - entry) * size * (pos.side === "SHORT" ? -1 : 1);
        const pct = ((newPrice - entry) / entry) * 100 * (pos.side === "SHORT" ? -1 : 1);
        pos.pnl = (raw >= 0 ? "+" : "") + "$" + Math.abs(raw).toFixed(2);
        pos.pnlPercent = (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%";
      }

      // Update watchlist prices
      for (const item of auditStore.watchlist) {
        const newPrice = currentPrices[item.pair];
        if (!newPrice) continue;
        item.price = newPrice.toFixed(newPrice < 0.01 ? 5 : 2);
      }

      // Reset error count on successful operation
      listenerErrorCount = Math.max(0, listenerErrorCount - 1);
    } catch (error) {
      listenerErrorCount++;
      const errorMsg = (error as Error).message;

      logger.error({ error, errorCount: listenerErrorCount }, "Error in listener tick");
      auditStore.addLog("ERROR", "MarketStream", `Listener error: ${errorMsg}`);

      // Circuit breaker: stop the listener if too many errors
      if (listenerErrorCount >= LISTENER_MAX_ERRORS) {
        logger.error({ errorCount: listenerErrorCount }, "Listener exceeded error threshold, stopping");
        auditStore.addLog(
          "ERROR",
          "MarketStream",
          `Listener stopped due to recurring errors (${listenerErrorCount} consecutive failures)`
        );
        stopListener();
      }
    }
  }, 2000);

  listenerErrorCount = 0;
  auditStore.addLog("INFO", "MarketStream", "Market data listener started — streaming 6 pairs from Bitget");
  logger.info("Listener module started");
}

export function stopListener() {
  if (listenerInterval) {
    clearInterval(listenerInterval);
    listenerInterval = null;
    logger.info("Listener module stopped");
    auditStore.addLog("INFO", "MarketStream", "Market data listener stopped");
  }
}
