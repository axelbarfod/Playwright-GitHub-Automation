import { test as setup, expect } from "@playwright/test";
import { GithubLoginPage } from "../../../pages/githubLoginPage";

setup("Login User", async ({ page, context }) => {
  const user = process.env.GH_USER!;
  const password = process.env.GH_PASSWORD!;
  const userFile = ".auth/user.json";
  const ghLogin = new GithubLoginPage(page);
  await ghLogin.gotoLogin();
  await ghLogin.login(user, password);
  await context.storageState({ path: userFile });
  await expect(
    page.getByRole("button", { name: "Open user navigation menu" }),
  ).toBeVisible();
});
