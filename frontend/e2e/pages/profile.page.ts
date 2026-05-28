import { type Page, type Locator } from "@playwright/test";

export class ProfilePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput             = page.getByTestId("profile-name-input");
    this.emailInput            = page.getByTestId("profile-email-input");
    this.saveButton            = page.getByTestId("profile-save-button");
    this.currentPasswordInput  = page.getByTestId("current-password-input");
    this.newPasswordInput      = page.getByTestId("new-password-input");
    this.confirmPasswordInput  = page.getByTestId("confirm-password-input");
    this.changePasswordButton  = page.getByTestId("change-password-button");
  }

  async goto() {
    await this.page.goto("/dashboard/profile");
    await this.page.waitForURL("**/dashboard/profile");
    // Aspetta che il form sia caricato E che i dati utente siano arrivati
    // (l'email viene precompilata solo dopo che useUser restituisce i dati)
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        return el !== null && el.value.length > 0;
      },
      '[data-testid="profile-email-input"]',
      { timeout: 10000 }
    );
  }

  async updateProfile(name: string) {
    await this.nameInput.fill(name);
    await this.saveButton.click();
  }

  async changePassword(current: string, next: string, confirm?: string) {
    await this.currentPasswordInput.fill(current);
    await this.newPasswordInput.fill(next);
    await this.confirmPasswordInput.fill(confirm ?? next);
    await this.changePasswordButton.click();
  }
}
