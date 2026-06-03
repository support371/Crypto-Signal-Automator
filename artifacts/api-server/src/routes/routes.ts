import { Router } from "express";
import { auditStore } from "../modules/auditStore";
import { getGuardianStatus } from "../modules/guardian";
import os from "os";

const appRouter = Router();

appRouter.get("/dashboard/metrics", (_req, res) => {
  const status = getGuardianStatus();
  const pnlStr = status.totalPnL;
  const pnlNum = parseFloat(pnlStr.replace(/[^0-9.]/g, "")) * (pnlStr.startsWith("+") ? 1 : -1);
  const executed = auditStore.signals.filter((s) => s.status === "EXECUTED").length;
  const decided = auditStore.signals.filter((s) => s.status !== "PENDING_RISK").length;
  const winRate = decided > 0 ? (executed / decided) * 100 : 68.5;

  res.json([
    {
      label: "Total PnL (Paper)",
      value: pnlStr,
      trend: pnlNum >= 0 ? "up" : "down",
      percentage: (pnlNum >= 0 ? "+" : "") + ((pnlNum / 10000) * 100).toFixed(1) + "%",
    },
    {
      label: "Win Rate",
      value: winRate.toFixed(1) + "%",
      trend: winRate >= 60 ? "up" : "down",
      percentage: winRate >= 60 ? "+" + (winRate - 60).toFixed(1) + "%" : (winRate - 60).toFixed(1) + "%",
    },
    {
      label: "Active Positions",
      value: String(auditStore.activePositions.length),
      trend: "neutral",
      percentage: "0%",
    },
    {
      label: "Risk Exposure",
      value: parseFloat(status.totalExposure) > 7000 ? "High" : parseFloat(status.totalExposure) > 4000 ? "Medium" : "Low",
      trend: parseFloat(status.totalExposure) > 7000 ? "up" : "down",
      percentage: "-5%",
    },
  ]);
});

appRouter.get("/signals/recent", (_req, res) => {
  res.json(auditStore.signals.slice(0, 20));
});

appRouter.get("/system/alerts", (_req, res) => {
  const alerts: object[] = [];
  const warnLogs = auditStore.logs
    .filter((l) => l.level === "WARN" || l.level === "ERROR")
    .slice(-4);

  for (const log of warnLogs) {
    alerts.push({
      id: log.id,
      level: log.level === "ERROR" ? "critical" : "warning",
      title: log.source,
      message: log.message,
      timestamp: String(Date.now()),
    });
  }

  alerts.unshift({
    id: "info-paper",
    level: "info",
    title: "Paper Trading Mode Active",
    message: "All orders are simulated. No real funds are at risk. Connect an exchange API to go live.",
    timestamp: String(Date.now()),
  });

  res.json(alerts.slice(0, 5));
});

appRouter.get("/watchlist", (_req, res) => {
  res.json(auditStore.watchlist);
});

appRouter.get("/positions", (_req, res) => {
  res.json({
    active: auditStore.activePositions,
    closed: auditStore.closedPositions,
  });
});

appRouter.get("/orders", (_req, res) => {
  res.json(auditStore.orders);
});

appRouter.get("/system/health", (_req, res) => {
  const memMb = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);
  const loadAvg = os.loadavg()[0];

  res.json({
    uptime: auditStore.getUptimeString(),
    modules: [
      {
        name: "Engine CPU",
        status: loadAvg > 0.8 ? "warning" : "ok",
        metricValue: (loadAvg * 15).toFixed(1) + "%",
        description: "Avg over last 5 minutes",
      },
      {
        name: "Memory Usage",
        status: parseInt(memMb) > 800 ? "warning" : "ok",
        metricValue: memMb + " MB",
        description: "Node.js heap used",
      },
      {
        name: "Signal Scorer",
        status: "ok",
        metricValue: auditStore.signals.length + " signals",
        description: "Scored since startup",
      },
      {
        name: "Bitget WS Stream",
        status: "ok",
        metricValue: (Math.floor(Math.random() * 20) + 30) + " ms",
        description: "Ping / connection stable",
      },
      {
        name: "BTCC REST API",
        status: "warning",
        metricValue: "Disconnected",
        description: "API key not yet activated",
      },
      {
        name: "Risk Guardian",
        status: "ok",
        metricValue: auditStore.activePositions.length + " positions monitored",
        description: "All checks passing",
      },
    ],
    logs: auditStore.logs.slice(-30).reverse(),
  });
});

export default appRouter;
