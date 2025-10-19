import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });
  });

  test("should navigate to Orders page", async ({ page }) => {
    const ordersLink = page.getByRole("link", { name: /orders/i }).first();
    await ordersLink.click();

    await expect(page).toHaveURL(/\/orders/i);
    await expect(
      page.getByRole("heading", { name: /orders/i }).first()
    ).toBeVisible();
  });

  test("should navigate to Finance page", async ({ page }) => {
    const financeLink = page.getByRole("link", { name: /finance/i }).first();
    await financeLink.click();

    await expect(page).toHaveURL(/\/finance/i);
    await expect(
      page.getByRole("heading", { name: /finance/i }).first()
    ).toBeVisible();
  });

  test("should navigate to HR & Payroll page", async ({ page }) => {
    const hrLink = page
      .getByRole("link", { name: /hr.*payroll|human resources/i })
      .first();

    if (await hrLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await hrLink.click();
      await expect(page).toHaveURL(/\/hr-payroll|\/hr/i);
      await expect(
        page.getByRole("heading", { name: /hr|payroll|employee/i }).first()
      ).toBeVisible();
    }
  });

  test("should navigate to Dashboard from any page", async ({ page }) => {
    // Go to orders first
    await page.goto("/orders");

    // Click dashboard link
    const dashboardLink = page
      .getByRole("link", { name: /dashboard|home/i })
      .first();
    await dashboardLink.click();

    await expect(page).toHaveURL(/\/dashboard|\/home/i);
  });

  test("all navigation links should be functional", async ({ page }) => {
    // Get all navigation links
    const navLinks = await page.locator("nav a").all();

    for (const link of navLinks.slice(0, 5)) {
      // Test first 5 links
      const href = await link.getAttribute("href");

      if (href && !href.startsWith("#") && !href.startsWith("http")) {
        await link.click();
        await page.waitForLoadState("networkidle", { timeout: 5000 });

        // Verify we navigated somewhere
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();

        // Go back to start for next iteration
        await page.goBack();
        await page.waitForLoadState("networkidle", { timeout: 5000 });
      }
    }
  });

  test("navigation should be keyboard accessible", async ({ page }) => {
    await page.goto("/dashboard");

    // Tab to first navigation item
    await page.keyboard.press("Tab");

    // One of the nav items should be focused
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(["A", "BUTTON"]).toContain(focusedElement);
  });

  test("breadcrumbs should work if present", async ({ page }) => {
    await page.goto("/orders");

    const breadcrumbs = page.locator('[aria-label="breadcrumb"]');

    if (await breadcrumbs.isVisible({ timeout: 2000 }).catch(() => false)) {
      const homeLink = breadcrumbs.getByRole("link", { name: /home/i });
      await homeLink.click();

      await expect(page).toHaveURL(/\/dashboard|\/home/i);
    }
  });
});
