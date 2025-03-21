import { chromium, firefox } from "@playwright/test";
import { GithubLoginPage } from "../../../pages/githubLoginPage";

//we can add the config: FullConfig to get access the playwright configuration but you have no access to the use.
export default async function globalSetup() {
  const browserName = process.env.BROWSER || "chromium";

  const userFile = ".auth/credentials.json";
  let browser;

  if (browserName === "firefox") {
    browser = await firefox.launch();
  } else {
    browser = await chromium.launch();
  }

  const baseUrl = process.env.GH_BASE_URL_UI!;
  const user = process.env.GH_USER!;
  const password = process.env.GH_PASSWORD!;

  if (!baseUrl || !user || !password) {
    throw new Error("Missing environments variable");
  }

  const page = await browser
    .newContext({ baseURL: baseUrl })
    .then((context) => context.newPage());

  const ghLogin = new GithubLoginPage(page);

  await ghLogin.gotoLogin();
  await ghLogin.login(user, password);

  await page.context().storageState({ path: userFile });

  await browser.close();

  console.log("Global setup completed successfully");
}
