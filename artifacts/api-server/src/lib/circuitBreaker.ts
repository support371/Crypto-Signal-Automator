import { logger } from "./logger";

export enum CircuitState {
  CLOSED = "CLOSED", // Normal operation, requests pass through
  OPEN = "OPEN", // Too many failures, requests fail immediately
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

export interface CircuitBreakerOptions {
  // Failure threshold before opening circuit (default: 5)
  failureThreshold?: number;
  // Reset timeout in milliseconds (default: 60000ms = 1 minute)
  resetTimeout?: number;
  // Half-open test requests before closing (default: 2)
  successThreshold?: number;
  // Timeout for individual requests in milliseconds (default: 5000ms)
  requestTimeout?: number;
  // Name for logging purposes
  name: string;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly successThreshold: number;
  private readonly requestTimeout: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 60000;
    this.successThreshold = options.successThreshold ?? 2;
    this.requestTimeout = options.requestTimeout ?? 5000;
    this.name = options.name;
  }

  /**
   * Execute a request through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (
        this.nextAttemptTime &&
        now >= this.nextAttemptTime
      ) {
        logger.info({ circuit: this.name }, "Circuit transitioning to HALF_OPEN for recovery test");
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        const error = new Error(
          `Circuit breaker is OPEN for ${this.name}. Request rejected.`
        );
        (error as any).code = "CIRCUIT_OPEN";
        throw error;
      }
    }

    // Execute with timeout
    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute with timeout wrapper
   */
  private executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          const error = new Error(`Request timeout for ${this.name}`);
          (error as any).code = "REQUEST_TIMEOUT";
          reject(error);
        }, this.requestTimeout)
      ),
    ]);
  }

  /**
   * Handle successful request
   */
  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        logger.info({ circuit: this.name }, "Circuit breaker CLOSED - service recovered");
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      logger.warn(
        { circuit: this.name },
        "Service still failing in HALF_OPEN state, reopening circuit"
      );
      this.openCircuit();
    } else if (this.failureCount >= this.failureThreshold) {
      logger.error(
        { circuit: this.name, failures: this.failureCount },
        "Circuit breaker threshold exceeded, opening circuit"
      );
      this.openCircuit();
    }
  }

  /**
   * Open the circuit
   */
  private openCircuit() {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.resetTimeout;
    this.failureCount = 0;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset the circuit (for testing)
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /**
   * Get circuit status for monitoring
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

/**
 * Factory for creating managed circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  create(options: CircuitBreakerOptions): CircuitBreaker {
    const breaker = new CircuitBreaker(options);
    this.breakers.set(options.name, breaker);
    return breaker;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getAll(): CircuitBreaker[] {
    return Array.from(this.breakers.values());
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus() {
    return Array.from(this.breakers.values()).map((b) => b.getStatus());
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager();
