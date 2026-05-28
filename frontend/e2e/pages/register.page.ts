import { type Page, type Locator } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput    = page.getByTestId("register-name-input");
    this.emailInput   = page.getByTestId("register-email-input");
    this.passwordInput = page.getByTestId("register-password-input");
    this.confirmInput = page.getByTestId("register-confirm-input");
    this.submitButton = page.getByTestId("register-button");
  }

  async goto() {
    await this.page.goto("/register");
    await this.page.waitForURL("**/register");
  }

  async register(opts: {
    name?: string;
    email: string;
    password: string;
    confirm?: string;
  }) {
    if (opts.name) await this.nameInput.fill(opts.name);
    await this.emailInput.fill(opts.email);
    await this.passwordInput.fill(opts.password);
    await this.confirmInput.fill(opts.confirm ?? opts.password);
    await this.submitButton.click();
  }
}
