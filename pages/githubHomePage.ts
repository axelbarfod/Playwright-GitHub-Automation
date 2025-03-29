import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class GithubHomePage extends BasePage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.emailInput = page.locator("#hero_user_email");
    this.signUpButton = page.locator(
      'button[data-analytics-event*="sign_up_button_ctas_hero"]',
    );
  }

  async goToHomePage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Will validate the page has loaded if login and sign up are visible.
   */
  async validatePageHasLoaded() {
    await this.emailInput.isVisible();
    await this.signUpButton.isVisible();
  }
}
