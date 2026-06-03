import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] ErrorBoundary caught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleRetryWithDelay = () => {
    // Retry with a slight delay to ensure state is properly reset
    setTimeout(() => {
      this.handleReset();
    }, 100);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h2>
            <p className="max-w-md text-center text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="max-w-2xl rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="font-mono text-sm text-destructive">
                {this.state.error.message}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleRetryWithDelay}>
              Try Again
            </Button>
            <Button onClick={this.handleReload}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error("[v0] Handled error:", error);
    // In production, send to error tracking service
  };

  return { handleError };
}
