import { Locator, Page } from "@playwright/test";

export class GithubLoginPage {
  readonly page: Page;
  readonly userNameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameInput = page.locator("#login_field");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.getByRole("button", {
      name: "Sign in",
      exact: true,
    });
  }

  //Navigate to login page.
  async gotoLogin() {
    await this.page.goto("/login");
    await this.waitForPageToLoad();
  }

  async gotoHome() {
    await this.page.goto("/");
    await this.waitForPageToLoad();
  }

  /**
   * Log's in with specific credentials
   * @param user - username.
   * @param password - password
   */
  async login(user: string, password: string) {
    await this.userNameInput.fill(user);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  //Waits for the page to load
  private async waitForPageToLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
