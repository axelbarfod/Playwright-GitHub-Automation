import { Locator, Page } from "@playwright/test";

export class ProductNavBarComponent {
  readonly page: Page;
  readonly productButton: Locator;
  readonly copilotLink: Locator;
  readonly securityLink: Locator;
  readonly actionsLink: Locator;
  readonly codeSpaceLink: Locator;
  readonly issuesLink: Locator;
  readonly codeReviewLink: Locator;
  readonly discussionLink: Locator;
  readonly codeSearchLink: Locator;
  readonly allFeaturesLink: Locator;
  readonly documentationLink: Locator;
  readonly githubSkillLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productButton = page.getByRole("button", { name: "Product" });
    this.copilotLink = page.getByRole("link", {
      name: "GitHub Copilot Write better",
    });
    this.securityLink = page.getByRole("link", {
      name: "Security Find and fix",
    });
    this.actionsLink = page.getByRole("link", {
      name: "Actions Automate any workflow",
    });
    this.codeSpaceLink = page.getByRole("link", {
      name: "Codespaces Instant dev",
    });
    this.issuesLink = page.getByRole("link", {
      name: "Issues Plan and track work",
    });
    this.codeReviewLink = page.getByRole("link", {
      name: "Code Review Manage code",
    });
    this.codeSearchLink = page.getByRole("link", {
      name: "Code Search Find more, search",
    });
    this.discussionLink = page.getByRole("link", {
      name: "Discussions Collaborate",
    });
    this.allFeaturesLink = page.getByRole("link", { name: "All features" });
    this.documentationLink = page.getByRole("link", {
      name: "Documentation",
    });
    this.githubSkillLink = page.getByRole("button", { name: "GitHub Skills" });
  }

  async openProductMenu() {
    await this.productButton.click();
  }

  async openCopilotPage() {
    await this.openProductMenu();
    await this.copilotLink.click();
  }

  async openCodeSearchPage() {
    await this.openProductMenu();
    await this.codeSearchLink.click();
  }
}
