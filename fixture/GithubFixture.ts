import Ajv from "ajv";
import { GithubSearchService } from "../service/search/GithubSearchService";
import { GithubIssueService } from "../service/issue/GithubIssueService";
import { GithubRepoService } from "../service/repo/GithubRepoService";
import {
  test as base,
  TestType,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from "@playwright/test";
import addFormats from "ajv-formats";

type GithubFixture = {
  ajv: Ajv;
  githubIssueService: GithubIssueService;
  githubSearchService: GithubSearchService;
  githubRepoService: GithubRepoService;
};

export const test: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & GithubFixture,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = base.extend<GithubFixture>({
  ajv: async ({}, use) => {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    await use(ajv);
  },

  githubIssueService: async ({ request }, use) => {
    const githubIssueService = new GithubIssueService(request);
    await use(githubIssueService);
  },

  githubSearchService: async ({ request }, use) => {
    const githubSearchService = new GithubSearchService(request);
    await use(githubSearchService);
  },

  githubRepoService: async ({ request }, use) => {
    const githubRepoService = new GithubRepoService(request);
    await use(githubRepoService);
  },
});

export { expect } from "@playwright/test";
