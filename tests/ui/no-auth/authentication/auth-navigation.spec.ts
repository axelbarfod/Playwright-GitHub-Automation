import { expect, test } from "../../../../fixture/ui/GithubUIFixture";

test.describe("Authentication Navigation Tests @no-auth", () => {
  test.beforeEach(async ({ githubHomePage }) => {
    await githubHomePage.goToHomePage();
    await githubHomePage.validatePageHasLoaded();
  });

  test("Click 'Sign in' link", async ({ page, githubHomePage }) => {
    await githubHomePage.signInLink.click();

    // Should navigate to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("Click 'Sign up' link", async ({ page, githubHomePage }) => {
    await githubHomePage.signOutLink.click();

    // Should navigate to signup page
    await expect(page).toHaveURL(/.*\/signup/);
  });

  test("Validate authentication links are visible", async ({
    githubHomePage,
  }) => {
    await expect(githubHomePage.signInLink).toBeVisible();
    await expect(githubHomePage.signOutLink).toBeVisible();
  });
});
