import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ApiError } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Exponential backoff retry strategy for transient failures
function shouldRetry(failureCount: number, error: Error): boolean {
  // Retry on network errors and 5xx server errors
  if (error instanceof ApiError) {
    return error.isRetryable && failureCount < 3;
  }
  // Retry on fetch/network errors
  return failureCount < 3 && (error.message.includes("fetch") || error.message.includes("Network"));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: shouldRetry,
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
      },
    },
    mutations: {
      retry: (failureCount) => shouldRetry(failureCount, new Error("Network request failed")),
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
    },
  },
});

// Global error handler for unhandled query errors
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
  },
});
