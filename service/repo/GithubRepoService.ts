import { BaseGithubService } from "../base/BaseGithubService";
import { APIRequestContext } from "playwright-core";
import { APIResponse } from "@playwright/test";
import {
  CreateRepositoryRequest,
  DeleteRepositoryRequest,
  GitHubRepository,
} from "../../model/repository/Repository";

export class GithubRepoService extends BaseGithubService {
  constructor(request: APIRequestContext) {
    super(request);
  }

  /**
   * Fetches and retrieves the details of a GitHub repository for the specified user and project.
   *
   * @param {string} ghUser - The username of the GitHub account.
   * @param {string} project - The name of the GitHub repository.
   * @return {Promise<GitHubRepository>} A promise that resolves to the details of the GitHub repository.
   */
  async getRepository(
    ghUser: string,
    project: string,
  ): Promise<GitHubRepository> {
    const apiResponse: APIResponse = await this.request.get(
      `repos/${ghUser}/${project}`,
    );

    return this.handleResponse<GitHubRepository>(
      apiResponse,
      `Getting repo ${project}`,
    );
  }

  /**
   * Retrieves a list of repositories for the current user.
   *
   * @return {Promise<GitHubRepository[]>} A promise that resolves to an array of GitHubRepository objects.
   */
  async getRepositories(): Promise<GitHubRepository[]> {
    const apiResponse: APIResponse = await this.request.get(
      `${this.USER_URL}/${this.REPOS_URL}`,
    );

    return this.handleResponse<GitHubRepository[]>(
      apiResponse,
      `Getting repos`,
    );
  }

  async createRepository(
    data: CreateRepositoryRequest,
  ): Promise<GitHubRepository> {
    const response: APIResponse = await this.request.post(
      `${this.USER_URL}/${this.REPOS_URL}`,
      {
        data,
      },
    );

    return this.handleResponse<GitHubRepository>(
      response,
      `Creating repository ${data.name}`,
    );
  }

  async deleteRepository(
    repoName: string,
    data: DeleteRepositoryRequest,
  ): Promise<void> {
    const response: APIResponse = await this.request.delete(
      `${this.REPOS_URL}/${process.env.GH_USER}/${repoName}`,
      {
        data,
      },
    );

    return this.handleResponse<void>(
      response,
      `Deleting repository ${repoName}`,
    );
  }
}
