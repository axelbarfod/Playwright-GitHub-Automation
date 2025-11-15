# Test Metrics Collection

This project includes comprehensive metrics collection for tracking quality and performance across API and E2E tests.

## Overview

The metrics system automatically captures and sends test metrics to a configured API endpoint. Metrics collection is **optional** and gracefully disabled if not configured.

### Key Features

- **Separate schemas** for API tests vs E2E tests
- **Automatic collection** via Playwright fixtures
- **Non-intrusive** - doesn't fail tests if metrics fail
- **Comprehensive tracking** - response times, test outcomes, browser performance, etc.
- **Graceful degradation** - works without configuration

## Architecture

```
Tests → Metrics Collector → MetricsService → HTTP POST → Your API Endpoint
```

## Configuration

### 1. Set Environment Variables

Add to your `.env` file:

```bash
METRICS_ENDPOINT=https://your-metrics-api.com
METRICS_API_KEY=your_secret_api_key
```

Leave these empty or unset to disable metrics collection.

### 2. API Endpoint Requirements

Your metrics API should accept POST requests at:

- `/api/metrics/api-tests` - for API test metrics
- `/api/metrics/e2e-tests` - for E2E test metrics

**Headers:**

- `Content-Type: application/json`
- `Authorization: Bearer {METRICS_API_KEY}`

## Metrics Schemas

### API Test Metrics

Sent to: `/api/metrics/api-tests`

```typescript
{
  // Test Identity
  testId: string;
  testName: string;
  suiteName: string;
  timestamp: string; // ISO 8601
  environment: "local" | "ci";

  // Test Outcome
  status: "passed" | "failed" | "skipped" | "timedOut";
  duration: number; // milliseconds
  retryCount: number;

  // API Performance
  apiCalls: [
    {
      endpoint: string;
      method: "GET" | "POST" | "DELETE" | ...;
      statusCode: number;
      responseTime: number; // ms
      requestSize: number; // bytes
      responseSize: number; // bytes
      rateLimitRemaining: number;
      rateLimitReset: number;
    }
  ];

  // Performance Aggregates
  totalApiTime: number;
  averageResponseTime: number;
  slowestCall: {
    endpoint: string;
    duration: number;
  };

  // Schema Validations
  schemaValidations: [
    {
      schema: string;
      valid: boolean;
      validationTime: number;
    }
  ];

  // Error Details (if failed)
  error?: {
    message: string;
    stack: string;
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    };
  };
}
```

### E2E Test Metrics

Sent to: `/api/metrics/e2e-tests`

```typescript
{
  // Test Identity
  testId: string;
  testName: string;
  suiteName: string;
  timestamp: string;
  environment: "local" | "ci";
  browser: "chromium" | "firefox" | "webkit";

  // Test Outcome
  status: "passed" | "failed" | "flaky" | "skipped" | "timedOut";
  duration: number;
  retryCount: number;

  // Page Performance
  pageMetrics: [
    {
      url: string;
      loadTime: number;
      domContentLoaded: number;
      firstContentfulPaint: number;
      timeToInteractive: number;
      totalSize: number; // bytes
      requestCount: number;
    }
  ];

  // Browser Performance
  browserMetrics: {
    memoryUsage: number; // MB
    cpuUsage: number; // optional
  };

  // User Actions
  actionMetrics: [
    {
      action: "click" | "type" | "navigate" | "wait" | "scroll";
      selector: string;
      duration: number;
    }
  ];

  // Network Activity
  networkMetrics: {
    totalRequests: number;
    failedRequests: number;
    totalTransferred: number;
    resourceTypes: {
      "script": 10,
      "stylesheet": 5,
      ...
    };
  };

  // Visual Regression (if applicable)
  visualMetrics?: {
    screenshotsTaken: number;
    visualDiff: number; // percentage
  };

  // Error Details
  error?: {
    message: string;
    stack: string;
    screenshot: string; // base64 or URL
    trace: string; // trace file location
  };
}
```

## Usage in Tests

### API Tests

Metrics are **automatically collected** when using the `GithubFixture`:

```typescript
import { test, expect } from "../../../fixture/GithubFixture";

test("Get Issues", async ({ githubIssueService, metricsCollector }) => {
  const issues = await githubIssueService.getIssues();

  expect(issues.length).toBeGreaterThan(0);

  // Optional: Record schema validation metrics
  const startTime = performance.now();
  const isValid = validateSchema(issues);
  const validationTime = performance.now() - startTime;

  metricsCollector.recordSchemaValidation(
    "issues.json",
    isValid,
    validationTime,
  );
});
```

