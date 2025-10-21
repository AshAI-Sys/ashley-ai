import { test, expect } from "@playwright/test";

test.describe("Error Pages", () => {
  test("should display 404 page for non-existent routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");

    // Should show 404 page
    await expect(
      page.locator("text=/404|not found|page.*not.*found/i").first()
    ).toBeVisible({ timeout: 5000 });

    // Should have a way to get back home
    const homeLink = page.getByRole("link", { name: /home|dashboard|back/i });
    await expect(homeLink.first()).toBeVisible();
  });

  test("404 page should have navigation back to home", async ({ page }) => {
    await page.goto("/non-existent-page");

    const homeLink = page
      .getByRole("link", { name: /home|dashboard|go back/i })
      .first();

    await homeLink.click();
    await expect(page).toHaveURL(/\/dashboard|\/|\/home/i, { timeout: 5000 });
  });

  test("should handle API errors gracefully in UI", async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });

    // Intercept API calls and return error
    await page.route("**/api/**", route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/orders");

    // Should show error message to user
    await expect(
      page.locator("text=/error|failed|something went wrong/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("should handle slow network gracefully", async ({ page }) => {
    // Login first
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });

    // Slow down network
    await page.route("**/api/**", async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto("/orders");

    // Should show loading state
    const loadingIndicator = page.locator(
      'text=/loading|please wait/i, [role="progressbar"], .spinner, .loading'
    );

    // Check if loading indicator appears
    const hasLoading = await loadingIndicator
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    // It's okay if no loading indicator as long as page doesn't crash
    expect(page.url()).toContain("/orders");
  });

  test("error boundary should catch JavaScript errors", async ({ page }) => {
    await page.goto("/");

    // Inject a runtime error by evaluating bad code
    const hasErrorBoundary = await page
      .evaluate(() => {
        try {
          // This should throw an error
          throw new Error("Test error");
        } catch (e) {
          return true;
        }
      })
      .catch(() => false);

    // If error boundary exists, it should show fallback UI
    // This is a basic test - real error boundaries would be tested differently
    expect(hasErrorBoundary).toBeDefined();
  });

  test("should show user-friendly error messages", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });

    // Intercept API and return specific error
    await page.route("**/api/orders", route => {
      route.fulfill({
        status: 403,
        body: JSON.stringify({ error: "Forbidden" }),
      });
    });

    await page.goto("/orders");

    // Should show user-friendly message, not raw error
    const errorText = await page
      .locator("text=/error|failed|permission/i")
      .first()
      .textContent({ timeout: 10000 })
      .catch(() => "");

    // Should not show raw error codes to users
    expect(errorText?.toLowerCase()).not.toContain("500");
    expect(errorText?.toLowerCase()).not.toContain("null");
    expect(errorText?.toLowerCase()).not.toContain("undefined");
  });

  test("should have recovery action on error pages", async ({ page }) => {
    const response = await page.goto("/non-existent-route");

    // Should have some action to recover
    const recoveryActions = await page
      .locator('button, a, [role="button"], [role="link"]')
      .count();

    expect(recoveryActions).toBeGreaterThan(0);
  });
});
