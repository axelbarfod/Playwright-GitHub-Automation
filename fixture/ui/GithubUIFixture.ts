import { GithubCopilotPage } from "../../pages/githubCopilotPage";
import { GithubHomePage } from "../../pages/githubHomePage";
import { GithubLoginPage } from "../../pages/githubLoginPage";
import { test as base } from "@playwright/test";
import { E2EMetricsCollector } from "../../service/metrics/E2EMetricsCollector";
import { MetricsService } from "../../service/metrics/MetricsService";

type GithubUIFixture = {
  metricsCollector: E2EMetricsCollector;
  githubCopilotPage: GithubCopilotPage;
  githubHomePage: GithubHomePage;
  gitHubLoginPage: GithubLoginPage;
};

export const test = base.extend<GithubUIFixture>({
  metricsCollector: async ({ page }, use, testInfo) => {
    const collector = new E2EMetricsCollector();
    const metricsService = new MetricsService();

    // Start collecting metrics
    collector.start();

    // Provide the collector to the test
    await use(collector);

    // After test completes, build and send metrics
    try {
      const metrics = await collector.buildMetrics(testInfo, page);
      await metricsService.pushE2EMetrics(metrics);
    } catch (error) {
      // Don't fail the test if metrics fail
      console.error("Failed to send E2E metrics:", error);
    }
  },

  githubCopilotPage: async ({ page }, use) => {
    const githubCopilotPage = new GithubCopilotPage(page);
    await use(githubCopilotPage);
  },

  githubHomePage: async ({ page }, use) => {
    const githubHomePage = new GithubHomePage(page);
    await use(githubHomePage);
  },
  gitHubLoginPage: async ({ page }, use) => {
    const gitHubLoginPage = new GithubLoginPage(page);
    await use(gitHubLoginPage);
  },
});

export { expect } from "@playwright/test";
