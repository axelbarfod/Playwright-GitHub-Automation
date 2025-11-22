import { Locator, Page } from "@playwright/test";

export class GithubRepositoryPage {
  readonly page: Page;
  readonly repositoryName: Locator;
  readonly repositoryDescription: Locator;
  readonly readmeSection: Locator;
  readonly filesList: Locator;
  readonly starButton: Locator;
  readonly forkButton: Locator;
  readonly watchButton: Locator;
  readonly codeButton: Locator;
  readonly issuesTab: Locator;
  readonly pullRequestsTab: Locator;
  readonly actionsTab: Locator;
  readonly aboutSection: Locator;
  readonly starCount: Locator;
  readonly forkCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.repositoryName = page.locator('[itemprop="name"]').first();
    this.repositoryDescription = page.locator('[itemprop="description"]').first();
    this.readmeSection = page.locator('article').first();
    this.filesList = page.locator('[aria-labelledby="files"]');
    this.starButton = page.locator('button, a').filter({ hasText: /star/i }).first();
    this.forkButton = page.locator('a').filter({ hasText: /fork/i }).first();
    this.watchButton = page.locator('button').filter({ hasText: /watch/i }).first();
    this.codeButton = page.getByRole("button", { name: /code/i }).first();
    this.issuesTab = page.getByRole("link", { name: /issues/i }).first();
    this.pullRequestsTab = page.getByRole("link", {
      name: /pull requests/i,
    }).first();
    this.actionsTab = page.getByRole("link", { name: /actions/i }).first();
    this.aboutSection = page.locator('[data-pjax="#repo-content-pjax-container"]').locator("div.BorderGrid-cell").first();
    this.starCount = page.locator("#repo-stars-counter-star");
    this.forkCount = page.locator("#repo-network-counter");
  }

  async goToRepository(owner: string, repo: string) {
    await this.page.goto(`https://github.com/${owner}/${repo}`);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async validatePageHasLoaded() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.repositoryName.waitFor({ state: "visible", timeout: 10000 });
  }

  async clickIssuesTab() {
    await this.issuesTab.click();
  }

  async clickPullRequestsTab() {
    await this.pullRequestsTab.click();
  }

  async clickActionsTab() {
    await this.actionsTab.click();
  }

  async clickCodeButton() {
    await this.codeButton.click();
  }

  async getRepositoryName(): Promise<string> {
    return (await this.repositoryName.textContent()) || "";
  }

  async getRepositoryDescription(): Promise<string> {
    return (await this.repositoryDescription.textContent()) || "";
  }

  async isReadmeVisible(): Promise<boolean> {
    return await this.readmeSection.isVisible();
  }

  async getStarCount(): Promise<string> {
    return (await this.starCount.textContent()) || "0";
  }

  async getForkCount(): Promise<string> {
    return (await this.forkCount.textContent()) || "0";
  }
}
