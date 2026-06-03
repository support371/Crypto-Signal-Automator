import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";

describe("API Routes", () => {
  describe("Health Endpoints", () => {
    it("GET /healthz returns 200 with status ok", async () => {
      const response = await request(app).get("/healthz");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("GET /readyz returns 200 with status ready", async () => {
      const response = await request(app).get("/readyz");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ready");
    });
  });

  describe("Dashboard Endpoints", () => {
    it("GET /api/dashboard/metrics returns array of metrics", async () => {
      const response = await request(app).get("/api/dashboard/metrics");
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);
      
      // Check metric structure
      const metric = response.body[0];
      expect(metric).toHaveProperty("label");
      expect(metric).toHaveProperty("value");
      expect(metric).toHaveProperty("trend");
      expect(metric).toHaveProperty("percentage");
    });
  });

  describe("Signals Endpoints", () => {
    it("GET /api/signals/recent returns paginated signals", async () => {
      const response = await request(app).get("/api/signals/recent");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Check pagination metadata
      expect(response.body.meta).toHaveProperty("page");
      expect(response.body.meta).toHaveProperty("limit");
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("totalPages");
    });

    it("GET /api/signals/recent respects pagination params", async () => {
      const response = await request(app)
        .get("/api/signals/recent")
        .query({ page: 1, limit: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("System Endpoints", () => {
    it("GET /api/system/alerts returns alerts array", async () => {
      const response = await request(app).get("/api/system/alerts");
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should always have at least the paper trading info alert
      expect(response.body.length).toBeGreaterThan(0);
      
      const alert = response.body[0];
      expect(alert).toHaveProperty("id");
      expect(alert).toHaveProperty("level");
      expect(alert).toHaveProperty("title");
      expect(alert).toHaveProperty("message");
    });

    it("GET /api/system/health returns health status", async () => {
      const response = await request(app).get("/api/system/health");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("modules");
      expect(response.body).toHaveProperty("logs");
      
      expect(Array.isArray(response.body.modules)).toBe(true);
      expect(Array.isArray(response.body.logs)).toBe(true);
    });
  });

  describe("Watchlist Endpoints", () => {
    it("GET /api/watchlist returns watchlist items", async () => {
      const response = await request(app).get("/api/watchlist");
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("Positions Endpoints", () => {
    it("GET /api/positions returns active and closed positions", async () => {
      const response = await request(app).get("/api/positions");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("active");
      expect(response.body).toHaveProperty("closed");
      expect(Array.isArray(response.body.active)).toBe(true);
      expect(Array.isArray(response.body.closed)).toBe(true);
    });
  });

  describe("Orders Endpoints", () => {
    it("GET /api/orders returns paginated orders", async () => {
      const response = await request(app).get("/api/orders");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
    });

    it("GET /api/orders accepts filter params", async () => {
      const response = await request(app)
        .get("/api/orders")
        .query({ status: "FILLED", limit: 10 });
      
      expect(response.status).toBe(200);
    });
  });

  describe("Risk Settings Endpoints", () => {
    it("GET /api/risk/settings returns risk configuration", async () => {
      const response = await request(app).get("/api/risk/settings");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("maxExposure");
      expect(response.body).toHaveProperty("maxPositionSize");
      expect(response.body).toHaveProperty("maxDailyLoss");
      expect(response.body).toHaveProperty("enableKillSwitch");
    });

    it("PUT /api/risk/settings validates input", async () => {
      // Invalid - missing required fields
      const response = await request(app)
        .put("/api/risk/settings")
        .send({ maxExposure: "invalid" });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("PUT /api/risk/settings updates settings with valid input", async () => {
      const response = await request(app)
        .put("/api/risk/settings")
        .send({
          maxExposure: 15000,
          maxPositionSize: 3000,
          maxDailyLoss: 750,
          enableKillSwitch: true,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.maxExposure).toBe(15000);
    });
  });

  describe("Exchanges Endpoints", () => {
    it("GET /api/exchanges returns exchange list", async () => {
      const response = await request(app).get("/api/exchanges");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("exchanges");
      expect(Array.isArray(response.body.exchanges)).toBe(true);
      expect(response.body.exchanges.length).toBeGreaterThan(0);
      
      const exchange = response.body.exchanges[0];
      expect(exchange).toHaveProperty("id");
      expect(exchange).toHaveProperty("name");
      expect(exchange).toHaveProperty("connected");
    });
  });

  describe("404 Handler", () => {
    it("Returns 404 for unknown routes", async () => {
      const response = await request(app).get("/api/unknown-route");
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toHaveProperty("code", "NOT_FOUND");
    });
  });

  describe("Security Headers", () => {
    it("Includes security headers in response", async () => {
      const response = await request(app).get("/healthz");
      
      // Helmet adds these headers
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
    });

    it("Includes request ID in response", async () => {
      const response = await request(app).get("/healthz");
      
      expect(response.headers).toHaveProperty("x-request-id");
    });
  });
});
