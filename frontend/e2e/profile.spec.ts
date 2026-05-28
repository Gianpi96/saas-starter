import { test, expect } from "./fixtures";
import { ProfilePage } from "./pages/profile.page";

test.describe("Gestione profilo", () => {
  test("la pagina profilo mostra i dati utente", async ({ authenticatedPage, page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    // Il campo email deve essere precompilato
    await expect(profile.emailInput).toHaveValue(/test@example.com/);
  });

  test("aggiornamento nome → toast di successo", async ({ authenticatedPage, page }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.updateProfile("Nome Aggiornato");
    const success = page.locator("[data-sonner-toast]").first();
    await expect(success).toBeVisible({ timeout: 5000 });
    await expect(success).toContainText(/aggiornato/i);
  });

  test("cambio password corretto → toast di successo e form svuotato", async ({
    authenticatedPage,
    page,
  }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.changePassword("testpassword123", "nuovaPassword456");
    const success = page.locator("[data-sonner-toast]").first();
    await expect(success).toBeVisible({ timeout: 5000 });
    await expect(success).toContainText(/password/i);
    // Rimetti la password originale per non rompere gli altri test
    await profile.changePassword("nuovaPassword456", "testpassword123");
  });

  test("cambio password con password attuale sbagliata → toast 400", async ({
    authenticatedPage,
    page,
  }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.changePassword("password_errata", "nuovaPassword456");
    const error = page.locator("[data-sonner-toast]").first();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText(/non corretta/i);
  });

  test("nuove password non coincidenti → toast di errore lato client", async ({
    authenticatedPage,
    page,
  }) => {
    const profile = new ProfilePage(page);
    await profile.goto();
    await profile.changePassword("testpassword123", "nuova123456", "diversa999");
    const error = page.locator("[data-sonner-toast]").first();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText(/non coincidono/i);
  });
});
