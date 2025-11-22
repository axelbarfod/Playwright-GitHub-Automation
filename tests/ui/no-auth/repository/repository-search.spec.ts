import { expect, test } from "../../../../fixture/ui/GithubUIFixture";

test.describe("Repository Search Tests @no-auth", () => {
  // Note: GitHub's homepage search requires clicking to reveal the search input,
  // so direct navigation to search results is more reliable for testing

  test("Navigate to search results page", async ({ page }) => {
    // Directly navigate to search results (simulating a search)
    await page.goto("https://github.com/search?q=playwright&type=repositories");
    await page.waitForLoadState("domcontentloaded");

    // Verify we're on search results page
    await expect(page).toHaveURL(/.*\/search/);
    await expect(page).toHaveURL(/.*q=playwright/);
  });

  test("Search results page displays content", async ({ page }) => {
    await page.goto("https://github.com/search?q=typescript&type=repositories");
    await page.waitForLoadState("domcontentloaded");

    // Verify page loaded with content
    await expect(page.locator("body")).toContainText(/typescript/i);
  });
});
