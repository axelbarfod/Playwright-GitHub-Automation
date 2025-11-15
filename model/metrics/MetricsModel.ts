/**
 * Metrics model definitions for test quality tracking
 * Different schemas for API tests vs E2E tests
 */

export interface APICallMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number; // milliseconds
  requestSize: number; // bytes
  responseSize: number; // bytes
  headers: Record<string, string>;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export interface SchemaValidationMetric {
  schema: string;
  valid: boolean;
  validationTime: number; // milliseconds
}

export interface APITestMetrics {
  // Test Identity
  testId: string;
  testName: string;
  suiteName: string;
  timestamp: string;
  environment: "local" | "ci";

  // Test Outcome
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number; // total test duration in ms
  retryCount: number;

  // API-Specific Metrics
  apiCalls: APICallMetric[];

  // Performance Aggregates
  totalApiTime: number;
  averageResponseTime: number;
  slowestCall: { endpoint: string; duration: number };

  // Schema Validation
  schemaValidations: SchemaValidationMetric[];

  // Error Details (if failed)
  error?: {
    message: string;
    stack?: string;
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    };
  };

  // Additional Context
  metadata?: Record<string, unknown>;
}

export interface PageMetric {
  url: string;
  loadTime: number; // page load event duration
  domContentLoaded: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
  totalSize: number; // bytes transferred
  requestCount: number;
}

export interface ActionMetric {
  action: "click" | "type" | "navigate" | "wait" | "scroll" | "select";
  selector: string;
  duration: number; // milliseconds
  screenshot?: string; // base64 or URL
}

export interface BrowserMetric {
  memoryUsage: number; // MB
  cpuUsage?: number; // percentage (if available)
}

export interface NetworkMetric {
  totalRequests: number;
  failedRequests: number;
  totalTransferred: number; // bytes
  resourceTypes: Record<string, number>; // e.g., { "script": 10, "stylesheet": 5 }
}

export interface VisualMetric {
  screenshotsTaken: number;
  visualDiff?: number; // percentage difference
  snapshotComparisons?: number;
}

export interface E2ETestMetrics {
  // Test Identity
  testId: string;
  testName: string;
  suiteName: string;
  timestamp: string;
  environment: "local" | "ci";
  browser: "chromium" | "firefox" | "webkit";

  // Test Outcome
  status: "passed" | "failed" | "flaky" | "skipped" | "timedOut";
  duration: number; // milliseconds
  retryCount: number;

  // Page Performance
  pageMetrics: PageMetric[];

  // Browser Performance
  browserMetrics: BrowserMetric;

  // User Actions
  actionMetrics: ActionMetric[];

  // Visual Regression
  visualMetrics?: VisualMetric;

  // Network
  networkMetrics: NetworkMetric;

  // Error Details (if failed)
  error?: {
    message: string;
    stack?: string;
    screenshot?: string; // base64 or URL
    trace?: string; // trace file URL or ID
    videoUrl?: string;
  };

  // Additional Context
  metadata?: Record<string, unknown>;
}

export type TestMetrics = APITestMetrics | E2ETestMetrics;
