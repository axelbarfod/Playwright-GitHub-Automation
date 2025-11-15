import { APIRequestContext } from "playwright-core";
import { APIResponse } from "@playwright/test";
import logger from "../../tests/utils/logger";
import { APIMetricsCollector } from "../metrics/APIMetricsCollector";

export abstract class BaseGithubService {
  protected readonly ISSUES_URL: string = "issues";
  protected readonly USERS_URL: string = "users";
  protected readonly USER_URL: string = "user";
  protected readonly REPOS_URL: string = "repos";
  protected readonly SEARCH_URL: string = "search";
  protected readonly REPOSITORIES_URL: string = "repositories";
  protected request: APIRequestContext;
  protected metricsCollector?: APIMetricsCollector;

  protected constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    this.request = request;
    this.metricsCollector = metricsCollector;
  }

  protected buildRepoUrl(repo: string, endpoint: string = ""): string {
    const baseUrl = `repos/${process.env.GH_USER}/${repo}`;
    return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  }

  protected buildUserUrl(username: string = "", endpoint: string = ""): string {
    const baseUrl = username ? `users/${username}` : "user";
    return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  }

  /**
   * Make a tracked GET request with metrics collection
   * @param url - The URL to request
   * @param _operation - Description of the operation (reserved for future use)
   * @returns The API response
   */
  protected async get(url: string, _operation: string): Promise<APIResponse> {
    const startTime = performance.now();
    const response = await this.request.get(url);
    const responseTime = performance.now() - startTime;

    // Record metrics if collector is available
    if (this.metricsCollector) {
      const headers = response.headers();
      this.metricsCollector.recordAPICall({
        endpoint: response.url(),
        method: "GET",
        statusCode: response.status(),
        responseTime: Math.round(responseTime),
        requestSize: 0, // Not easily available for GET requests
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

  /**
   * Make a tracked POST request with metrics collection
   * @param url - The URL to request
   * @param _operation - Description of the operation (reserved for future use)
   * @param data - The request body
   * @returns The API response
   */
  protected async post(
    url: string,
    _operation: string,
    data?: unknown,
  ): Promise<APIResponse> {
    const startTime = performance.now();
    const requestBody = data ? JSON.stringify(data) : undefined;
    const response = await this.request.post(url, { data: requestBody });
    const responseTime = performance.now() - startTime;

    // Record metrics if collector is available
    if (this.metricsCollector) {
      const headers = response.headers();
      this.metricsCollector.recordAPICall({
        endpoint: response.url(),
        method: "POST",
        statusCode: response.status(),
        responseTime: Math.round(responseTime),
        requestSize: requestBody ? Buffer.byteLength(requestBody) : 0,
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

  /**
   * Make a tracked DELETE request with metrics collection
   * @param url - The URL to request
   * @param _operation - Description of the operation (reserved for future use)
   * @returns The API response
   */
  protected async delete(
    url: string,
    _operation: string,
  ): Promise<APIResponse> {
    const startTime = performance.now();
    const response = await this.request.delete(url);
    const responseTime = performance.now() - startTime;

    // Record metrics if collector is available
    if (this.metricsCollector) {
      const headers = response.headers();
      this.metricsCollector.recordAPICall({
        endpoint: response.url(),
        method: "DELETE",
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

  /**
   * Handles and processes an API response, ensuring proper logging and handling of response status,
   * headers, and content. Throws errors for non-successful responses, logs rate limit information,
   * and parses the response body if applicable.
   *
   * @param {APIResponse} response - The API response object to be handled.
   * @param {string} operation - A descriptive name or label associated with the operation that triggered the request.
   * @return {Promise<T>} - A promise resolving to the parsed response data, if applicable, or an empty object of type T.
   */
  protected async handleResponse<T>(
    response: APIResponse,
    operation: string,
  ): Promise<T> {
    const headers = response.headers();
    const rateLimit = headers["x-ratelimit-remaining"];
    const rateLimitReset = headers["x-ratelimit-reset"];
    const resetTimestamp = parseInt(rateLimitReset);

    const resetDate = new Date(resetTimestamp * 1000);

    logger.info(
      `Rate limit remaining: ${rateLimit}, resets at: ${rateLimitReset} - ${resetDate.toLocaleString()}`,
    );

    if (!response.ok()) {
      const fullUrl = response.url();
      const status = response.status();
      const statusText = response.statusText();
      const errorMessage = `${operation} failed for ${fullUrl}: ${status} ${statusText}`;

      logger.error(`Headers: ${JSON.stringify(headers, null, 2)}`);

      try {
        const errorBody = await response.text();
        logger.error(`${errorMessage}. Response body: ${errorBody}`);
      } catch {
        logger.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    const contentLength = headers["content-length"];
    const contentType = headers["content-type"];

    if (contentLength === "0" || response.status() === 204) {
      return {} as T;
    }

    if (!contentType?.includes("application/json")) {
      const textBody = await response.text();
      logger.warn(`Non-JSON response received: ${textBody}`);
      return textBody as unknown as T;
    }

    try {
      return await response.json();
    } catch (error) {
      logger.warn(`Failed to parse JSON response: ${error}`);
      return {} as T;
    }
  }
}
