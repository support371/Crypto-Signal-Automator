# Phase 3: Code Changes Reference

## New Files Created

### 1. Circuit Breaker Utility
**File:** `/artifacts/api-server/src/lib/circuitBreaker.ts`
**Lines:** 200+
**Purpose:** Implements circuit breaker pattern to prevent cascading failures

**Key Class: CircuitBreaker**
- Constructor: `new CircuitBreaker(options: CircuitBreakerOptions)`
- Methods:
  - `async execute<T>(fn: () => Promise<T>): Promise<T>`
  - `getState(): CircuitState`
  - `reset(): void`
- States: CLOSED, OPEN, HALF_OPEN
- Configuration:
  - `failureThreshold`: Number of failures before opening (default: 5)
  - `successThreshold`: Successes to close from HALF_OPEN (default: 2)
  - `timeout`: Time before OPEN → HALF_OPEN transition (default: 30s)

**Usage Example:**
```typescript
const breaker = new CircuitBreaker({ failureThreshold: 5 });
try {
  const result = await breaker.execute(() => externalServiceCall());
} catch (error) {
  if (error.message === "CIRCUIT_OPEN") {
    // Circuit breaker is open, fall back to cached data
  }
}
```

### 2. API Error Handler Hook
**File:** `/artifacts/crypto-signal-bot/src/hooks/useApiErrorHandler.ts`
**Lines:** 100+
**Purpose:** Integrates API errors with toast notifications

**Exported Hook: useApiErrorHandler**
- Returns: `{ handleError: (error: Error) => void }`
- Automatically:
  - Detects error type (network, timeout, API, validation)
  - Formats user-friendly error messages
  - Shows toast notification
  - Logs error context
- Error Types Handled:
  - `NetworkError`: Connection issues
  - `TimeoutError`: Request timeout
  - `ValidationError`: Input validation (400)
  - `AuthError`: Auth issues (401, 403)
  - `ServerError`: Server errors (5xx)

**Usage Example:**
```typescript
const { handleError } = useApiErrorHandler();

try {
  const data = await fetchData();
} catch (error) {
  handleError(error);
}
```

### 3. Query with Toast Hook
**File:** `/artifacts/crypto-signal-bot/src/hooks/useQueryWithToast.ts`
**Lines:** 50+
**Purpose:** React Query wrapper with automatic error display

**Exported Hook: useQueryWithToast**
- Wraps `useQuery` from React Query
- Automatically shows error toast on failure
- Allows custom error message formatting
- Provides retry button integration
- Returns: Same as useQuery with toast side effects

**Usage Example:**
```typescript
const { data, error, isLoading } = useQueryWithToast({
  queryKey: ['signals'],
  queryFn: () => fetchSignals(),
});
```

### 4. API Error Fallback Component
**File:** `/artifacts/crypto-signal-bot/src/components/ApiErrorFallback.tsx`
**Lines:** 45+
**Purpose:** UI component for displaying API errors

**Exported Component: ApiErrorFallback**
- Props:
  - `error: Error` - The error to display
  - `onRetry?: () => void` - Retry callback
- Features:
  - Error type specific UI
  - Network/timeout detection
  - Retry button
  - Support link
  - Contextual help messages

**Usage Example:**
```tsx
{error && (
  <ApiErrorFallback 
    error={error} 
    onRetry={() => queryClient.invalidateQueries()} 
  />
)}
```

## Modified Files

### Backend Modules (4 files)

#### 1. Listener Module
**File:** `/artifacts/api-server/src/modules/listener.ts`
**Changes:**
- Added module-level error counter: `let listenerErrorCount = 0`
- Error constant: `const LISTENER_MAX_ERRORS = 10`
- Enhanced `startListener()`:
  - Initialize error count to 0
  - Decrement error count on success: `listenerErrorCount = Math.max(0, listenerErrorCount - 1)`
  - Increment on error and log count
  - Stop listener if count exceeds threshold
- New method: Already has `stopListener()`, enhanced error handling

**Lines Added:** ~30

#### 2. Scorer Module
**File:** `/artifacts/api-server/src/modules/scorer.ts`
**Changes:**
- Added error tracking state at module level
- Error constants: `SCORER_MAX_ERRORS = 10`
- Enhanced `startScorer()`:
  - Initialize error count
  - Success recovery (decrement count)
  - Error increment with context logging
  - Auto-stop on threshold breach
  - Error count in log messages

