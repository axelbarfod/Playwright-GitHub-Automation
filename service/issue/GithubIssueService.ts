import type { APIRequestContext } from "playwright-core";
import {
  GitHubIssue,
  GitHubIssuesResponse,
} from "../../model/issues/IssuesModel";
import { APIResponse } from "@playwright/test";
import { BaseGithubService } from "../base/BaseGithubService";
import { APIMetricsCollector } from "../metrics/APIMetricsCollector";

export class GithubIssueService extends BaseGithubService {
  constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    super(request, metricsCollector);
  }

  async getIssues(): Promise<GitHubIssuesResponse> {
    const apiResponse: APIResponse = await this.get(
      this.ISSUES_URL,
      "Getting issues",
    );

    return this.handleResponse<GitHubIssuesResponse>(
      apiResponse,
      "Getting issues",
    );
  }

  async getIssue(id: number, repo: string = "DemoRepo"): Promise<GitHubIssue> {
    const url = this.buildRepoUrl(repo, `${this.ISSUES_URL}/${id}`);
    const apiResponse: APIResponse = await this.get(url, `Getting issue ${id}`);

    return this.handleResponse<GitHubIssue>(apiResponse, `Getting issue ${id}`);
  }
}
