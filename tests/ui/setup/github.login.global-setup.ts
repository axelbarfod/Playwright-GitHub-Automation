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

  if (!baseUrl) {
    throw new Error("Base URL is not set as an environment variable");
  }

  const page = await browser
    .newContext({ baseURL: baseUrl })
    .then((context) => context.newPage());

  const ghLogin = new GithubLoginPage(page);

  await ghLogin.gotoLogin();
  await ghLogin.login(process.env.GH_USER!, process.env.GH_PASSWORD!);

  await page.context().storageState({ path: userFile });

  await browser.close();
}
