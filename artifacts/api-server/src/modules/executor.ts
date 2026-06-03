import { randomUUID } from "crypto";
import { auditStore } from "./auditStore";
import { getCurrentPrice } from "./listener";
import { riskCheck } from "./guardian";
import { persistOrder } from "./dbRepository";

export function startExecutor() {
  setInterval(() => {
    // Only process signals awaiting risk review with an executable BUY or SELL action.
    // IGNORE-action signals are rejected by the scorer and never reach PENDING_RISK.
    const pending = auditStore.signals
      .filter((s) => s.status === "PENDING_RISK" && (s.action === "BUY" || s.action === "SELL"))
      .slice(0, 2);

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
        const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
        const side = signal.action as "BUY" | "SELL";

        const order = {
          id: orderId,
          pair: signal.pair,
          side,
          type: "MARKET" as const,
          price: priceStr,
          amount,
          total: "$500.00",
          status: "FILLED" as const,
          timestamp,
          exchange: signal.exchange,
        };

        auditStore.orders.unshift(order);
        if (auditStore.orders.length > 100) auditStore.orders.pop();

        // Persist order to DB (best-effort — does not block the loop)
        void persistOrder(order);

        auditStore.addLog(
          "INFO",
          "ExecutionRouter",
          `Paper order filled: ${orderId} ${signal.pair} ${signal.action} @${priceStr}`,
        );
      } else {
        signal.status = "REJECTED";
        auditStore.addLog(
          "WARN",
          "ExecutionRouter",
          `Order rejected for ${signal.pair} ${signal.action}: ${reason}`,
        );
      }
    }
  }, 15_000);

  auditStore.addLog("INFO", "ExecutionRouter", "Execution router started — paper-trading mode active");
}
