import { expect, test } from "../../../../fixture/ui/GithubUIFixture";

test.describe("Copilot Page Interactions @no-auth", () => {
  test.beforeEach(async ({ githubHomePage, githubCopilotPage }) => {
    await githubHomePage.goToHomePage();
    await githubHomePage.navigateToCopilotPage();
    await githubCopilotPage.validatePageHasLoaded();
  });

  test("Click 'Get started for free' button", async ({
    page,
    githubCopilotPage,
  }) => {
    await githubCopilotPage.clickGetStartedForFree();

    // Should navigate to signup/login or pricing page
    await expect(page).toHaveURL(/.*copilot.*|.*\/login|.*\/signup/);
  });

  test("Click 'See plans & pricing' button", async ({
    page,
    githubCopilotPage,
  }) => {
    await githubCopilotPage.clickSeePlansAndPricing();

    // Should navigate to pricing page
    await expect(page).toHaveURL(/.*pricing|.*copilot/);
    await expect(page).toHaveTitle(/.*[Pp]ricing|.*Copilot/);
  });

  test("Validate Copilot page buttons are visible", async ({
    githubCopilotPage,
  }) => {
    await expect(githubCopilotPage.getStartedForFreeButton).toBeVisible();
    await expect(githubCopilotPage.plansButton).toBeVisible();
  });
});
