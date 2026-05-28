import { test, expect } from "./fixtures";

test.describe("Dashboard", () => {
  test("shows welcome card after login", async ({ authenticatedPage, page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    // Card should appear (may be skeleton first, then real card)
    const card = page
      .getByTestId("welcome-card")
      .or(page.getByTestId("welcome-card-skeleton"));
    await expect(card).toBeVisible({ timeout: 8000 });
  });

  test("sidebar navigation links are visible", async ({ authenticatedPage, page }) => {
    await expect(page.getByTestId("nav-dashboard")).toBeVisible();
    await expect(page.getByTestId("nav-profile")).toBeVisible();
    await expect(page.getByTestId("nav-settings")).toBeVisible();
    await expect(page.getByTestId("logout-button")).toBeVisible();
  });

  test("navigating to profile page works", async ({ authenticatedPage, page }) => {
    await page.getByTestId("nav-profile").click();
    await expect(page).toHaveURL(/\/dashboard\/profile/);
    await expect(page.getByRole("heading", { name: /profile/i })).toBeVisible();
  });

  test("navigating to settings page works", async ({ authenticatedPage, page }) => {
    await page.getByTestId("nav-settings").click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });
});
