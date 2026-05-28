import { type Page, type Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly navDashboard: Locator;
  readonly welcomeCard: Locator;
  readonly skeletonCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByTestId("logout-button");
    this.navDashboard = page.getByTestId("nav-dashboard");
    this.welcomeCard = page.getByTestId("welcome-card");
    this.skeletonCard = page.getByTestId("welcome-card-skeleton");
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL("**/login");
  }

  async isLoaded() {
    await this.page.waitForURL("**/dashboard");
    await this.welcomeCard.waitFor({ timeout: 10000 });
  }
}
