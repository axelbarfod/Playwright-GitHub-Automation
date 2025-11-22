import { Page } from "@playwright/test";
import { ProductNavBarComponent } from "./product/productNavBarComponent";

export class GitHubNavBarComponent {
  readonly page: Page;
  readonly productNavBarComponent: ProductNavBarComponent;

  constructor(page: Page) {
    this.page = page;
    this.productNavBarComponent = new ProductNavBarComponent(page);
  }

  async navigateToCopilotPage() {
    await this.productNavBarComponent.openCopilotPage();
  }

  async navigateToCodeSearch() {
    await this.productNavBarComponent.openCodeSearchPage();
  }

  async navigateToSecurityPage() {
    await this.productNavBarComponent.openSecurityPage();
  }

  async navigateToActionsPage() {
    await this.productNavBarComponent.openActionsPage();
  }

  async navigateToCodespacesPage() {
    await this.productNavBarComponent.openCodespacesPage();
  }

  async navigateToIssuesPage() {
    await this.productNavBarComponent.openIssuesPage();
  }

  async navigateToCodeReviewPage() {
    await this.productNavBarComponent.openCodeReviewPage();
  }

  async navigateToDiscussionsPage() {
    await this.productNavBarComponent.openDiscussionsPage();
  }

  async navigateToAllFeaturesPage() {
    await this.productNavBarComponent.openAllFeaturesPage();
  }

  async navigateToDocumentationPage() {
    await this.productNavBarComponent.openDocumentationPage();
  }

  async navigateToGithubSkillsPage() {
    await this.productNavBarComponent.openGithubSkillsPage();
  }
}
