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
    await this.gitHubNavBarComponent.navigateToCodeSearch(); //gtq 4331 GSZ6038 gtg8686
  }
}