**Lines Added:** ~25

#### 3. Executor Module
**File:** `/artifacts/api-server/src/modules/executor.ts`
**Changes:**
- Added error counter state
- Constants for max errors and reset threshold
- Enhanced `startExecutor()`:
  - Error count initialization
  - Success callback to decrement count
  - Error handling with count increment
  - Threshold check and module stop
  - Detailed error logging with count

**Lines Added:** ~25

#### 4. Guardian Module
**File:** `/artifacts/api-server/src/modules/guardian.ts`
**Changes:**
- Added risk monitoring error tracking
- Error state: `let guardianErrorCount = 0`
- Enhanced `startGuardian()`:
  - Error counter reset on start
  - Success recovery (decrement)
  - Error increment with logging
  - Graceful module stop on threshold
  - Error context in audit trail

**Lines Added:** ~25

### Frontend Components (1 file)

#### ErrorBoundary Component
**File:** `/artifacts/crypto-signal-bot/src/components/ErrorBoundary.tsx`
**Changes:**
- Added new method: `handleRetryWithDelay()`
  - Uses `setTimeout` for proper state reset
  - Ensures error state fully clears before retry
- Updated render method:
  - Changed "Try Again" button to use `handleRetryWithDelay`
  - Maintains "Reload Page" button functionality
  - Improved UX with controlled retry timing

**Lines Added:** ~7

### Configuration Files

#### Query Client Configuration
**File:** `/artifacts/crypto-signal-bot/src/lib/queryClient.ts`
**Changes:**
- Added import: `import { ApiError } from "./api"`
- New function: `shouldRetry()` with retry logic
  - Checks error type
  - Validates retry count
  - Returns boolean
- Enhanced QueryClient options:
  - `retry: shouldRetry` (function-based)
  - `retryDelay` with exponential backoff
  - Backoff formula: `Math.min(1000 * Math.pow(2, attemptIndex), 10000)`
- Applied to both queries and mutations

**Lines Added:** ~20

## Error Handling Flow

### Backend Error Flow
```
Module Interval Tick
├─ Try: Execute module logic
├─ Success: Decrement error counter
└─ Catch Error:
   ├─ Increment error counter
   ├─ Log error with count
   ├─ Check if count >= MAX_ERRORS
   └─ If threshold exceeded:
      ├─ Log critical error
      ├─ Add to audit trail
      └─ Stop module (circuit breaker)
```

### Frontend Error Flow
```
API Call
├─ Try: Fetch data
├─ Success: Show data, hide error
└─ Catch Error:
   ├─ Detect error type
   ├─ Format user message
   ├─ Show toast notification
   ├─ Log error
   └─ Provide retry option
```

## Integration Points

### Modules Integration
- Listener errors isolated (doesn't stop Scorer/Executor/Guardian)
- Scorer errors isolated (doesn't stop Executor/Guardian)
- Executor errors isolated (doesn't stop Guardian)
- Guardian errors isolated (doesn't affect trading)

### Circuit Breaker Integration
- Wraps external API calls
- Prevents cascading service failures
- Auto-recovery testing after cooldown
- Fallback to cached data when open

### Query Client Integration
- Automatic retry on transient failures
- Exponential backoff between retries
- Skip retries on permanent errors
- Configurable per query type

## Backward Compatibility

All changes are backward compatible:
- Existing module logic unchanged
- Error tracking added non-invasively
- Circuit breaker is optional utility
- Toast integration additive only
- Error boundary improvements non-breaking

## Performance Impact

Minimal overhead:
- Error counters: Single integer, negligible memory
- Check on each interval: O(1) operation
- Toast notifications: Async, non-blocking
- Circuit breaker: State machine, ~1ms per request

## Logging & Observability

All errors logged with:
- Timestamp
- Module name
- Error type
- Error count (for modules)
- Full stack trace (development)
- User context (when available)

Audit trail captures:
- Error sequence
- Recovery attempts
- Module state changes
- System-wide error patterns

## Testing Recommendations

See `PHASE_4_TESTING_PLAN.md` for comprehensive testing strategy including:
- Unit tests for each error scenario
- Integration tests for module interactions
- E2E tests for user error recovery flows
- Performance tests under load
- Memory leak detection tests
