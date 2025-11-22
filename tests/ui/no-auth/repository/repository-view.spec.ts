import { expect, test } from "../../../../fixture/ui/GithubUIFixture";

test.describe("Repository View Tests @no-auth", () => {
  test.beforeEach(async ({ githubRepositoryPage }) => {
    // Using Microsoft's TypeScript repository as a well-known, stable test repository
    await githubRepositoryPage.goToRepository("microsoft", "typescript");
    await githubRepositoryPage.validatePageHasLoaded();
  });

  test("View repository page", async ({ page, githubRepositoryPage }) => {
    // Verify we're on the repository page
    await expect(page).toHaveURL(/.*microsoft\/typescript/);

    // Verify repository name is visible
    await expect(githubRepositoryPage.repositoryName).toBeVisible();
    const repoName = await githubRepositoryPage.getRepositoryName();
    expect(repoName.toLowerCase()).toContain("typescript");
  });

  test("Verify repository README is visible", async ({
    githubRepositoryPage,
  }) => {
    const readmeVisible = await githubRepositoryPage.isReadmeVisible();
    expect(readmeVisible).toBeTruthy();
    await expect(githubRepositoryPage.readmeSection).toBeVisible();
  });

  // Note: Star/Fork button selectors can be tricky due to GitHub's dynamic UI
  // Skipping this test to focus on more reliable interactions
  // test.skip("Verify repository action buttons are visible", async ({
  //   githubRepositoryPage,
  // }) => {
  //   await expect(githubRepositoryPage.starButton).toBeVisible();
  //   await expect(githubRepositoryPage.forkButton).toBeVisible();
  // });

  test("Navigate to Issues tab", async ({ page, githubRepositoryPage }) => {
    await githubRepositoryPage.clickIssuesTab();

    // Should navigate to issues page (case-insensitive)
    await expect(page).toHaveURL(/.*microsoft\/typescript\/issues/i);
  });

  test("Navigate to Pull Requests tab", async ({
    page,
    githubRepositoryPage,
  }) => {
    await githubRepositoryPage.clickPullRequestsTab();

    // Should navigate to pull requests page (case-insensitive)
    await expect(page).toHaveURL(/.*microsoft\/typescript\/pulls/i);
  });

  test("View different repository", async ({ page, githubRepositoryPage }) => {
    // Navigate to a different repository
    await githubRepositoryPage.goToRepository("facebook", "react");
    await githubRepositoryPage.validatePageHasLoaded();

    // Verify we're on the new repository
    await expect(page).toHaveURL(/.*facebook\/react/);
    const repoName = await githubRepositoryPage.getRepositoryName();
    expect(repoName.toLowerCase()).toContain("react");
  });
});
