import { test, expect } from "./fixtures";

test.describe("Authentication", () => {
  test("login with valid credentials redirects to dashboard", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(
      process.env.E2E_TEST_EMAIL ?? "test@example.com",
      process.env.E2E_TEST_PASSWORD ?? "testpassword123"
    );
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("login with invalid credentials shows error toast", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login("wrong@example.com", "wrongpassword");

    // Aspetta il toast di errore (usa il contenitore principale, non il testo interno)
    const toast = page.locator("[data-sonner-toast][data-type='error']").first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("login with empty credentials does not submit", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.submitButton.click();
    // HTML5 validation blocca l'invio — rimane sulla pagina login
    await expect(page).toHaveURL(/\/login/);
  });

  test("/dashboard redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("logout invalidates session and redirects to /login", async ({ authenticatedPage, page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await authenticatedPage.logout();
    await expect(page).toHaveURL(/\/login/);

    // Verifica che la sessione sia invalidata — /dashboard redirige di nuovo
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
