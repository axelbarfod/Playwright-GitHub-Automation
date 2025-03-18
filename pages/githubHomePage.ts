import { Locator, Page } from "@playwright/test";

export class GithubHomePage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.locator(".HeaderMenu-link--sign-in");
    this.signInButton = page.locator(".HeaderMenu-link--sign-up");
  }

  async goToHomePage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Will validate the page has loaded if login and sign up are visible.
   */
  async validatePageHasLoaded() {
    await this.loginButton.isVisible();
    await this.signInButton.isVisible();
  }
}
