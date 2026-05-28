import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.submitButton = page.getByTestId("login-button");
  }

  async goto() {
    await this.page.goto("/login");
    await this.page.waitForURL("**/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async waitForError() {
    return this.page.getByRole("status").or(this.page.locator("[data-sonner-toast]")).waitFor({ timeout: 5000 });
  }
}
