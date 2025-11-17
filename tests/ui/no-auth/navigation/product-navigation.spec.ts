import { expect, test } from "../../../../fixture/ui/GithubUIFixture";

test.describe("Product Navigation Tests @no-auth", () => {
  test.beforeEach(async ({ githubHomePage }) => {
    await githubHomePage.goToHomePage();
    await githubHomePage.validatePageHasLoaded();
  });

  test("Navigate to Code Search page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToCodeSearch();
    await expect(page).toHaveURL(/.*code-search|.*\/search/);
    await expect(page).toHaveTitle(/.*Search|.*Code search/);
  });

  test("Navigate to Security page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToSecurityPage();
    await expect(page).toHaveURL(/.*security/);
    await expect(page).toHaveTitle(/.*Security/);
  });

  test("Navigate to Actions page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToActionsPage();
    await expect(page).toHaveURL(/.*features\/actions/);
    await expect(page).toHaveTitle(/.*GitHub Actions/);
  });

  test("Navigate to Codespaces page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToCodespacesPage();
    await expect(page).toHaveURL(/.*codespaces/);
    await expect(page).toHaveTitle(/.*Codespaces/);
  });

  test("Navigate to Issues page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToIssuesPage();
    await expect(page).toHaveURL(/.*issues/);
    await expect(page).toHaveTitle(/.*Issues/);
  });

  test("Navigate to Code Review page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToCodeReviewPage();
    await expect(page).toHaveURL(/.*code-review/);
    await expect(page).toHaveTitle(/.*Code [Rr]eview/);
  });

  test("Navigate to Discussions page", async ({ page, githubHomePage }) => {
    await githubHomePage.navigateToDiscussionsPage();
    await expect(page).toHaveURL(/.*discussions/);
    await expect(page).toHaveTitle(/.*Discussions/);
  });
});
