import { AppDataSource } from '../config/database.js';
import { APITestMetric } from '../entities/APITestMetric.js';
import { E2ETestMetric } from '../entities/E2ETestMetric.js';

export interface QueryOptions {
  limit?: number;
  offset?: number;
}

export interface MetricsSummary {
  totalApiMetrics: number;
  totalE2eMetrics: number;
  latestApiPassRate: number;
  latestE2ePassRate: number;
  lastUpdated: string;
}

/**
 * Save API test metrics to database
 * @param metrics - API test metrics object
 * @returns Saved entity
 */
export async function saveAPIMetrics(metrics: any): Promise<APITestMetric> {
  const repository = AppDataSource.getRepository(APITestMetric);

  const entity = repository.create({
    testId: metrics.testId,
    testName: metrics.testName,
    suiteName: metrics.suiteName,
    timestamp: new Date(metrics.timestamp),
    environment: metrics.environment,
    status: metrics.status,
    duration: metrics.duration,
    retryCount: metrics.retryCount || 0,
    apiCalls: metrics.apiCalls || [],
    totalApiTime: metrics.totalApiTime || 0,
    averageResponseTime: metrics.averageResponseTime || 0,
    slowestCall: metrics.slowestCall || { endpoint: '', duration: 0 },
    schemaValidations: metrics.schemaValidations || [],
    error: metrics.error,
    metadata: metrics.metadata,
  });

  const saved = await repository.save(entity);
  console.log(`API metrics saved to database: ${metrics.testName}`);

  return saved;
}

/**
 * Save E2E test metrics to database
 * @param metrics - E2E test metrics object
 * @returns Saved entity
 */
export async function saveE2EMetrics(metrics: any): Promise<E2ETestMetric> {
  const repository = AppDataSource.getRepository(E2ETestMetric);

  const entity = repository.create({
    testId: metrics.testId,
    testName: metrics.testName,
    suiteName: metrics.suiteName,
    timestamp: new Date(metrics.timestamp),
    environment: metrics.environment,
    browser: metrics.browser,
    status: metrics.status,
    duration: metrics.duration,
    retryCount: metrics.retryCount || 0,
    pageMetrics: metrics.pageMetrics || [],
    browserMetrics: metrics.browserMetrics || { memoryUsage: 0 },
    actionMetrics: metrics.actionMetrics || [],
    networkMetrics: metrics.networkMetrics || {
      totalRequests: 0,
      failedRequests: 0,
      totalTransferred: 0,
      resourceTypes: {},
    },
    visualMetrics: metrics.visualMetrics,
    error: metrics.error,
    metadata: metrics.metadata,
  });

  const saved = await repository.save(entity);
  console.log(`E2E metrics saved to database: ${metrics.testName}`);

  return saved;
}

/**
 * Get API metrics with pagination
 * @param options - Query options (limit, offset)
 * @returns Array of API test metrics
 */
export async function getAPIMetrics(
  options: QueryOptions = {},
): Promise<APITestMetric[]> {
  const { limit = 100, offset = 0 } = options;
  const repository = AppDataSource.getRepository(APITestMetric);

  return await repository.find({
    order: {
      timestamp: 'DESC',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get E2E metrics with pagination
 * @param options - Query options (limit, offset)
 * @returns Array of E2E test metrics
 */
export async function getE2EMetrics(
  options: QueryOptions = {},
): Promise<E2ETestMetric[]> {
  const { limit = 100, offset = 0 } = options;
  const repository = AppDataSource.getRepository(E2ETestMetric);

  return await repository.find({
    order: {
      timestamp: 'DESC',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get metrics summary statistics
 * @returns Summary statistics
 */
export async function getMetricsSummary(): Promise<MetricsSummary> {
  const apiRepository = AppDataSource.getRepository(APITestMetric);
  const e2eRepository = AppDataSource.getRepository(E2ETestMetric);

  // Get total counts
  const totalApiMetrics = await apiRepository.count();
  const totalE2eMetrics = await e2eRepository.count();

  // Get latest 10 metrics for pass rate calculation
  const latestApiMetrics = await apiRepository.find({
    order: { timestamp: 'DESC' },
    take: 10,
  });

  const latestE2eMetrics = await e2eRepository.find({
    order: { timestamp: 'DESC' },
    take: 10,
  });

  // Calculate pass rates
  const apiPassRate =
    latestApiMetrics.length > 0
      ? (latestApiMetrics.filter((m) => m.status === 'passed').length /
          latestApiMetrics.length) *
        100
      : 0;

  const e2ePassRate =
    latestE2eMetrics.length > 0
      ? (latestE2eMetrics.filter((m) => m.status === 'passed').length /
          latestE2eMetrics.length) *
        100
      : 0;

  return {
    totalApiMetrics,
    totalE2eMetrics,
    latestApiPassRate: Math.round(apiPassRate),
    latestE2ePassRate: Math.round(e2ePassRate),
    lastUpdated: new Date().toISOString(),
  };
}
