import { expect, test } from "../../../fixture/ui/GithubUIFixture";

test.describe("Github Dashboard tests", { tag: "@debug" }, () => {
  test("Login Successfully", async ({
    page,
    gitHubLoginPage,
    metricsCollector: _metricsCollector,
  }) => {
    test.skip(process.env.CI !== undefined);

    // Record page navigation
    await gitHubLoginPage.gotoHome();

    await expect(
      page
        .locator(`button[data-login="${process.env.GH_USER!}"]`)
        .or(page.getByRole("button", { name: "Open user navigation menu" }))
        .first(),
    ).toBeVisible();
  });
});
