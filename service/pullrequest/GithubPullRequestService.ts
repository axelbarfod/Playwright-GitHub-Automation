import { BaseGithubService } from "../base/BaseGithubService";
import { APIRequestContext } from "playwright-core";
import { APIResponse } from "@playwright/test";
import {
  PullRequest,
  CreatePullRequestRequest,
  UpdatePullRequestRequest,
  MergePullRequestRequest,
  MergePullRequestResponse,
  ListPullRequestsParams,
} from "../../model/pullrequest/PullRequest";
import { APIMetricsCollector } from "../metrics/APIMetricsCollector";

export class GithubPullRequestService extends BaseGithubService {
  constructor(
    request: APIRequestContext,
    metricsCollector?: APIMetricsCollector,
  ) {
    super(request, metricsCollector);
  }

  /**
   * Lists pull requests for a specific repository.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {ListPullRequestsParams} params - Optional query parameters for filtering and pagination.
   * @return {Promise<PullRequest[]>} A promise that resolves to an array of pull requests.
   */
  async listPullRequests(
    owner: string,
    repo: string,
    params?: ListPullRequestsParams,
  ): Promise<PullRequest[]> {
    let url = `${this.REPOS_URL}/${owner}/${repo}/pulls`;

    if (params) {
      const queryParams = new URLSearchParams();
      if (params.state) queryParams.append("state", params.state);
      if (params.head) queryParams.append("head", params.head);
      if (params.base) queryParams.append("base", params.base);
      if (params.sort) queryParams.append("sort", params.sort);
      if (params.direction) queryParams.append("direction", params.direction);
      if (params.per_page)
        queryParams.append("per_page", params.per_page.toString());
      if (params.page) queryParams.append("page", params.page.toString());

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const apiResponse: APIResponse = await this.get(
      url,
      `Listing pull requests for ${owner}/${repo}`,
    );

    return this.handleResponse<PullRequest[]>(
      apiResponse,
      `Listing pull requests for ${owner}/${repo}`,
    );
  }

  /**
   * Gets a specific pull request by number.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {number} pullNumber - The pull request number.
   * @return {Promise<PullRequest>} A promise that resolves to the pull request details.
   */
  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<PullRequest> {
    const apiResponse: APIResponse = await this.get(
      `${this.REPOS_URL}/${owner}/${repo}/pulls/${pullNumber}`,
      `Getting pull request #${pullNumber} for ${owner}/${repo}`,
    );

    return this.handleResponse<PullRequest>(
      apiResponse,
      `Getting pull request #${pullNumber} for ${owner}/${repo}`,
    );
  }

  /**
   * Creates a new pull request.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {CreatePullRequestRequest} data - The pull request creation data.
   * @return {Promise<PullRequest>} A promise that resolves to the created pull request.
   */
  async createPullRequest(
    owner: string,
    repo: string,
    data: CreatePullRequestRequest,
  ): Promise<PullRequest> {
    const apiResponse: APIResponse = await this.post(
      `${this.REPOS_URL}/${owner}/${repo}/pulls`,
      `Creating pull request "${data.title}" for ${owner}/${repo}`,
      data,
    );

    return this.handleResponse<PullRequest>(
      apiResponse,
      `Creating pull request "${data.title}" for ${owner}/${repo}`,
    );
  }

  /**
   * Updates an existing pull request.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {number} pullNumber - The pull request number.
   * @param {UpdatePullRequestRequest} data - The pull request update data.
   * @return {Promise<PullRequest>} A promise that resolves to the updated pull request.
   */
  async updatePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    data: UpdatePullRequestRequest,
  ): Promise<PullRequest> {
    const apiResponse: APIResponse = await this.patch(
      `${this.REPOS_URL}/${owner}/${repo}/pulls/${pullNumber}`,
      `Updating pull request #${pullNumber} for ${owner}/${repo}`,
      data,
    );

    return this.handleResponse<PullRequest>(
      apiResponse,
      `Updating pull request #${pullNumber} for ${owner}/${repo}`,
    );
  }

  /**
   * Merges a pull request.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {number} pullNumber - The pull request number.
   * @param {MergePullRequestRequest} data - Optional merge configuration.
   * @return {Promise<MergePullRequestResponse>} A promise that resolves to the merge response.
   */
  async mergePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    data?: MergePullRequestRequest,
  ): Promise<MergePullRequestResponse> {
    const apiResponse: APIResponse = await this.put(
      `${this.REPOS_URL}/${owner}/${repo}/pulls/${pullNumber}/merge`,
      `Merging pull request #${pullNumber} for ${owner}/${repo}`,
      data,
    );

    return this.handleResponse<MergePullRequestResponse>(
      apiResponse,
      `Merging pull request #${pullNumber} for ${owner}/${repo}`,
    );
  }

  /**
   * Checks if a pull request has been merged.
   *
   * @param {string} owner - The repository owner (username or organization).
   * @param {string} repo - The repository name.
   * @param {number} pullNumber - The pull request number.
   * @return {Promise<boolean>} A promise that resolves to true if merged, false otherwise.
   */
  async isPullRequestMerged(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<boolean> {
    try {
      const apiResponse: APIResponse = await this.get(
        `${this.REPOS_URL}/${owner}/${repo}/pulls/${pullNumber}/merge`,
        `Checking if pull request #${pullNumber} is merged for ${owner}/${repo}`,
      );

      return apiResponse.status() === 204;
    } catch {
      return false;
    }
  }
}
