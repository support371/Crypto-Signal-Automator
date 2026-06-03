import { describe, it, expect, beforeEach } from "vitest";
import { riskCheck, getGuardianStatus } from "../modules/guardian";
import { auditStore } from "../modules/auditStore";

describe("Guardian Module", () => {
  describe("riskCheck", () => {
    it("passes when score is above threshold and exposure is below limit", () => {
      const result = riskCheck(85, 5000);
      
      expect(result.passed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("rejects when score is below threshold", () => {
      const result = riskCheck(50, 5000);
      
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("Score 50 below threshold");
    });

    it("rejects when exposure exceeds limit", () => {
      const result = riskCheck(85, 15000);
      
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("exceeds max");
    });

    it("uses custom settings from auditStore when available", () => {
      // Set custom max exposure
      auditStore.riskSettings.maxExposure = 5000;
      
      const result = riskCheck(85, 6000);
      
      expect(result.passed).toBe(false);
      expect(result.reason).toContain("exceeds max $5000");
      
      // Reset
      auditStore.riskSettings.maxExposure = 10000;
    });

    it("passes at exact threshold score", () => {
      const result = riskCheck(70, 5000);
      
      expect(result.passed).toBe(true);
    });

    it("rejects just below threshold score", () => {
      const result = riskCheck(69, 5000);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("getGuardianStatus", () => {
    it("returns status object with required fields", () => {
      const status = getGuardianStatus();
      
      expect(status).toHaveProperty("totalExposure");
      expect(status).toHaveProperty("totalPnL");
      expect(status).toHaveProperty("activePositions");
      expect(status).toHaveProperty("maxExposure");
      expect(status).toHaveProperty("drawdownLimit");
      expect(status).toHaveProperty("status");
    });

    it("calculates total exposure from active positions", () => {
      const status = getGuardianStatus();
      
      // Should be a valid number string
      expect(parseFloat(status.totalExposure)).toBeGreaterThanOrEqual(0);
    });

    it("formats PnL with proper sign", () => {
      const status = getGuardianStatus();
      
      // Should start with + or - and contain $
      expect(status.totalPnL).toMatch(/^[+-]\$/);
    });

    it("reflects kill switch state from settings", () => {
      auditStore.riskSettings.enableKillSwitch = true;
      const status = getGuardianStatus();
      
      expect(status.killSwitchEnabled).toBe(true);
      
      auditStore.riskSettings.enableKillSwitch = false;
    });
  });
});
