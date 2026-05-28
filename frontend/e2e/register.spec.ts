import { test, expect } from "@playwright/test";
import { RegisterPage } from "./pages/register.page";

// Email univoca per ogni run — evita conflitti tra test
const uniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@example.com`;

test.describe("Registrazione", () => {
  // Serializza i test di registrazione per non colpire il rate limit di login
  test.describe.configure({ mode: "serial" });

  test("registrazione corretta → redirect a dashboard", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register({
      name: "Nuovo Utente",
      email: uniqueEmail(),
      password: "password123",
    });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("password troppo corta → toast di errore", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register({
      email: uniqueEmail(),
      password: "123",
      confirm: "123",
    });
    const error = page.locator("[data-sonner-toast]").first();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/register/);
  });

  test("password non coincidenti → toast di errore", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register({
      email: uniqueEmail(),
      password: "password123",
      confirm: "diversa456",
    });
    const error = page.locator("[data-sonner-toast]").first();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/register/);
  });

  test("email già esistente → toast 409", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.register({
      email: "test@example.com",
      password: "password123",
    });
    const error = page.locator("[data-sonner-toast]").first();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/register/);
  });

  test("link 'Accedi' porta alla pagina di login", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await page.getByRole("link", { name: "Accedi" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
