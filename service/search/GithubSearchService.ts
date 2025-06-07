import { BaseGithubService } from "../base/BaseGithubService";
import { APIRequestContext } from "playwright-core";
import { GitHubSearchRepositoriesResponse } from "../../model/search/Search";
import { APIResponse } from "@playwright/test";
import { GitHubRepository } from "../../model/repository/Repository";

export class GithubSearchService extends BaseGithubService {
  private readonly SEARCH_REPOSITORIES_URL: string =
    this.SEARCH_URL + "/" + this.REPOSITORIES_URL;

  constructor(request: APIRequestContext) {
    super(request);
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
    const apiResponse: APIResponse = await this.request.get(
      this.SEARCH_REPOSITORIES_URL,
      {
        params: {
          q: query,
        },
      },
    );

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
    const apiResponse: APIResponse = await this.request.get(url);
    return this.handleResponse<GitHubRepository>(
      apiResponse,
      `Searching for ${repo}`,
    );
  }
}
