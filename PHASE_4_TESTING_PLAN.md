# Phase 4: Testing & Coverage Planning

## Phase 4 Objectives
Establish comprehensive test coverage across all modules with focus on:
- Unit tests for core business logic (scoring, risk calculation, execution)
- Integration tests for module interactions
- E2E tests for user workflows
- Error scenario testing
- Performance/load testing

## Test Coverage Targets
- **Overall Coverage Target**: >80% statements
- **Critical Path Coverage**: >90% (Listener, Scorer, Executor, Guardian)
- **API Layer**: >85%
- **UI Components**: >70%

## Test Structure

### 1. Unit Tests

#### Backend Unit Tests

**Directory:** `/api-server/tests/unit/`

##### Scorer Module Tests
```
scorer.test.ts
├── scoreSignal()
│   ├── Returns valid score between 0-100
│   ├── Applies strategy multipliers correctly
│   ├── Handles missing data gracefully
│   └── Rejects low-confidence signals
├── Error scenarios
│   ├── Handles invalid pair data
│   ├── Recovers from calculation errors
│   └── Logs errors to audit trail
└── Integration with audit store
    ├── Signals persist to store
    └── Signal count respects limit (50)
```

**Executor Module Tests**
```
executor.test.ts
├── riskCheck()
│   ├── Returns pass/fail correctly
│   ├── Considers total exposure
│   ├── Calculates drawdown accurately
│   └── Respects kill switch threshold
├── Order creation
│   ├── Creates MARKET orders correctly
│   ├── Calculates amounts accurately
│   └── Updates position tracking
└── Error handling
    ├── Catches invalid price data
    ├── Handles missing pairs
    └── Logs rejection reasons
```

**Guardian Module Tests**
```
guardian.test.ts
├── Risk monitoring
│   ├── Calculates total exposure correctly
│   ├── Monitors drawdown percentage
│   ├── Alerts on limit approaches
│   └── Triggers kill switch appropriately
├── Configuration
│   ├── Loads risk settings
│   ├── Applies custom limits
│   └── Defaults to safe values
└── Error recovery
    ├── Handles calculation errors
    ├── Continues monitoring after errors
    └── Tracks error count
```

**Listener Module Tests**
```
listener.test.ts
├── Price updates
│   ├── Applies jitter correctly
│   ├── Updates positions with new prices
│   ├── Updates watchlist prices
│   └── Formats prices with correct decimals
├── Error handling
│   ├── Recovers from update errors
│   ├── Tracks error count
│   └── Stops after too many errors
└── Market data
    ├── Maintains all 6 pairs
    ├── Handles missing pairs gracefully
    └── Updates position PnL
```

**Circuit Breaker Tests**
```
circuitBreaker.test.ts
├── State transitions
│   ├── CLOSED → OPEN on threshold
│   ├── OPEN → HALF_OPEN after timeout
│   ├── HALF_OPEN → CLOSED on success
│   └── HALF_OPEN → OPEN on continued failure
├── Failure tracking
│   ├── Counts failures correctly
│   ├── Resets count on success
│   └── Respects max failure threshold
└── Request handling
    ├── Allows requests in CLOSED state
    ├── Rejects requests in OPEN state
    └── Tests circuit in HALF_OPEN state
```

#### Frontend Unit Tests

**Directory:** `/crypto-signal-bot/tests/unit/`

**Hooks Tests**
```
useApiErrorHandler.test.tsx
├── Error type detection
│   ├── Identifies network errors
│   ├── Identifies timeout errors
│   ├── Identifies API errors
│   └── Identifies validation errors
├── Message formatting
│   ├── User-friendly messages
│   ├── Error details included
│   └── Action suggestions
└── Integration
    ├── Triggers toast notifications
    ├── Handles error dismissal
    └── Updates error state
```

```
useQueryWithToast.test.tsx
├── Query wrapper
│   ├── Passes through query result
│   ├── Shows loading state
│   ├── Shows error state
│   └── Shows success state
├── Error handling
│   ├── Shows error toast on failure
│   ├── Allows retry
│   └── Clears error on retry
└── Success handling
    ├── Dismisses error toast on success
    ├── Updates data correctly
    └── Maintains query state
```

**Component Tests**
```
ErrorBoundary.test.tsx
├── Error catching
│   ├── Catches child errors
│   ├── Shows error UI
│   ├── Preserves error details
│   └── Shows stack trace in dev mode
├── Recovery
│   ├── "Try Again" button works
│   ├── "Reload Page" works
│   ├── Resets state on retry
│   └── Clears error display
└── Edge cases
    ├── Handles render errors
    ├── Handles lifecycle errors
    └── Handles async errors (with wrapper)
```

```
ApiErrorFallback.test.tsx
├── Error display
│   ├── Shows error type
│   ├── Shows error message
│   ├── Shows contextual help
│   └── Shows retry button
├── Network errors
│   ├── Handles connection refused
│   ├── Handles timeout
│   ├── Handles DNS failure
│   └── Suggests retry
├── API errors
│   ├── Displays 4xx errors
│   ├── Displays 5xx errors
│   ├── Suggests actions
│   └── Shows support link
└── Interactions
    ├── Retry button invalidates query
    ├── Close button dismisses error
    └── State clears correctly
```

### 2. Integration Tests

**Directory:** `/api-server/tests/integration/`

