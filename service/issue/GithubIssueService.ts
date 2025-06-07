import type { APIRequestContext } from "playwright-core";
import {
  GitHubIssue,
  GitHubIssuesResponse,
} from "../../model/issues/IssuesModel";
import { APIResponse } from "@playwright/test";
import { BaseGithubService } from "../base/BaseGithubService";

export class GithubIssueService extends BaseGithubService {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getIssues(): Promise<GitHubIssuesResponse> {
    const apiResponse: APIResponse = await this.request.get(this.ISSUES_URL);

    return this.handleResponse<GitHubIssuesResponse>(
      apiResponse,
      "Getting issues",
    );
  }

  async getIssue(id: number, repo: string = "DemoRepo"): Promise<GitHubIssue> {
    const url = this.buildRepoUrl(repo, `${this.ISSUES_URL}/${id}`);
    const apiResponse: APIResponse = await this.request.get(url);

    return this.handleResponse<GitHubIssue>(apiResponse, `Getting issue ${id}`);
  }
}
