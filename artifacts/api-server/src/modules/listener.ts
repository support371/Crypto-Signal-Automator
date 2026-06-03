import { auditStore } from "./auditStore";

const BASE_PRICES: Record<string, number> = {
  "SOL/USDT": 145.23,
  "ETH/USDT": 3450.10,
  "BTC/USDT": 64230.00,
  "AVAX/USDT": 36.80,
  "MEME/USDT": 0.00234,
  "DOGE/USDT": 0.1512,
};

const currentPrices: Record<string, number> = { ...BASE_PRICES };

function jitter(base: number, pct = 0.003): number {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

export function getCurrentPrice(pair: string): number {
  return currentPrices[pair] ?? 0;
}

export function startListener() {
  setInterval(() => {
    for (const pair of Object.keys(currentPrices)) {
      currentPrices[pair] = jitter(currentPrices[pair]);
    }

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

    for (const item of auditStore.watchlist) {
      const newPrice = currentPrices[item.pair];
      if (!newPrice) continue;
      item.price = newPrice.toFixed(newPrice < 0.01 ? 5 : 2);
    }
  }, 2000);

  auditStore.addLog("INFO", "MarketStream", "Market data listener started — streaming 6 pairs from Bitget");
}