```
modules.integration.test.ts
├── Module initialization
│   ├── Listener starts and streams prices
│   ├── Scorer starts and produces signals
│   ├── Executor starts and processes signals
│   └── Guardian starts and monitors risk
├── Data flow
│   ├── Prices flow from Listener to Scorer
│   ├── Signals flow from Scorer to Executor
│   ├── Orders flow from Executor to audit store
│   ├── Risk data flows to Guardian
│   └── All data persists to DB
├── Error scenarios
│   ├── Listener error doesn't stop Scorer
│   ├── Scorer error doesn't stop Executor
│   ├── Single module failure isolated
│   └── System recovers from partial failures
└── Timing
    ├── Listener runs every 2s
    ├── Scorer runs every 30s
    ├── Executor runs every 15s
    └── Guardian runs every 60s
```

```
errorRecovery.integration.test.ts
├── Circuit breaker integration
│   ├── Opens on repeated failures
│   ├── Prevents cascading failures
│   ├── Recovers gracefully
│   └── Logs transitions
├── Retry mechanism
│   ├── Retries with exponential backoff
│   ├── Respects max retry count
│   ├── Logs retry attempts
│   └── Eventually succeeds or fails
├── Error aggregation
│   ├── Multiple errors tracked
│   ├── Error context preserved
│   ├── Related errors grouped
│   └── Old errors cleaned up
└── Graceful degradation
    ├── System continues with limited function
    ├── Data consistency maintained
    ├── User informed of limitations
    └── Recovery attempts logged
```

### 3. E2E Tests

**Directory:** `/crypto-signal-bot/tests/e2e/`

```
dashboard.e2e.test.ts
├── Dashboard loading
│   ├── Page loads without errors
│   ├── Initial data fetches
│   ├── UI renders correctly
│   └── All sections visible
├── Price updates
│   ├── Prices update in real-time
│   ├── Watchlist prices update
│   ├── Position PnL updates
│   └── UI reflects changes
├── Signal handling
│   ├── New signals appear
│   ├── Signal details display
│   ├── Score shown correctly
│   └── Action buttons visible
└── Error states
    ├── API failure shows error
    ├── Retry button works
    ├── Can continue after error
    └── Error dismissed on success
```

```
errorHandling.e2e.test.ts
├── Network error scenarios
│   ├── Connection loss handled gracefully
│   ├── Error message clear
│   ├── Retry succeeds when connection restored
│   ├── Auto-retry happens in background
│   └── User can manually retry
├── API error scenarios
│   ├── 5xx errors handled
│   ├── Rate limit (429) handled
│   ├── Timeout handled
│   ├── Invalid response handled
│   └── Error detail shown
├── Multiple error scenario
│   ├── Sequential errors handled
│   ├── Error context preserved
│   ├── Related errors grouped
│   └── Recovery sequence correct
└── Error boundary scenarios
    ├── Component error caught
    ├── Error UI displayed
    ├── Retry recovers component
    ├── Reload recovers app
    └── Error details preserved
```

## Test Implementation Strategy

### Phase 4A: Unit Tests (Week 1)
1. Set up test infrastructure (Jest, React Testing Library)
2. Implement scorer unit tests (5 tests)
3. Implement executor unit tests (5 tests)
4. Implement guardian unit tests (4 tests)
5. Implement circuit breaker tests (6 tests)
6. Coverage target: >80% for critical modules

### Phase 4B: Integration Tests (Week 2)
1. Module initialization tests (4 tests)
2. Data flow tests (5 tests)
3. Error recovery tests (6 tests)
4. Graceful degradation tests (4 tests)
5. Coverage target: >85% for integration paths

### Phase 4C: E2E Tests (Week 3)
1. Dashboard workflow tests (4 tests)
2. Error handling workflow tests (5 tests)
3. Real-time update verification (3 tests)
4. Recovery scenario tests (4 tests)
5. Coverage target: >70% for user-facing flows

### Phase 4D: Performance & Load Testing (Week 4)
1. Listener performance under load
2. Scorer throughput testing
3. Executor latency testing
4. Memory leak detection
5. Error handling under load

## Coverage Tools & Configuration

### Backend Coverage
```bash
# Run tests with coverage
jest --coverage

# Coverage thresholds (jest.config.js)
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/modules/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Frontend Coverage
```bash
# React component coverage
vitest --coverage

# Ignore coverage for UI-only components
// istanbul ignore next
```

## Success Criteria

### Phase 4 Complete When:
- [ ] All unit tests passing (30+ tests)
- [ ] All integration tests passing (20+ tests)
- [ ] All E2E tests passing (15+ tests)
- [ ] Coverage >80% overall
- [ ] Coverage >90% for critical paths
- [ ] No failing tests in CI
- [ ] Performance benchmarks established
- [ ] Documentation updated

### Error Handling Verified:
- [ ] Network errors handled gracefully
- [ ] API errors with proper messages
- [ ] Timeout errors trigger retry
- [ ] Module failures isolated
- [ ] Circuit breaker functions
- [ ] Graceful degradation works
- [ ] Error logs comprehensive
- [ ] Recovery succeeds

## Next Steps After Phase 4
- **Phase 5: Deployment & Optimization**
  - Production environment setup
  - Performance optimization
  - Monitoring & alerting
  - Documentation finalization
  - Go-live preparation
