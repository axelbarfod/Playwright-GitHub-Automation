import {
  APITestMetrics,
  E2ETestMetrics,
} from "../../model/metrics/MetricsModel";
import logger from "../../tests/utils/logger";

/**
 * MetricsService handles sending test metrics to a remote API endpoint
 * Supports different endpoints for API tests vs E2E tests
 */
export class MetricsService {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly enabled: boolean;

  constructor() {
    this.endpoint = process.env.METRICS_ENDPOINT || "";
    this.apiKey = process.env.METRICS_API_KEY || "";
    this.enabled = !!(this.endpoint && this.apiKey);

    if (!this.enabled) {
      logger.warn(
        "Metrics collection disabled: METRICS_ENDPOINT or METRICS_API_KEY not configured",
      );
    }
  }

  /**
   * Push API test metrics to the endpoint
   * @param metrics - The API test metrics to send
   */
  async pushAPIMetrics(metrics: APITestMetrics): Promise<void> {
    if (!this.enabled) {
      logger.debug("Metrics disabled, skipping API metrics push");
      return;
    }

    await this.sendMetrics("/api/metrics/api-tests", metrics);
  }

  /**
   * Push E2E test metrics to the endpoint
   * @param metrics - The E2E test metrics to send
   */
  async pushE2EMetrics(metrics: E2ETestMetrics): Promise<void> {
    if (!this.enabled) {
      logger.debug("Metrics disabled, skipping E2E metrics push");
      return;
    }

    await this.sendMetrics("/api/metrics/e2e-tests", metrics);
  }

  /**
   * Internal method to send metrics to the endpoint
   * @param path - The API path to send to
   * @param payload - The metrics payload
   */
  private async sendMetrics(path: string, payload: unknown): Promise<void> {
    const url = `${this.endpoint}${path}`;

    try {
      logger.info(`Sending metrics to ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        logger.error(
          `Failed to send metrics: ${response.status} ${response.statusText}. Response: ${errorText}`,
        );
      } else {
        const testName =
          typeof payload === "object" &&
          payload !== null &&
          "testName" in payload
            ? (payload as { testName: string }).testName
            : "unknown";
        logger.info(
          `Metrics sent successfully (${response.status}) for test: ${testName}`,
        );
      }
    } catch (error) {
      // Don't fail tests if metrics fail - just log the error
      logger.error(`Error sending metrics to ${url}:`, error);
    }
  }

  /**
   * Check if metrics service is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
