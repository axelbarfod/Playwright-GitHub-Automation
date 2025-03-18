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
}
