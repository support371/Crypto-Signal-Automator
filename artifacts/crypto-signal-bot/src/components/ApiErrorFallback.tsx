import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiErrorFallbackProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ApiErrorFallback({
  error,
  onRetry,
  title = "Failed to Load",
  description = "We encountered an error while loading this data. Please try again.",
}: ApiErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {typeof error === "string" ? (
        <p className="text-center text-xs text-destructive font-mono">{error}</p>
      ) : (
        <p className="text-center text-xs text-destructive font-mono">{error.message}</p>
      )}

      {onRetry && (
        <Button size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
