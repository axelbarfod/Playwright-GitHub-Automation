# Test Metrics Collection Architecture - Complete Technical Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Metrics Collection Flow](#metrics-collection-flow)
4. [Component Deep Dive](#component-deep-dive)
5. [Interception Points](#interception-points)
6. [Data Storage](#data-storage)
7. [Implementation Details](#implementation-details)
8. [Troubleshooting](#troubleshooting)

## Overview

Our test metrics collection system provides comprehensive monitoring and analytics for both API and E2E tests in the Playwright GitHub Automation framework. The system automatically captures, processes, and stores detailed performance metrics without impacting test execution.

### Key Features

- **Zero-impact collection**: Metrics collection never causes test failures
- **Automatic interception**: All API calls and browser interactions are tracked transparently
- **Type-safe implementation**: Full TypeScript support with strong typing
- **Database persistence**: MySQL storage with TypeORM for scalable data management
- **Dual collection modes**: Separate collectors for API and E2E tests

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TEST EXECUTION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐                      ┌──────────────────┐              │
│  │   API Tests     │                      │   E2E Tests     │               │
│  │ (.spec.ts)      │                      │  (.spec.ts)      │               │
│  └────────┬────────┘                      └────────┬─────────┘              │
│           │                                         │                        │
│           ▼                                         ▼                        │
│  ┌─────────────────┐                      ┌──────────────────┐              │
│  │ GithubFixture   │                      │ GithubUIFixture  │               │
│  │                 │                      │                  │               │
│  │ - Injects       │                      │ - Injects        │               │
│  │   collector     │                      │   collector      │               │
│  │ - Auto-sends    │                      │ - Auto-sends     │               │
│  │   metrics       │                      │   metrics        │               │
│  └────────┬────────┘                      └────────┬─────────┘              │
│           │                                         │                        │
└───────────┼─────────────────────────────────────────┼───────────────────────┘
            │                                         │
┌───────────┼─────────────────────────────────────────┼───────────────────────┐
│           ▼              COLLECTION LAYER           ▼                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────┐                ┌──────────────────────┐            │
│  │ APIMetricsCollector │                │ E2EMetricsCollector  │            │
│  │                     │                │                      │            │
│  │ Captures:           │                │ Captures:            │            │
│  │ - API calls         │                │ - Page loads         │            │
│  │ - Response times    │                │ - User actions       │            │
│  │ - Schema validation │                │ - Network activity   │            │
│  │ - Errors           │                │ - Browser metrics    │            │
│  └──────────┬──────────┘                └───────────┬──────────┘            │
│             │                                        │                       │
│             └────────────────┬───────────────────────┘                       │
│                              ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │  MetricsService  │                                     │
│                    │                  │                                     │
│                    │ - HTTP POST      │                                     │
│                    │ - Bearer Auth    │                                     │
│                    │ - Retry logic    │                                     │
│                    └─────────┬────────┘                                     │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────────┐
│                              ▼          STORAGE LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                    ┌──────────────────┐                                     │
│                    │  Metrics Server  │                                     │
│                    │   (Express.js)   │                                     │
│                    │                  │                                     │
│                    │ Endpoints:       │                                     │
│                    │ /api/metrics/    │                                     │
│                    │   ├── api-tests  │                                     │
│                    │   └── e2e-tests  │                                     │
│                    └─────────┬────────┘                                     │
│                              │                                               │
│                              ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │     TypeORM      │                                     │
│                    │                  │                                     │
│                    │ - Migrations     │                                     │
│                    │ - Entities       │                                     │
│                    │ - Repositories   │                                     │
│                    └─────────┬────────┘                                     │
│                              │                                               │
│                              ▼                                               │
│                    ┌──────────────────┐                                     │
│                    │  MySQL Database  │                                     │
│                    │                  │                                     │
│                    │ Tables:          │                                     │
│                    │ - api_test_metrics│                                    │
│                    │ - e2e_test_metrics│                                    │
│                    └──────────────────┘                                     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Metrics Collection Flow

### 1. Test Initialization Phase

```typescript
// When test starts, fixture automatically initializes collector
test("My API Test", async ({ githubIssueService, metricsCollector }) => {
  // metricsCollector is already started and injected
  // githubIssueService already has metricsCollector attached
});
```

**What happens behind the scenes:**

1. **Fixture Creation** (`fixture/GithubFixture.ts:16-21`)

   ```typescript
   metricsCollector: async ({}, use, testInfo) => {
     const collector = new APIMetricsCollector();
     collector.start(); // Records start time
     await use(collector);
     // After test completes, metrics are built and sent
   };
   ```

2. **Service Injection** (`fixture/GithubFixture.ts:28-33`)
   ```typescript
   githubIssueService: async ({ request, metricsCollector }, use) => {
     // Collector is passed to service constructor
     const service = new GithubIssueService(request, metricsCollector);
     await use(service);
   };
   ```

### 2. Runtime Interception

#### API Test Interception Points

**Every API call is intercepted at the BaseGithubService level:**

```typescript
// service/base/BaseGithubService.ts:40-67
protected async get(url: string, _operation: string): Promise<APIResponse> {
  const startTime = performance.now();
  const response = await this.request.get(url);
  const responseTime = performance.now() - startTime;

  if (this.metricsCollector) {
    this.metricsCollector.recordAPICall({
      endpoint: response.url(),
      method: "GET",
      statusCode: response.status(),
      responseTime: Math.round(responseTime),
      requestSize: 0,
      responseSize: parseInt(headers["content-length"] || "0"),
      headers: {
        "content-type": headers["content-type"] || "",
        "x-ratelimit-remaining": headers["x-ratelimit-remaining"] || "",
        "x-ratelimit-reset": headers["x-ratelimit-reset"] || "",
      },
      rateLimitRemaining: parseInt(headers["x-ratelimit-remaining"] || "0"),
      rateLimitReset: parseInt(headers["x-ratelimit-reset"] || "0"),
    });
  }

  return response;
}
```

**This interception happens for:**

- GET requests (`BaseGithubService.get()`)
- POST requests (`BaseGithubService.post()`)
- DELETE requests (`BaseGithubService.delete()`)

#### E2E Test Interception Points

**Browser metrics are collected through Page API:**

```typescript
// service/metrics/E2EMetricsCollector.ts:43-79
async recordPageMetrics(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];

    return {
      url: window.location.href,
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstContentfulPaint: fcpEntry ? fcpEntry.startTime : 0,
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
      totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      requestCount: resources.length,
    };
  });

  this.pageMetrics.push(metrics);
}
```

### 3. Data Accumulation

During test execution, metrics are accumulated in memory:

#### API Metrics Accumulation

```typescript
class APIMetricsCollector {
  private apiCalls: APICallMetric[] = [];        // All API calls
  private schemaValidations: SchemaValidationMetric[] = []; // Schema checks
  private startTime: number = 0;                 // Test start time
  private testError?: {...};                     // Any errors
}
```

#### E2E Metrics Accumulation

```typescript
class E2EMetricsCollector {
  private pageMetrics: PageMetric[] = [];        // Page load metrics
  private actionMetrics: ActionMetric[] = [];    // User interactions
  private networkMetrics: NetworkMetric = {...}; // Network activity
  private visualMetrics: VisualMetric = {...};   // Screenshots/diffs
  private browserMetrics?: BrowserMetric;        // Memory usage
}
```

### 4. Post-Test Processing

**After test completion, metrics are built and sent:**

```typescript
// fixture/GithubFixture.ts:22-30
metricsCollector: async ({}, use, testInfo) => {
  const collector = new APIMetricsCollector();
  collector.start();
  await use(collector);

  // This runs after test completes
  try {
    const metrics = collector.buildMetrics(testInfo);
    await metricsService.pushAPIMetrics(metrics);
  } catch (error) {
    // Never fails the test
    console.error("Failed to send API metrics:", error);
  }
};
```

## Component Deep Dive

### 1. Metrics Collectors

#### APIMetricsCollector (`service/metrics/APIMetricsCollector.ts`)

**Purpose:** Captures all API-related metrics during test execution

**Key Methods:**

- `start()` - Initializes collection, records start time
- `recordAPICall(data: APICallMetric)` - Records individual API calls
- `recordSchemaValidation()` - Records schema validation results
- `recordError()` - Captures test failures with API context
- `buildMetrics(testInfo)` - Aggregates all data into final metrics object

**Data Captured:**

```typescript
interface APITestMetrics {
  // Identity
  testId: string;
  testName: string;
  suiteName: string;
  timestamp: string;
  environment: "local" | "ci";

  // Performance
  duration: number;
  totalApiTime: number;
  averageResponseTime: number;
  slowestCall: { endpoint: string; duration: number };

  // Details
  apiCalls: APICallMetric[];
  schemaValidations: SchemaValidationMetric[];

  // Error tracking
  error?: {
    message: string;
    stack?: string;
    apiError?: {
      endpoint: string;
      statusCode: number;
      errorBody: string;
    };
  };
}
```

#### E2EMetricsCollector (`service/metrics/E2EMetricsCollector.ts`)

**Purpose:** Captures browser and UI interaction metrics

**Key Methods:**

- `start()` - Initializes collection
- `recordPageMetrics(page)` - Captures page performance data
- `recordAction(action, selector, duration)` - Records user interactions
- `recordScreenshot()` - Tracks visual regression testing
- `recordError(error, page, screenshot)` - Captures test failures with context
- `buildMetrics(testInfo, page)` - Aggregates all data

**Data Captured:**

```typescript
interface E2ETestMetrics {
  // Identity
  testId: string;
  testName: string;
  browser: "chromium" | "firefox" | "webkit";

  // Performance
  pageMetrics: PageMetric[]; // Load times, FCP, TTI
  browserMetrics: BrowserMetric; // Memory usage
  actionMetrics: ActionMetric[]; // Click/type timings
  networkMetrics: NetworkMetric; // Request counts, sizes
  visualMetrics?: VisualMetric; // Screenshots, diffs

  // Error tracking
  error?: {
    message: string;
    screenshot?: string;
    trace?: string;
    videoUrl?: string;
  };
}
```

### 2. Test Fixtures

#### GithubFixture (`fixture/GithubFixture.ts`)

**Purpose:** Injects metrics collection into API tests

**Key Features:**

- Automatic collector initialization
- Service injection with collector
- Post-test metrics transmission
- Error isolation (never fails tests)

**Usage:**

```typescript
import { test } from "./fixture/GithubFixture";

test("API Test", async ({ githubIssueService }) => {
  // Metrics collection happens automatically
  const issues = await githubIssueService.getIssues();
});
```

#### GithubUIFixture (`fixture/ui/GithubUIFixture.ts`)

**Purpose:** Injects metrics collection into E2E tests

**Key Features:**

- Page object initialization
- Collector lifecycle management
- Browser metrics extraction
- Automatic metrics submission

**Usage:**

```typescript
import { test } from "./fixture/ui/GithubUIFixture";

test("E2E Test", async ({ page, githubHomePage, metricsCollector }) => {
  await githubHomePage.goToHomePage();
  // Metrics collected automatically
});
```

### 3. Metrics Service

**Location:** `service/metrics/MetricsService.ts`

**Purpose:** Handles HTTP transmission of metrics to storage server

**Key Features:**

- Environment-based configuration
- Bearer token authentication
- Graceful degradation
- Type-safe API calls

**Configuration:**

```bash
# .env file
METRICS_ENDPOINT=http://localhost:3000
METRICS_API_KEY=my-secret-key-12345
```

**Implementation:**

```typescript
class MetricsService {
  async pushAPIMetrics(metrics: APITestMetrics): Promise<void> {
    if (!this.enabled) return; // Silent skip if not configured

    await fetch(`${this.endpoint}/api/metrics/api-tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(metrics),
    });
  }
}
```

### 4. Metrics Server

**Location:** `metrics-server/`

**Technology Stack:**

- Express.js (web framework)
- TypeORM (ORM)
- MySQL (database)
- TypeScript (language)

**API Endpoints:**

```
POST /api/metrics/api-tests  - Receive API test metrics
GET  /api/metrics/api-tests  - Retrieve API test metrics
POST /api/metrics/e2e-tests  - Receive E2E test metrics
GET  /api/metrics/e2e-tests  - Retrieve E2E test metrics
GET  /api/metrics/summary    - Get aggregate statistics
```

**Authentication:**

```typescript
// middleware/auth.ts
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token !== process.env.METRICS_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
```

## Interception Points

### 1. API Interception Hierarchy

```
Test Case
    ↓
GithubFixture (injects collector)
    ↓
Service Class (e.g., GithubIssueService)
    ↓
BaseGithubService (INTERCEPTION HAPPENS HERE)
    ↓
Playwright APIRequestContext
    ↓
Network
```

### 2. How API Calls Are Intercepted

**Step 1: Service Creation with Collector**

```typescript
// In GithubFixture
githubIssueService: async ({ request, metricsCollector }, use) => {
  const service = new GithubIssueService(request, metricsCollector);
  await use(service);
};
```

**Step 2: Service Inherits Base Methods**

```typescript
class GithubIssueService extends BaseGithubService {
  async getIssues(repo: string): Promise<Issue[]> {
    // This calls BaseGithubService.get() which has interception
    const response = await this.get(url, "Getting issues");
    return response.json();
  }
}
```

**Step 3: Base Service Records Metrics**

```typescript
class BaseGithubService {
  protected async get(url: string, operation: string): Promise<APIResponse> {
    const startTime = performance.now();
    const response = await this.request.get(url); // Actual API call
    const responseTime = performance.now() - startTime;

    // INTERCEPTION: Record the metrics
    if (this.metricsCollector) {
      this.metricsCollector.recordAPICall({...});
    }

    return response;
  }
}
```

### 3. E2E Interception Points

```
Test Case
    ↓
GithubUIFixture (injects collector)
    ↓
Page Objects (e.g., GithubHomePage)
    ↓
Playwright Page API
    ↓
Browser
```

**Browser Metrics Collection:**

```typescript
// Injected JavaScript runs in browser context
const metrics = await page.evaluate(() => {
  // Access Performance API
  const navigation = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");

  // Extract metrics
  return {
    loadTime: navigation.loadEventEnd - navigation.fetchStart,
    domContentLoaded: navigation.domContentLoadedEventEnd,
    // ... more metrics
  };
});
```

## Data Storage

### 1. Database Schema

#### api_test_metrics Table

```sql
CREATE TABLE api_test_metrics (
  id VARCHAR(36) PRIMARY KEY,  -- UUID
  testId VARCHAR(255),
  testName VARCHAR(500),
  suiteName VARCHAR(500),
  timestamp DATETIME,
  environment VARCHAR(10),
  status VARCHAR(20),
  duration INT,
  retryCount INT DEFAULT 0,
  apiCalls JSON,               -- Array of call details
  totalApiTime INT,
  averageResponseTime INT,
  slowestCall JSON,
  schemaValidations JSON,
  error JSON,
  metadata JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IDX_api_testId ON api_test_metrics(testId);
CREATE INDEX IDX_api_testName_createdAt ON api_test_metrics(testName, createdAt);
CREATE INDEX IDX_api_status_createdAt ON api_test_metrics(status, createdAt);
```

#### e2e_test_metrics Table

```sql
CREATE TABLE e2e_test_metrics (
  id VARCHAR(36) PRIMARY KEY,
  testId VARCHAR(255),
  testName VARCHAR(500),
  suiteName VARCHAR(500),
  timestamp DATETIME,
  environment VARCHAR(10),
  browser VARCHAR(20),
  status VARCHAR(20),
  duration INT,
  retryCount INT DEFAULT 0,
  pageMetrics JSON,           -- Array of page loads
  browserMetrics JSON,
  actionMetrics JSON,         -- Array of user actions
  networkMetrics JSON,
  visualMetrics JSON,
  error JSON,
  metadata JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IDX_e2e_testId ON e2e_test_metrics(testId);
CREATE INDEX IDX_e2e_browser ON e2e_test_metrics(browser);
CREATE INDEX IDX_e2e_status_createdAt ON e2e_test_metrics(status, createdAt);
```

### 2. Storage Flow

```
Metrics Object (in memory)
    ↓
MetricsService.push*Metrics()
    ↓
HTTP POST to Metrics Server
    ↓
Express Route Handler
    ↓
TypeORM Repository
    ↓
MySQL Database
```

### 3. TypeORM Entities

```typescript
// entities/APITestMetric.ts
@Entity("api_test_metrics")
export class APITestMetric {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  testId!: string;

  @Column({ type: "json" })
  apiCalls!: any[];

  // ... more columns
}
```

## Implementation Details

### 1. Zero-Impact Design

**Principle:** Metrics collection must never cause test failures

**Implementation:**

```typescript
// Always wrapped in try-catch
try {
  const metrics = collector.buildMetrics(testInfo);
  await metricsService.pushAPIMetrics(metrics);
} catch (error) {
  // Log but don't throw
  console.error("Failed to send metrics:", error);
}
```

### 2. Automatic Collection

**No manual intervention required:**

- Tests import from fixture files
- Fixtures handle collector lifecycle
- Services automatically record metrics
- Post-test submission is automatic

### 3. Environment Detection

```typescript
// Automatic CI detection
environment: process.env.CI ? "ci" : "local";

// Conditional features
if (process.env.METRICS_ENDPOINT) {
  // Enable metrics
} else {
  // Silent skip
}
```

### 4. Performance Considerations

**Async Operations:**

- Metrics sent after test completes
- Non-blocking collection
- Batch operations where possible

**Memory Management:**

- Collectors reset per test
- No global state accumulation
- Automatic cleanup via fixture lifecycle

### 5. Type Safety

**Full TypeScript coverage:**

```typescript
// Strongly typed at every level
interface APICallMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  // ... all fields typed
}

// Type inference
const metrics = collector.buildMetrics(testInfo);
// metrics is typed as APITestMetrics
```

## Troubleshooting

### Common Issues

#### 1. Metrics Not Being Sent

**Check environment variables:**

```bash
echo $METRICS_ENDPOINT  # Should show http://localhost:3000
echo $METRICS_API_KEY   # Should show your API key
```

**Verify server is running:**

```bash
cd metrics-server
npm run dev
# Should see: "Metrics Server running on http://localhost:3000"
```

**Check test imports:**

```typescript
// ✅ Correct - uses fixture
import { test } from "../fixture/GithubFixture";

// ❌ Wrong - bypasses metrics
import { test } from "@playwright/test";
```

#### 2. Database Connection Issues

**Check MySQL is running:**

```bash
mysql -u root -p
SHOW DATABASES;
# Should see: automation_metrics
```

**Verify migrations ran:**

```bash
cd metrics-server
npm run migration:run
```

#### 3. Missing Metrics Data

**For API tests, verify collector is passed:**

```typescript
// Service should receive collector
class GithubIssueService extends BaseGithubService {
  constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    super(request, metricsCollector); // Must pass to parent
  }
}
```

**For E2E tests, check fixture usage:**

```typescript
test("My Test", async ({ metricsCollector, page }) => {
  // metricsCollector should be available
});
```

### Debug Mode

**Enable verbose logging:**

```typescript
// In MetricsService
logger.info(`Sending metrics to ${url}`);
logger.debug(`Payload: ${JSON.stringify(payload)}`);

// In Collectors
logger.debug(`Recorded API call: ${data.method} ${data.endpoint}`);
```

**Check database directly:**

```sql
-- Recent API test metrics
SELECT * FROM api_test_metrics
ORDER BY createdAt DESC
LIMIT 10;

-- Failed tests
SELECT testName, error
FROM e2e_test_metrics
WHERE status = 'failed'
ORDER BY createdAt DESC;
```

## Best Practices

### 1. Always Use Fixtures

```typescript
// ✅ Do this
import { test } from "../fixture/GithubFixture";

// ❌ Don't do this
import { test } from "@playwright/test";
```

### 2. Let Collectors Handle Lifecycle

```typescript
// ✅ Automatic (handled by fixture)
test("My Test", async ({ githubIssueService }) => {
  // Just use the service
});

// ❌ Don't manually manage
test("My Test", async () => {
  const collector = new APIMetricsCollector();
  collector.start();
  // Don't do this
});
```

### 3. Pass Collectors Through Service Hierarchy

```typescript
class MyCustomService extends BaseGithubService {
  constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    super(request, metricsCollector); // Always pass through
  }
}
```

### 4. Use Type-Safe Methods

```typescript
// ✅ Use provided methods
await this.get(url, "Getting data");

// ❌ Don't bypass
await this.request.get(url); // Skips metrics
```

### 5. Handle Errors Gracefully

```typescript
try {
  // Metrics operation
} catch (error) {
  logger.error("Metrics error:", error);
  // Continue test execution
}
```

## Summary

The metrics collection system provides comprehensive, automatic, and non-intrusive monitoring of all test executions. By leveraging TypeScript fixtures, service inheritance, and browser APIs, we capture detailed performance data without requiring any manual intervention from test authors. The system's resilient design ensures that metrics collection enhances rather than complicates the testing process, providing valuable insights while maintaining test reliability.