**Automatically captured:**

- All API calls (endpoint, response time, status code)
- Rate limit information
- Request/response sizes
- Test duration and outcome
- Retry count

### E2E Tests

Metrics are **automatically collected** when using the `GithubUIFixture`:

```typescript
import { test, expect } from "../../../fixture/ui/GithubUIFixture";

test("Login Flow", async ({ page, metricsCollector }) => {
  // Navigate to login page
  await page.goto("/login");

  // Optional: Record page metrics after navigation
  await metricsCollector.recordPageMetrics(page);

  // Perform login
  const actionStart = performance.now();
  await page.click("#login-button");

  // Optional: Record action metrics
  metricsCollector.recordAction(
    "click",
    "#login-button",
    performance.now() - actionStart,
  );

  await expect(page).toHaveURL("/dashboard");
});
```

**Automatically captured:**

- Page performance (load time, FCP, TTI)
- Browser memory usage
- Network requests and transfer sizes
- Test duration and outcome
- Screenshots (if taken)

## Advanced Usage

### Recording Custom Metadata

```typescript
test("My Test", async ({ metricsCollector }) => {
  // Test code...

  // Add custom metadata to metrics
  const metadata = {
    feature: "authentication",
    team: "platform",
    priority: "high",
  };

  // Metadata will be included in the final metrics payload
});
```

### Manual Error Recording

```typescript
test("My Test", async ({ metricsCollector }) => {
  try {
    await someOperation();
  } catch (error) {
    // Manually record error details
    metricsCollector.recordError(error, {
      endpoint: "/api/endpoint",
      statusCode: 500,
      errorBody: "Server error",
    });
    throw error;
  }
});
```

## What Gets Tracked

### For Every Test (API & E2E)

- Test name and suite
- Pass/fail status
- Execution duration
- Retry count
- Timestamp
- Environment (local vs CI)

### API Tests Specifically

- Individual API call metrics (URL, method, response time)
- HTTP status codes
- Request/response sizes
- Rate limit consumption
- Schema validation results
- Slowest API call identification
- Total API time vs test duration

### E2E Tests Specifically

- Page load performance
- Browser resource usage (memory)
- Network activity (requests, transfer size)
- User action timings (clicks, typing)
- Screenshots taken
- Visual regression data (if applicable)

## Monitoring & Analysis

Once metrics are sent to your endpoint, you can:

1. **Track trends** over time
2. **Identify slow tests** and API calls
3. **Monitor flakiness** rates
4. **Analyze performance** regressions
5. **Generate dashboards** for test health
6. **Alert on failures** or performance degradation
7. **Correlate metrics** across API and E2E tests

## Troubleshooting

### Metrics not being sent

1. Check environment variables are set in `.env`:

   ```bash
   METRICS_ENDPOINT=https://your-api.com
   METRICS_API_KEY=your-key
   ```

2. Look for log messages:
   - `"Metrics collection disabled"` - env vars not set
   - `"Sending metrics to..."` - metrics are being sent
   - `"Failed to send metrics"` - endpoint returned error

3. Verify your API endpoint accepts POST requests with JSON

### Tests fail when metrics enabled

This should **never happen** - metrics collection is wrapped in try-catch and won't fail tests. If you see test failures related to metrics, please file an issue.

### Performance impact

Metrics collection has minimal overhead:

- API metrics: ~5-10ms per test
- E2E metrics: ~50-100ms per test (due to page evaluation)

## Implementation Details

### File Structure

```
model/metrics/
  └── MetricsModel.ts          # TypeScript interfaces

service/metrics/
  ├── MetricsService.ts        # HTTP POST to endpoint
  ├── APIMetricsCollector.ts   # API test metrics
  └── E2EMetricsCollector.ts   # E2E test metrics

fixture/
  ├── GithubFixture.ts         # API test fixture
  └── ui/GithubUIFixture.ts    # E2E test fixture
```

### Data Flow

1. **Test starts** → Collector initializes
2. **Test runs** → Metrics captured automatically
3. **Test ends** → Collector builds metrics payload
4. **Fixture teardown** → MetricsService sends HTTP POST
5. **Success or failure** → Logged (doesn't affect test result)

## Future Enhancements

Potential improvements to consider:

- Batch metrics for better performance
- Local storage fallback if endpoint unavailable
- Metrics dashboard generation
- Automated performance regression detection
- Flakiness scoring algorithm
- Test execution cost tracking
- Parallel test execution metrics
- Custom reporter for real-time metrics viewing
