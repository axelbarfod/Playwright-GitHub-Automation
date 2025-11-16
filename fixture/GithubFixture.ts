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
import { APIMetricsCollector } from "../service/metrics/APIMetricsCollector";
import { MetricsService } from "../service/metrics/MetricsService";

type GithubFixture = {
  ajv: Ajv;
  metricsCollector: APIMetricsCollector;
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

  metricsCollector: async ({}, use, testInfo) => {
    const collector = new APIMetricsCollector();
    const metricsService = new MetricsService();

    // Start collecting metrics
    collector.start();

    // Provide the collector to the test
    await use(collector);

    // After test completes, build and send metrics
    try {
      const metrics = collector.buildMetrics(testInfo);
      await metricsService.pushAPIMetrics(metrics);
    } catch (error) {
      // Don't fail the test if metrics fail
      console.error("Failed to send metrics:", error);
    }
  },

  githubIssueService: async ({ request, metricsCollector }, use) => {
    const githubIssueService = new GithubIssueService(
      request,
      metricsCollector,
    );
    await use(githubIssueService);
  },

  githubSearchService: async ({ request, metricsCollector }, use) => {
    const githubSearchService = new GithubSearchService(
      request,
      metricsCollector,
    );
    await use(githubSearchService);
  },

  githubRepoService: async ({ request, metricsCollector }, use) => {
    const githubRepoService = new GithubRepoService(request, metricsCollector);
    await use(githubRepoService);
  },
});

export { expect } from "@playwright/test";
