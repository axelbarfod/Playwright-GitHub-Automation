import { Locator, Page } from "@playwright/test";
import { GitHubNavBarComponent } from "./navbar/githubNavBarComponent";

export class BasePage {
  readonly page: Page;
  readonly signInLink: Locator;
  readonly signOutLink: Locator;
  readonly gitHubNavBarComponent: GitHubNavBarComponent;

  constructor(page: Page) {
    this.page = page;
    this.signInLink = page.getByRole("link", { name: "Sign in" });
    this.signOutLink = page.getByRole("link", { name: "Sign up" });
    this.gitHubNavBarComponent = new GitHubNavBarComponent(page);
  }

  async navigateToCopilotPage() {
    await this.gitHubNavBarComponent.navigateToCopilotPage();
  }

  async navigateToCodeSearch() {
    await this.gitHubNavBarComponent.navigateToCodeSearch();
  }

  async navigateToSecurityPage() {
    await this.gitHubNavBarComponent.navigateToSecurityPage();
  }

  async navigateToActionsPage() {
    await this.gitHubNavBarComponent.navigateToActionsPage();
  }

  async navigateToCodespacesPage() {
    await this.gitHubNavBarComponent.navigateToCodespacesPage();
  }

  async navigateToIssuesPage() {
    await this.gitHubNavBarComponent.navigateToIssuesPage();
  }

  async navigateToCodeReviewPage() {
    await this.gitHubNavBarComponent.navigateToCodeReviewPage();
  }

  async navigateToDiscussionsPage() {
    await this.gitHubNavBarComponent.navigateToDiscussionsPage();
  }

  async navigateToAllFeaturesPage() {
    await this.gitHubNavBarComponent.navigateToAllFeaturesPage();
  }

  async navigateToDocumentationPage() {
    await this.gitHubNavBarComponent.navigateToDocumentationPage();
  }

  async navigateToGithubSkillsPage() {
    await this.gitHubNavBarComponent.navigateToGithubSkillsPage();
  }
}
