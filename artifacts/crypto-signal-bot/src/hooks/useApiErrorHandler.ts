import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onRetry?: () => void;
}

export function useApiErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast: shouldShowToast = true,
        logError: shouldLogError = true,
      } = options;

      let errorMessage = "An unexpected error occurred";
      let errorCode = "UNKNOWN_ERROR";
      let statusCode = 500;
      let requestId: string | undefined;

      if (error instanceof ApiError) {
        errorMessage = error.message;
        errorCode = error.code;
        statusCode = error.statusCode;
        requestId = error.requestId;

        // Log API errors with context
        if (shouldLogError) {
          console.error("[v0] API Error:", {
            code: errorCode,
            message: errorMessage,
            statusCode,
            requestId,
          });
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        if (shouldLogError) {
          console.error("[v0] Error:", errorMessage);
        }
      } else if (shouldLogError) {
        console.error("[v0] Unknown error:", error);
      }

      // Show toast notification
      if (shouldShowToast) {
        const toastMessage = getToastMessage(errorCode, errorMessage);
        const toastDescription = requestId ? `Request ID: ${requestId}` : undefined;

        toast({
          variant: "destructive",
          title: "Error",
          description: toastMessage,
          ...(toastDescription && { details: toastDescription }),
        });
      }

      return {
        errorMessage,
        errorCode,
        statusCode,
        requestId,
      };
    },
    [toast]
  );

  return { handleError };
}

/**
 * Get user-friendly error message based on error code
 */
function getToastMessage(code: string, fallback: string): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: "Network connection failed. Please check your internet connection.",
    VALIDATION_ERROR: "Invalid request data. Please review your input.",
    BAD_REQUEST: "Invalid request. Please check the parameters.",
    UNAUTHORIZED: "You are not authenticated. Please log in.",
    FORBIDDEN: "You do not have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    CONFLICT: "This action conflicts with existing data.",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
    INTERNAL_ERROR: "Server error. Please try again later.",
    SERVICE_UNAVAILABLE: "Service is temporarily unavailable. Please try again later.",
    INVALID_JSON: "Invalid JSON in request. Please check the data format.",
    CORS_ERROR: "Cross-origin request blocked. Please contact support.",
  };

  return messages[code] || fallback;
}
