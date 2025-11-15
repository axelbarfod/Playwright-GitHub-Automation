import { BaseGithubService } from "../base/BaseGithubService";
import { APIRequestContext } from "playwright-core";
import { GitHubSearchRepositoriesResponse } from "../../model/search/Search";
import { APIResponse } from "@playwright/test";
import { GitHubRepository } from "../../model/repository/Repository";
import { APIMetricsCollector } from "../metrics/APIMetricsCollector";

export class GithubSearchService extends BaseGithubService {
  private readonly SEARCH_REPOSITORIES_URL: string =
    this.SEARCH_URL + "/" + this.REPOSITORIES_URL;

  constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    super(request, metricsCollector);
  }

  /**
   * Searches for repositories on GitHub based on the specified query.
   *
   * @param {string} query - The search query string used to search for repositories.
   * @return {Promise<GitHubSearchRepositoriesResponse>} A promise that resolves to the search results containing repository details.
   */
  async searchRepositories(
    query: string,
  ): Promise<GitHubSearchRepositoriesResponse> {
    // For GET requests with params, we need to use the request context directly
    // and then manually record metrics
    const startTime = performance.now();
    const apiResponse: APIResponse = await this.request.get(
      this.SEARCH_REPOSITORIES_URL,
      {
        params: {
          q: query,
        },
      },
    );
    const responseTime = performance.now() - startTime;

    // Record metrics manually for parameterized requests
    if (this.metricsCollector) {
      const headers = apiResponse.headers();
      this.metricsCollector.recordAPICall({
        endpoint: `${apiResponse.url()}`,
        method: "GET",
        statusCode: apiResponse.status(),
        responseTime: Math.round(responseTime),
        requestSize: 0,
        responseSize: parseInt(headers["content-length"] || "0"),
        headers: {
          "content-type": headers["content-type"] || "",
          "x-ratelimit-remaining": headers["x-ratelimit-remaining"] || "",
          "x-ratelimit-reset": headers["x-ratelimit-reset"] || "",
        },
        rateLimitRemaining: parseInt(
          headers["x-ratelimit-remaining"] || "0",
        ),
        rateLimitReset: parseInt(headers["x-ratelimit-reset"] || "0"),
      });
    }

    return this.handleResponse<GitHubSearchRepositoriesResponse>(
      apiResponse,
      `Searching for ${query}`,
    );
  }

  /**
   * Searches for a GitHub repository based on the owner and repository name.
   *
   * @param {string} owner - The owner of the repository.
   * @param {string} repo - The name of the repository.
   * @return {Promise<GitHubRepository>} A promise that resolves to the GitHub repository details.
   */
  async searchRepository(
    owner: string,
    repo: string,
  ): Promise<GitHubRepository> {
    const url: string = `${this.REPOS_URL}/${owner}/${repo}`;
    const apiResponse: APIResponse = await this.get(url, `Searching for ${repo}`);
    return this.handleResponse<GitHubRepository>(
      apiResponse,
      `Searching for ${repo}`,
    );
  }
}
