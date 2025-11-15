import { TestInfo } from "@playwright/test";
import {
  APITestMetrics,
  APICallMetric,
  SchemaValidationMetric,
} from "../../model/metrics/MetricsModel";
import logger from "../../tests/utils/logger";

/**
 * Collector for API test metrics
 * Captures API calls, response times, schema validations, etc.
 */
export class APIMetricsCollector {
  private apiCalls: APICallMetric[] = [];
  private schemaValidations: SchemaValidationMetric[] = [];
  private startTime: number = 0;
  private testError?: {
    message: string;
    stack?: string;
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    };
  };

  /**
   * Start collecting metrics - call at the beginning of test
   */
  start(): void {
    this.startTime = performance.now();
    this.apiCalls = [];
    this.schemaValidations = [];
    this.testError = undefined;
  }

  /**
   * Record an API call with its metrics
   */
  recordAPICall(data: APICallMetric): void {
    this.apiCalls.push(data);
    logger.debug(
      `Recorded API call: ${data.method} ${data.endpoint} - ${data.responseTime}ms`,
    );
  }

  /**
   * Record a schema validation result
   */
  recordSchemaValidation(
    schema: string,
    valid: boolean,
    validationTime: number,
  ): void {
    this.schemaValidations.push({ schema, valid, validationTime });
    logger.debug(`Recorded schema validation: ${schema} - ${valid}`);
  }

  /**
   * Record test error information
   */
  recordError(
    error: Error,
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    },
  ): void {
    this.testError = {
      message: error.message,
      stack: error.stack,
    };

    if (apiError) {
      this.testError = {
        ...this.testError,
        apiError,
      };
    }
  }

  /**
   * Build the complete metrics object
   * Call this at the end of the test
   */
  buildMetrics(
    testInfo: TestInfo,
    metadata?: Record<string, unknown>,
  ): APITestMetrics {
    const duration = performance.now() - this.startTime;

    const totalApiTime = this.apiCalls.reduce(
      (sum, call) => sum + call.responseTime,
      0,
    );

    const averageResponseTime =
      this.apiCalls.length > 0 ? totalApiTime / this.apiCalls.length : 0;

    const slowestCall = this.apiCalls.reduce(
      (slowest, call) => {
        return call.responseTime > slowest.duration
          ? { endpoint: call.endpoint, duration: call.responseTime }
          : slowest;
      },
      { endpoint: "", duration: 0 },
    );

    const metrics: APITestMetrics = {
      testId: testInfo.testId,
      testName: testInfo.title,
      suiteName: testInfo.titlePath.slice(0, -1).join(" > "),
      timestamp: new Date().toISOString(),
      environment: process.env.CI ? "ci" : "local",
      status: this.mapStatus(testInfo.status),
      duration: Math.round(duration),
      retryCount: testInfo.retry,
      apiCalls: this.apiCalls,
      totalApiTime: Math.round(totalApiTime),
      averageResponseTime: Math.round(averageResponseTime),
      slowestCall: {
        endpoint: slowestCall.endpoint,
        duration: Math.round(slowestCall.duration),
      },
      schemaValidations: this.schemaValidations,
    };

    if (this.testError) {
      metrics.error = this.testError;
    }

    if (metadata) {
      metrics.metadata = metadata;
    }

    return metrics;
  }

  /**
   * Map Playwright test status to our metrics status
   */
  private mapStatus(
    status: string,
  ): "passed" | "failed" | "skipped" | "timedOut" {
    if (status === "passed") return "passed";
    if (status === "failed") return "failed";
    if (status === "skipped") return "skipped";
    if (status === "timedOut") return "timedOut";
    return "failed"; // default
  }

  /**
   * Get current API call count
   */
  getAPICallCount(): number {
    return this.apiCalls.length;
  }

  /**
   * Get total API time so far
   */
  getTotalAPITime(): number {
    return this.apiCalls.reduce((sum, call) => sum + call.responseTime, 0);
  }
}
