import { Locator, Page } from "@playwright/test";

export class GithubCopilotPage {
  readonly page: Page;
  readonly getStartedForFreeButton: Locator;
  readonly plansButton: Locator;
  constructor(page: Page) {
    this.page = page;
    this.getStartedForFreeButton = page.getByRole("link", {
      name: "Get started for free",
    });
    this.plansButton = page.getByRole("link", { name: "See plans & pricing" });
  }

  async validatePageHasLoaded() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.getStartedForFreeButton.isVisible();
  }

  async clickGetStartedForFree() {
    await this.getStartedForFreeButton.click();
  }

  async clickSeePlansAndPricing() {
    await this.plansButton.click();
  }
}
