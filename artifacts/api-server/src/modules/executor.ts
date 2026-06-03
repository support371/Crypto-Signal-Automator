import { randomUUID } from "crypto";
import { auditStore } from "./auditStore";
import { getCurrentPrice } from "./listener";
import { riskCheck } from "./guardian";

export function startExecutor() {
  setInterval(() => {
    const pending = auditStore.signals.filter((s) => s.status === "PENDING_RISK").slice(0, 1);
    for (const signal of pending) {
      const totalExposure = auditStore.activePositions.reduce((sum, p) => {
        return sum + parseFloat(p.currentPrice) * parseFloat(p.size);
      }, 0);

      const { passed, reason } = riskCheck(signal.score, totalExposure);

      if (passed) {
        signal.status = "EXECUTED";
        const price = getCurrentPrice(signal.pair);
        const priceStr = price.toFixed(price < 0.01 ? 5 : 2);
        const amount = (500 / price).toFixed(2);
        const orderId = "ORD-" + Math.floor(Math.random() * 9000 + 1000);

        auditStore.orders.unshift({
          id: orderId,
          pair: signal.pair,
          side: signal.action === "SELL" ? "SELL" : "BUY",
          type: "MARKET",
          price: priceStr,
          amount,
          total: "$500.00",
          status: "FILLED",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          exchange: signal.exchange,
        });
        if (auditStore.orders.length > 100) auditStore.orders.pop();

        auditStore.addLog("INFO", "ExecutionRouter", `Paper order filled: ${orderId} ${signal.pair} ${signal.action} @${priceStr}`);
      } else {
        signal.status = "REJECTED";
        auditStore.addLog("WARN", "ExecutionRouter", `Order rejected for ${signal.pair}: ${reason}`);
      }
    }
  }, 15_000);

  auditStore.addLog("INFO", "ExecutionRouter", "Execution router started — paper-trading mode active");
}
