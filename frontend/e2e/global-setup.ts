import { chromium, FullConfig, request } from "@playwright/test";
import path from "path";
import fs from "fs";

export const AUTH_STATE_PATH = path.join(__dirname, ".auth", "user.json");

/** Aspetta che il backend sia raggiungibile (via /api/health su Next.js) */
async function waitForBackend(baseURL: string, maxAttempts = 20): Promise<void> {
  const ctx = await request.newContext();
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await ctx.get(`${baseURL}/api/health`);
      if (res.ok()) {
        console.log(`[setup] ✓ Backend healthy (tentativo ${i + 1})`);
        await ctx.dispose();
        return;
      }
    } catch {}
    console.log(`[setup] Backend non pronto, attendo 2s... (${i + 1}/${maxAttempts})`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  await ctx.dispose();
  throw new Error("[setup] Backend non raggiungibile dopo il timeout");
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000";
  const email    = process.env.E2E_TEST_EMAIL    ?? "test@example.com";
  const password = process.env.E2E_TEST_PASSWORD ?? "testpassword123";

  // 1. Aspetta che Next.js + backend siano up
  await waitForBackend(baseURL);

  // 2. Assicura la cartella .auth
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page    = await context.newPage();

  // 3. Login con retry + screenshot su fallimento
  let success = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${baseURL}/login`);
      await page.waitForLoadState("networkidle");

      // Verifica che i campi siano presenti
      await page.getByTestId("email-input").waitFor({ state: "visible", timeout: 8000 });

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill(password);
      await page.getByTestId("login-button").click();

      // Aspetta redirect a /dashboard
      await page.waitForURL("**/dashboard", { timeout: 15000 });

      // ✅ CRITICO: salva l'auth state su disco PRIMA di chiudere il browser
      await context.storageState({ path: AUTH_STATE_PATH });

      success = true;
      console.log(`[setup] ✓ Login riuscito al tentativo ${attempt}`);
      console.log(`[setup] ✓ storageState salvato in ${AUTH_STATE_PATH}`);
      break;
    } catch (err) {
      const screenshotPath = path.join(__dirname, `.auth/setup-fail-${attempt}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.error(`[setup] ✘ Tentativo ${attempt} fallito: ${err}`);
      console.error(`[setup]   Screenshot: ${screenshotPath}`);
      console.error(`[setup]   URL attuale: ${page.url()}`);

      // Controlla se c'è un toast di errore — aiuta a capire il problema
      const toast = page.locator("[data-sonner-toast]").first();
      if (await toast.isVisible()) {
        console.error(`[setup]   Toast visibile: ${await toast.textContent()}`);
      }

      // Aspetta prima del prossimo tentativo (svuota anche il rate-limit)
      if (attempt < 3) {
        console.log("[setup]   Attendo 5s prima del prossimo tentativo...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  await browser.close();

  if (!success) {
    throw new Error(
      "[setup] Login fallito dopo 3 tentativi. Controlla gli screenshot in e2e/.auth/"
    );
  }
}
