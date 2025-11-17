import { Locator, Page } from "@playwright/test";

export class ProductNavBarComponent {
  readonly page: Page;
  readonly platformButton: Locator;
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
    this.platformButton = page.getByRole("button", { name: "Platform" });
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
    await this.platformButton.click();
  }

  async openCopilotPage() {
    await this.openProductMenu();
    await this.copilotLink.click();
  }

  async openCodeSearchPage() {
    await this.openProductMenu();
    await this.codeSearchLink.click();
  }

  async openSecurityPage() {
    await this.openProductMenu();
    await this.securityLink.click();
  }

  async openActionsPage() {
    await this.openProductMenu();
    await this.actionsLink.click();
  }

  async openCodespacesPage() {
    await this.openProductMenu();
    await this.codeSpaceLink.click();
  }

  async openIssuesPage() {
    await this.openProductMenu();
    await this.issuesLink.click();
  }

  async openCodeReviewPage() {
    await this.openProductMenu();
    await this.codeReviewLink.click();
  }

  async openDiscussionsPage() {
    await this.openProductMenu();
    await this.discussionLink.click();
  }
}
