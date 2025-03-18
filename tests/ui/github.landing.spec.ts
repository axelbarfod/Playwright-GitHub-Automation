import { expect, test } from "@playwright/test";
import { GithubHomePage } from "../../pages/githubHomePage";
import { GithubCopilotPage } from "../../pages/githubCopilotPage";

test.describe("Navigate to landing page", () => {
  test.beforeEach(async ({ page }) => {
    const githubHomePage: GithubHomePage = new GithubHomePage(page);
    await githubHomePage.goToHomePage();
    return githubHomePage;
  });

  test("navigates to landing page", { tag: "@debug" }, async ({ page }) => {
    const githubHomePage = new GithubHomePage(page);
    await githubHomePage.validatePageHasLoaded();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("github-landing-page.png");
    await expect(page).toHaveTitle(/GitHub.*Build and ship software/);
  });

  test("Click on products and then go to copilot", async ({ page }) => {
    const githubHomePage = new GithubHomePage(page);
    await githubHomePage.validatePageHasLoaded();
    await page.waitForLoadState("networkidle");
    await githubHomePage.navigateToCopilotPage();
    const githubCopilotPage = new GithubCopilotPage(page);
    await githubCopilotPage.validatePageHasLoaded();
    await expect(page).toHaveTitle(/GitHub Copilot.*AI pair programmer/);
  });
});
