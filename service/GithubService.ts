import type { APIRequestContext } from "playwright-core";
import { GitHubIssue, GitHubIssuesResponse } from "../model/issues/IssuesModel";
import { APIResponse } from "@playwright/test";
import logger from "../tests/utils/logger";

export class GithubService {
  private request: APIRequestContext;
  private static readonly ISSUES_URL: string = "issues";
  private static readonly USER_URL: string = "users";
  private static readonly REPOS_URL: string = "repos";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getIssues(): Promise<GitHubIssuesResponse> {
    const apiResponse: APIResponse = await this.request.get(
      GithubService.ISSUES_URL,
    );

    return this.handleResponse<GitHubIssuesResponse>(
      apiResponse,
      "Getting issues",
    );
  }

  async getIssue(id: number, repo: string = "DemoRepo"): Promise<GitHubIssue> {
    const apiResponse: APIResponse = await this.request.get(
      `${GithubService.REPOS_URL}/${process.env.GH_USER}/${repo}/${GithubService.ISSUES_URL}/${id}`,
    );

    return this.handleResponse<GitHubIssue>(apiResponse, `Getting issue ${id}`);
  }

  private async handleResponse<T>(
    response: APIResponse,
    operation: string,
  ): Promise<T> {
    if (!response.ok()) {
      const fullUrl = response.url();
      const status = response.status();
      const statusText = response.statusText();
      const errorMessage = `${operation} failed for ${fullUrl}: ${status} ${statusText}`;

      // Log additional error details if available
      try {
        const errorBody = await response.text();
        logger.error(`${errorMessage}. Response body: ${errorBody}`);
      } catch {
        logger.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }
}
