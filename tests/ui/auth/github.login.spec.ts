import { expect, test } from "@playwright/test";
import { GithubLoginPage } from "../../../pages/githubLoginPage";

test.describe("Login and validate", () => {
  test("Login Successfully", async ({ page }) => {
    const ghLogin = new GithubLoginPage(page);
    await ghLogin.gotoLogin();
    await expect(
      page
        .locator(`button[data-login="${process.env.GH_USER!}"]`)
        .or(page.getByRole("button", { name: "Open user navigation menu" }))
        .first(),
    ).toBeVisible();
  });
});
