import { APIRequestContext } from "playwright-core";
import { APIResponse } from "@playwright/test";
import logger from "../../tests/utils/logger";

export abstract class BaseGithubService {
  protected readonly ISSUES_URL: string = "issues";
  protected readonly USERS_URL: string = "users";
  protected readonly USER_URL: string = "user";
  protected readonly REPOS_URL: string = "repos";
  protected readonly SEARCH_URL: string = "search";
  protected readonly REPOSITORIES_URL: string = "repositories";
  protected request: APIRequestContext;

  protected constructor(request: APIRequestContext) {
    this.request = request;
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
