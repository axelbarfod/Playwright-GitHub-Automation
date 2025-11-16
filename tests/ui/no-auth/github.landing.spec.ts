import { expect, test } from "../../../fixture/ui/GithubUIFixture";

test.describe("Navigate to landing page", () => {
  test.beforeEach(async ({ githubHomePage }) => {
    await githubHomePage.goToHomePage();
  });

  test("navigates to landing page", async ({
    page,
    githubHomePage,
    metricsCollector: _metricsCollector,
  }) => {
    await githubHomePage.validatePageHasLoaded();
    //await expect(page).toHaveScreenshot("github-landing-page.png");
    await expect(page).toHaveTitle(
      "GitHub · Change is constant. GitHub keeps you ahead. · GitHub",
    );
  });

  test("Click on products and then go to copilot @no-auth", async ({
    page,
    githubHomePage,
    githubCopilotPage,
    metricsCollector: _metricsCollector,
  }) => {
    await githubHomePage.validatePageHasLoaded();
    await githubHomePage.navigateToCopilotPage();
    await githubCopilotPage.validatePageHasLoaded();
    await expect(page).toHaveTitle(/GitHub Copilot.*AI pair programmer/);
  });
});
