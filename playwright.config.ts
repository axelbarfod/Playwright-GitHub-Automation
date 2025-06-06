import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  captureGitInfo: {
    commit: true,
    diff: true,
  },
  timeout: 30_000,
  globalTimeout: 60_000,
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 5 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"] /*, ["list"]*/],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace: "on",
    baseURL: "https://www.github.com",
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    screenshot: {
      mode: "only-on-failure",
    },
    headless: true,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  globalSetup: "./tests/ui/setup/github.login.global-setup.ts",
  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "setup",
    //   testMatch: /.*setup.*\.ts/,
    // },
    {
      name: "chromium-no-auth",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.github.com",
        storageState: undefined,
      },
      testMatch: "tests/ui/no-auth/**/*.spec.ts",
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.github.com",
        storageState: "auth/credentials.json",
        trace: "on",
        launchOptions: {
          args: ["--start-maximized"],
        },
      },
      testMatch: "tests/ui/auth/**/*.spec.ts",
    },
    {
      name: "api",
      use: {
        baseURL: "https://api.github.com/",
        extraHTTPHeaders: {
          Authorization: `token ${process.env.GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
      testMatch: "tests/api/**/*.spec.ts",
    },
  ],
});
