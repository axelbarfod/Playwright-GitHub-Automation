import { TestInfo, Page } from "@playwright/test";
import {
  E2ETestMetrics,
  PageMetric,
  ActionMetric,
  BrowserMetric,
  NetworkMetric,
  VisualMetric,
} from "../../model/metrics/MetricsModel";
import logger from "../../tests/utils/logger";

/**
 * Collector for E2E test metrics
 * Captures page performance, browser metrics, user actions, network activity
 */
export class E2EMetricsCollector {
  private pageMetrics: PageMetric[] = [];
  private actionMetrics: ActionMetric[] = [];
  private visualMetrics: VisualMetric = { screenshotsTaken: 0 };
  private startTime: number = 0;
  private testError?: {
    message: string;
    stack?: string;
    screenshot?: string;
    trace?: string;
  };

  /**
   * Start collecting metrics - call at the beginning of test
   */
  start(): void {
    this.startTime = performance.now();
    this.pageMetrics = [];
    this.actionMetrics = [];
    this.visualMetrics = { screenshotsTaken: 0 };
    this.testError = undefined;
  }

  /**
   * Record page performance metrics
   * Call this after page navigation or important page events
   */
  async recordPageMetrics(page: Page): Promise<void> {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");
        const resources = performance.getEntriesByType("resource");

        const fcpEntry = paint.find((e) => e.name === "first-contentful-paint");

        return {
          url: window.location.href,
          loadTime: navigation
            ? navigation.loadEventEnd - navigation.loadEventStart
            : 0,
          domContentLoaded: navigation
            ? navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart
            : 0,
          firstContentfulPaint: fcpEntry ? fcpEntry.startTime : 0,
          timeToInteractive: navigation
            ? navigation.domInteractive - navigation.fetchStart
            : 0,
          totalSize: resources.reduce(
            (sum, r: PerformanceResourceTiming) => sum + (r.transferSize || 0),
            0,
          ),
          requestCount: resources.length,
        };
      });

      this.pageMetrics.push(metrics);
      logger.debug(`Recorded page metrics for: ${metrics.url}`);
    } catch (error) {
      logger.warn(`Failed to record page metrics: ${error}`);
    }
  }

  /**
   * Record a user action (click, type, etc.)
   */
  recordAction(
    action: ActionMetric["action"],
    selector: string,
    duration: number,
    screenshot?: string,
  ): void {
    this.actionMetrics.push({
      action,
      selector,
      duration: Math.round(duration),
      screenshot,
    });
    logger.debug(`Recorded action: ${action} on ${selector} - ${duration}ms`);
  }

  /**
   * Record screenshot taken
   */
  recordScreenshot(): void {
    this.visualMetrics.screenshotsTaken++;
  }

  /**
   * Record visual diff percentage
   */
  recordVisualDiff(diffPercentage: number): void {
    this.visualMetrics.visualDiff = diffPercentage;
  }

  /**
   * Record test error information
   */
  async recordError(
    error: Error,
    page?: Page,
    screenshot?: string,
  ): Promise<void> {
    this.testError = {
      message: error.message,
      stack: error.stack,
      screenshot,
    };

    logger.debug(`Recorded test error: ${error.message}`);
  }

  /**
   * Get browser metrics from the page
   */
  private async getBrowserMetrics(page: Page): Promise<BrowserMetric> {
    try {
      return await page.evaluate(() => {
        // Chrome-specific memory API (not in standard Performance interface)
        interface PerformanceWithMemory extends Performance {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
        const memory = (performance as PerformanceWithMemory).memory;
        return {
          memoryUsage: memory
            ? Math.round(memory.usedJSHeapSize / 1024 / 1024)
            : 0,
          cpuUsage: undefined, // Not easily available in browser context
        };
      });
    } catch (error) {
      logger.warn(`Failed to get browser metrics: ${error}`);
      return { memoryUsage: 0 };
    }
  }

  /**
   * Get network metrics from the page
   */
  private async getNetworkMetrics(page: Page): Promise<NetworkMetric> {
    try {
      return await page.evaluate(() => {
        const resources = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];

        const resourceTypes = resources.reduce(
          (acc, r) => {
            const type = r.initiatorType || "other";
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const totalTransferred = resources.reduce(
          (sum, r) => sum + (r.transferSize || 0),
          0,
        );

        return {
          totalRequests: resources.length,
          failedRequests: 0, // Would need to track via page listeners
          totalTransferred,
          resourceTypes,
        };
      });
    } catch (error) {
      logger.warn(`Failed to get network metrics: ${error}`);
      return {
        totalRequests: 0,
        failedRequests: 0,
        totalTransferred: 0,
        resourceTypes: {},
      };
    }
  }

  /**
   * Build the complete metrics object
   * Call this at the end of the test
   */
  async buildMetrics(
    testInfo: TestInfo,
    page: Page,
    metadata?: Record<string, unknown>,
  ): Promise<E2ETestMetrics> {
    const duration = performance.now() - this.startTime;

    const browserMetrics = await this.getBrowserMetrics(page);
    const networkMetrics = await this.getNetworkMetrics(page);

    const metrics: E2ETestMetrics = {
      testId: testInfo.testId,
      testName: testInfo.title,
      suiteName: testInfo.titlePath.slice(0, -1).join(" > "),
      timestamp: new Date().toISOString(),
      environment: process.env.CI ? "ci" : "local",
      browser: this.getBrowserName(testInfo.project.name),
      status: this.mapStatus(testInfo.status),
      duration: Math.round(duration),
      retryCount: testInfo.retry,
      pageMetrics: this.pageMetrics,
      browserMetrics,
      actionMetrics: this.actionMetrics,
      networkMetrics,
    };

    if (this.visualMetrics.screenshotsTaken > 0) {
      metrics.visualMetrics = this.visualMetrics;
    }

    if (this.testError) {
      metrics.error = this.testError;
    }

    if (metadata) {
      metrics.metadata = metadata;
    }

    return metrics;
  }

  /**
   * Map project name to browser type
   */
  private getBrowserName(
    projectName: string,
  ): "chromium" | "firefox" | "webkit" {
    if (projectName.toLowerCase().includes("firefox")) return "firefox";
    if (projectName.toLowerCase().includes("webkit")) return "webkit";
    return "chromium";
  }

  /**
   * Map Playwright test status to our metrics status
   */
  private mapStatus(
    status: string,
  ): "passed" | "failed" | "flaky" | "skipped" | "timedOut" {
    if (status === "passed") return "passed";
    if (status === "failed") return "failed";
    if (status === "skipped") return "skipped";
    if (status === "timedOut") return "timedOut";
    // Note: Flaky detection would require tracking across runs
    return "failed"; // default
  }

  /**
   * Get current action count
   */
  getActionCount(): number {
    return this.actionMetrics.length;
  }

  /**
   * Get total page load time
   */
  getTotalPageLoadTime(): number {
    return this.pageMetrics.reduce((sum, page) => sum + page.loadTime, 0);
  }
}
