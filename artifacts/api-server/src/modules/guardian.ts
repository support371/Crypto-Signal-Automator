import { auditStore } from "./auditStore";

interface RiskCheckResult {
  passed: boolean;
  reason?: string;
}

const MAX_EXPOSURE_USD = 10_000;
const MAX_DAILY_DRAWDOWN_PCT = 5;
const MIN_SCORE_THRESHOLD = 70;

export function riskCheck(score: number, totalExposureUsd: number): RiskCheckResult {
  if (score < MIN_SCORE_THRESHOLD) {
    return { passed: false, reason: `Score ${score} below threshold ${MIN_SCORE_THRESHOLD}` };
  }
  if (totalExposureUsd > MAX_EXPOSURE_USD) {
    return { passed: false, reason: `Exposure $${totalExposureUsd} exceeds max $${MAX_EXPOSURE_USD}` };
  }
  return { passed: true };
}

export function startGuardian() {
  setInterval(() => {
    const totalExposure = auditStore.activePositions.reduce((sum, p) => {
      const price = parseFloat(p.currentPrice);
      const size = parseFloat(p.size);
      return sum + price * size;
    }, 0);

    const totalPnL = auditStore.activePositions.reduce((sum, p) => {
      const raw = parseFloat(p.pnl.replace(/[^0-9.-]/g, "")) * (p.pnl.startsWith("+") ? 1 : -1);
      return sum + raw;
    }, 0);

    const drawdownPct = totalExposure > 0 ? Math.abs(Math.min(0, totalPnL)) / totalExposure * 100 : 0;

    if (drawdownPct > MAX_DAILY_DRAWDOWN_PCT * 0.6) {
      auditStore.addLog("WARN", "RiskGuardian", `Daily drawdown at ${drawdownPct.toFixed(1)}% of ${MAX_DAILY_DRAWDOWN_PCT}% limit`);
    }

    if (totalExposure > MAX_EXPOSURE_USD * 0.8) {
      auditStore.addLog("WARN", "RiskGuardian", `Total exposure $${totalExposure.toFixed(0)} approaching limit of $${MAX_EXPOSURE_USD}`);
    }
  }, 60_000);

  auditStore.addLog("INFO", "RiskGuardian", `Loaded global rules. Max exposure=$${MAX_EXPOSURE_USD}, drawdown limit=${MAX_DAILY_DRAWDOWN_PCT}%`);
}

export function getGuardianStatus() {
  const totalExposure = auditStore.activePositions.reduce((sum, p) => {
    return sum + parseFloat(p.currentPrice) * parseFloat(p.size);
  }, 0);

  const totalPnL = auditStore.activePositions.reduce((sum, p) => {
    const mag = parseFloat(p.pnl.replace(/[^0-9.]/g, ""));
    return sum + (p.pnl.startsWith("+") ? mag : -mag);
  }, 0);

  return {
    totalExposure: totalExposure.toFixed(2),
    totalPnL: (totalPnL >= 0 ? "+" : "") + "$" + Math.abs(totalPnL).toFixed(2),
    activePositions: auditStore.activePositions.length,
    maxExposure: MAX_EXPOSURE_USD,
    drawdownLimit: MAX_DAILY_DRAWDOWN_PCT,
    status: "ok" as const,
  };
}
