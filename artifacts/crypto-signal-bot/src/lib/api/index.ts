import { Metric, Position, Signal, SystemAlert, Order, SystemLog, ModuleHealth, WatchlistItem } from "@/types/api";

export const API_BASE_URL = "";

export const api = {
  getMetrics: async (): Promise<Metric[]> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/metrics`);
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  },

  getRecentSignals: async (): Promise<Signal[]> => {
    const response = await fetch(`${API_BASE_URL}/api/signals/recent`);
    if (!response.ok) throw new Error("Failed to fetch signals");
    return response.json();
  },

  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    const response = await fetch(`${API_BASE_URL}/api/system/alerts`);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  },

  getWatchlist: async (): Promise<WatchlistItem[]> => {
    const response = await fetch(`${API_BASE_URL}/api/watchlist`);
    if (!response.ok) throw new Error("Failed to fetch watchlist");
    return response.json();
  },

  getActivePositions: async (): Promise<Position[]> => {
    const response = await fetch(`${API_BASE_URL}/api/positions`);
    if (!response.ok) throw new Error("Failed to fetch positions");
    const data = await response.json();
    return data.active ?? [];
  },

  getClosedPositions: async (): Promise<Position[]> => {
    const response = await fetch(`${API_BASE_URL}/api/positions`);
    if (!response.ok) throw new Error("Failed to fetch positions");
    const data = await response.json();
    return data.closed ?? [];
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  getHealth: async (): Promise<{ modules: ModuleHealth[]; logs: SystemLog[]; uptime: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/system/health`);
    if (!response.ok) throw new Error("Failed to fetch health");
    return response.json();
  },
};
