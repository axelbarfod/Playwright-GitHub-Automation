import { GithubCopilotPage } from "../../pages/githubCopilotPage";
import { GithubHomePage } from "../../pages/githubHomePage";
import { GithubLoginPage } from "../../pages/githubLoginPage";
import { test as base } from "@playwright/test";

type GithubUIFixture = {
  githubCopilotPage: GithubCopilotPage;
  githubHomePage: GithubHomePage;
  gitHubLoginPage: GithubLoginPage;
};

export const test = base.extend<GithubUIFixture>({
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
