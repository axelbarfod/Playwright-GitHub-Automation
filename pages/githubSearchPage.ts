import { Locator, Page } from "@playwright/test";

export class GithubSearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly repositoriesTab: Locator;
  readonly codeTab: Locator;
  readonly issuesTab: Locator;
  readonly pullRequestsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[name="q"]').first();
    this.searchResults = page.locator('[data-testid="results-list"]');
    this.repositoriesTab = page.getByRole("link", { name: /repositories/i });
    this.codeTab = page.getByRole("link", { name: /^code$/i });
    this.issuesTab = page.getByRole("link", { name: /issues/i });
    this.pullRequestsTab = page.getByRole("link", { name: /pull requests/i });
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press("Enter");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async filterByRepositories() {
    await this.repositoriesTab.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async filterByCode() {
    await this.codeTab.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async filterByIssues() {
    await this.issuesTab.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async filterByPullRequests() {
    await this.pullRequestsTab.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getFirstRepositoryResult(): Promise<Locator> {
    return this.page.locator('[data-testid="results-list"] a').first();
  }

  async clickFirstRepository() {
    const firstResult = await this.getFirstRepositoryResult();
    await firstResult.click();
  }
}
