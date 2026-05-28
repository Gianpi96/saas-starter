import { test as base, Cookie } from "@playwright/test";
import fs from "fs";
import { LoginPage } from "./pages/login.page";
import { DashboardPage } from "./pages/dashboard.page";
import { AUTH_STATE_PATH } from "./global-setup";

export type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: DashboardPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  /**
   * Carica l'auth state salvato da globalSetup nel contesto corrente della `page`.
   * In questo modo il `page` fixture nel test e l'`authenticatedPage` puntano allo
   * stesso oggetto — nessun "about:blank" e nessuna sessione mancante.
   */
  authenticatedPage: async ({ page }, use) => {
    // Inietta i cookie salvati nel contesto di `page`
    const raw = fs.readFileSync(AUTH_STATE_PATH, "utf-8");
    const storageState = JSON.parse(raw) as {
      cookies: Cookie[];
      origins: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>;
    };

    await page.context().addCookies(storageState.cookies);

    // Naviga alla dashboard
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from "@playwright/test";
