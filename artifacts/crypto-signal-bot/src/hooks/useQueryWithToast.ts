import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import { useEffect } from "react";

interface UseQueryWithToastOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  showErrorToast?: boolean;
  errorTitle?: string;
  onError?: (error: TError) => void;
}

/**
 * Custom useQuery hook that automatically shows toast errors.
 * Wraps the standard useQuery with error toast integration.
 */
export function useQueryWithToast<TData, TError = ApiError>(
  options: UseQueryOptions<TData, TError> & UseQueryWithToastOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { toast } = useToast();
  const { showErrorToast = true, errorTitle = "Error", onError, ...queryOptions } = options;

  const query = useQuery<TData, TError>(queryOptions);

  // Show toast when error occurs
  useEffect(() => {
    if (query.error && showErrorToast) {
      let errorMessage = "An unexpected error occurred";

      if (query.error instanceof ApiError) {
        errorMessage = query.error.message;
      } else if (query.error instanceof Error) {
        errorMessage = query.error.message;
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      });

      // Call custom error handler if provided
      onError?.(query.error);
    }
  }, [query.error, showErrorToast, toast, errorTitle, onError]);

  return query;
}
