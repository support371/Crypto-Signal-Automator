import type { Metric, Position, Signal, SystemAlert, Order, SystemLog, ModuleHealth, WatchlistItem } from "@/types/api";

export const API_BASE_URL = "";

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // ms
  maxDelay: 10000, // ms
};

// API error class for structured error handling
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly requestId?: string;

  constructor(statusCode: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.requestId = requestId;
  }

  get isRetryable(): boolean {
    // Retry on network errors, rate limits, and server errors
    return this.statusCode >= 500 || this.statusCode === 429 || this.statusCode === 0;
  }
}

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Calculate exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelay);
};

// Enhanced fetch with retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Parse error response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new ApiError(
          response.status,
          errorData.error?.code || "UNKNOWN_ERROR",
          errorData.error?.message || `HTTP error ${response.status}`,
          errorData.error?.requestId
        );

        // Don't retry client errors (except rate limits)
        if (!error.isRetryable) {
          throw error;
        }

        lastError = error;

        // Retry with backoff
        if (attempt < retries) {
          const delay = getRetryDelay(attempt);
          console.warn(`[v0] API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue;
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        lastError = new ApiError(0, "NETWORK_ERROR", "Network connection failed");

        if (attempt < retries) {
          const delay = getRetryDelay(attempt);
          console.warn(`[v0] Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Paginated response type
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const api = {
  // Dashboard
  getMetrics: async (): Promise<Metric[]> => {
    return fetchWithRetry<Metric[]>(`${API_BASE_URL}/api/dashboard/metrics`);
  },

  // Signals
  getRecentSignals: async (page = 1, limit = 20): Promise<Signal[]> => {
    const response = await fetchWithRetry<PaginatedResponse<Signal> | Signal[]>(
      `${API_BASE_URL}/api/signals/recent?page=${page}&limit=${limit}`
    );
    // Handle both old array format and new paginated format
    return Array.isArray(response) ? response : response.data;
  },

  // System
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    return fetchWithRetry<SystemAlert[]>(`${API_BASE_URL}/api/system/alerts`);
  },

  // Watchlist
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    return fetchWithRetry<WatchlistItem[]>(`${API_BASE_URL}/api/watchlist`);
  },

  addToWatchlist: async (item: { symbol: string; targetScore?: number; enabled?: boolean }): Promise<WatchlistItem> => {
    return fetchWithRetry<WatchlistItem>(`${API_BASE_URL}/api/watchlist`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  removeFromWatchlist: async (symbol: string): Promise<void> => {
    await fetchWithRetry<void>(`${API_BASE_URL}/api/watchlist/${symbol}`, {
      method: "DELETE",
    });
  },

  // Positions
  getActivePositions: async (): Promise<Position[]> => {
    const data = await fetchWithRetry<{ active: Position[]; closed: Position[] }>(
      `${API_BASE_URL}/api/positions`
    );
    return data.active ?? [];
  },

  getClosedPositions: async (): Promise<Position[]> => {
    const data = await fetchWithRetry<{ active: Position[]; closed: Position[] }>(
      `${API_BASE_URL}/api/positions`
    );
    return data.closed ?? [];
  },

  // Orders
  getOrders: async (filters?: {
    status?: string;
    symbol?: string;
    side?: string;
    page?: number;
    limit?: number;
  }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.symbol) params.set("symbol", filters.symbol);
    if (filters?.side) params.set("side", filters.side);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/orders${queryString ? `?${queryString}` : ""}`;
    const response = await fetchWithRetry<PaginatedResponse<Order> | Order[]>(url);
    return Array.isArray(response) ? response : response.data;
  },

  // Health
  getHealth: async (): Promise<{ modules: ModuleHealth[]; logs: SystemLog[]; uptime: string }> => {
    return fetchWithRetry<{ modules: ModuleHealth[]; logs: SystemLog[]; uptime: string }>(
      `${API_BASE_URL}/api/system/health`
    );
  },

  // Risk Settings
  getRiskSettings: async (): Promise<{
    maxExposure: number;
    maxPositionSize: number;
    maxDailyLoss: number;
    enableKillSwitch: boolean;
    allowedSymbols: string[];
  }> => {
    return fetchWithRetry(`${API_BASE_URL}/api/risk/settings`);
  },

  updateRiskSettings: async (settings: {
    maxExposure: number;
    maxPositionSize: number;
    maxDailyLoss: number;
    enableKillSwitch: boolean;
    allowedSymbols?: string[];
  }): Promise<void> => {
    await fetchWithRetry(`${API_BASE_URL}/api/risk/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },

  // Exchanges
  getExchanges: async (): Promise<{
    exchanges: Array<{
      id: string;
      name: string;
      connected: boolean;
      testnet: boolean;
      hasCredentials: boolean;
    }>;
  }> => {
    return fetchWithRetry(`${API_BASE_URL}/api/exchanges`);
  },

  connectExchange: async (
    exchange: string,
    config: {
      apiKey: string;
      apiSecret: string;
      passphrase?: string;
      testnet?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> => {
    return fetchWithRetry(`${API_BASE_URL}/api/exchanges/${exchange}/connect`, {
      method: "POST",
      body: JSON.stringify({ exchange, ...config }),
    });
  },
};

// Export error class for external use
export { ApiError as APIError };
