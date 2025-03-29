import { expect, test } from "@playwright/test";
import { GithubLoginPage } from "../../../pages/githubLoginPage";

test.describe("Github Dashboard tests", { tag: "@debug" }, () => {
  test("Login Successfully", async ({ page }) => {
    test.skip(process.env.CI !== undefined);
    const ghLogin = new GithubLoginPage(page);
    await ghLogin.gotoHome();
    await expect(
      page
        .locator(`button[data-login="${process.env.GH_USER!}"]`)
        .or(page.getByRole("button", { name: "Open user navigation menu" }))
        .first(),
    ).toBeVisible();
  });
});
