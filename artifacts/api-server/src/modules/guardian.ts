import { auditStore } from "./auditStore";
import { logger } from "../lib/logger";

interface RiskCheckResult {
  passed: boolean;
  reason?: string;
}

const MAX_EXPOSURE_USD = 10_000;
const MAX_DAILY_DRAWDOWN_PCT = 5;
const MIN_SCORE_THRESHOLD = 70;

let guardianInterval: NodeJS.Timeout | null = null;
let guardianErrorCount = 0;
const GUARDIAN_MAX_ERRORS = 10;

/** Parse a PnL string like "+$73.32" or "-$85.00" into a signed number. */
function parsePnL(pnl: string): number {
  const magnitude = parseFloat(pnl.replace(/[^0-9.]/g, ""));
  return pnl.startsWith("-") ? -magnitude : magnitude;
}

export function riskCheck(score: number, totalExposureUsd: number): RiskCheckResult {
  // Use dynamic settings from auditStore if available
  const settings = auditStore.riskSettings;
  const maxExposure = settings?.maxExposure || MAX_EXPOSURE_USD;
  const minScore = MIN_SCORE_THRESHOLD;

  if (score < minScore) {
    return { passed: false, reason: `Score ${score} below threshold ${minScore}` };
  }
  if (totalExposureUsd > maxExposure) {
    return { passed: false, reason: `Exposure $${totalExposureUsd.toFixed(0)} exceeds max $${maxExposure}` };
  }
  return { passed: true };
}

export function startGuardian() {
  if (guardianInterval) {
    logger.warn("Guardian already running");
    return;
  }

  guardianErrorCount = 0;

  guardianInterval = setInterval(() => {
    try {
      const settings = auditStore.riskSettings;
      const maxExposure = settings?.maxExposure || MAX_EXPOSURE_USD;
      const maxDrawdown = settings?.maxDailyLoss || MAX_DAILY_DRAWDOWN_PCT;

      const totalExposure = auditStore.activePositions.reduce((sum, p) => {
        return sum + parseFloat(p.currentPrice) * parseFloat(p.size);
      }, 0);

      const totalPnL = auditStore.activePositions.reduce((sum, p) => {
        return sum + parsePnL(p.pnl);
      }, 0);

      const drawdownPct =
        totalExposure > 0 ? (Math.abs(Math.min(0, totalPnL)) / totalExposure) * 100 : 0;

      // Check kill switch
      if (settings?.enableKillSwitch && (drawdownPct > maxDrawdown || totalExposure > maxExposure)) {
        auditStore.addLog(
          "ERROR",
          "RiskGuardian",
          `KILL SWITCH TRIGGERED: Drawdown ${drawdownPct.toFixed(1)}% or exposure $${totalExposure.toFixed(0)} exceeded limits`,
        );
        // In production, this would close all positions
      }

      if (drawdownPct > maxDrawdown * 0.6) {
        auditStore.addLog(
          "WARN",
          "RiskGuardian",
          `Daily drawdown at ${drawdownPct.toFixed(1)}% of ${maxDrawdown}% limit`,
        );
      }

      if (totalExposure > maxExposure * 0.8) {
        auditStore.addLog(
          "WARN",
          "RiskGuardian",
          `Total exposure $${totalExposure.toFixed(0)} approaching limit of $${maxExposure}`,
        );
      }

      // Reset error count on successful operation
      guardianErrorCount = Math.max(0, guardianErrorCount - 1);
    } catch (error) {
      guardianErrorCount++;
      const errorMsg = (error as Error).message;

      logger.error({ error, errorCount: guardianErrorCount }, "Error in guardian tick");
      auditStore.addLog("ERROR", "RiskGuardian", `Guardian error: ${errorMsg}`);

      // Stop guardian if too many errors
      if (guardianErrorCount >= GUARDIAN_MAX_ERRORS) {
        logger.error({ errorCount: guardianErrorCount }, "Guardian exceeded error threshold, stopping");
        auditStore.addLog(
          "ERROR",
          "RiskGuardian",
          `Guardian stopped due to recurring errors (${guardianErrorCount} consecutive failures)`
        );
        stopGuardian();
      }
    }
  }, 60_000);

  auditStore.addLog(
    "INFO",
    "RiskGuardian",
    `Loaded global rules. Max exposure=$${MAX_EXPOSURE_USD}, drawdown limit=${MAX_DAILY_DRAWDOWN_PCT}%`,
  );
  logger.info("Guardian module started");
}

export function stopGuardian() {
  if (guardianInterval) {
    clearInterval(guardianInterval);
    guardianInterval = null;
    logger.info("Guardian module stopped");
    auditStore.addLog("INFO", "RiskGuardian", "Risk guardian stopped");
  }
}

export function getGuardianStatus() {
  const settings = auditStore.riskSettings;
  const maxExposure = settings?.maxExposure || MAX_EXPOSURE_USD;
  const maxDrawdown = settings?.maxDailyLoss || MAX_DAILY_DRAWDOWN_PCT;

  const totalExposure = auditStore.activePositions.reduce((sum, p) => {
    return sum + parseFloat(p.currentPrice) * parseFloat(p.size);
  }, 0);

  const totalPnL = auditStore.activePositions.reduce((sum, p) => {
    return sum + parsePnL(p.pnl);
  }, 0);

  return {
    totalExposure: totalExposure.toFixed(2),
    totalPnL: (totalPnL >= 0 ? "+" : "") + "$" + Math.abs(totalPnL).toFixed(2),
    activePositions: auditStore.activePositions.length,
    maxExposure,
    drawdownLimit: maxDrawdown,
    killSwitchEnabled: settings?.enableKillSwitch || false,
    status: "ok" as const,
  };
}
