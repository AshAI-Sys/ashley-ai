import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login page", async ({ page }) => {
    await expect(page).toHaveTitle(/Ashley AI|ASH AI/i);
    await expect(
      page.getByRole("heading", { name: /sign in|login/i })
    ).toBeVisible();
  });

  test("should show validation errors for empty login form", async ({
    page,
  }) => {
    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /sign in|login/i });
    await submitButton.click();

    // Should show validation errors (either inline or toast)
    // Wait for either error message to appear
    await expect(
      page.locator('text=/email.*required|please enter.*email/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Should show error message
    await expect(
      page.locator('text=/invalid.*credentials|incorrect.*password/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill in login form
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");

    // Submit form
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/orders|\/home/i, {
      timeout: 10000,
    });

    // Should show user-specific content
    await expect(
      page.locator('text=/dashboard|welcome|orders/i').first()
    ).toBeVisible();
  });

  test("should protect dashboard route when not logged in", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login|\/signin|\/$/i, { timeout: 5000 });
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard|\/orders|\/home/i, {
      timeout: 10000,
    });

    // Find and click logout button (could be in dropdown or direct button)
    const logoutButton = page
      .getByRole("button", { name: /logout|sign out/i })
      .first();

    // If logout is in a dropdown, open it first
    const userMenu = page
      .getByRole("button", { name: /user menu|profile|account/i })
      .first();
    if (await userMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await userMenu.click();
    }

    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login|\/signin|\/$/i, { timeout: 5000 });
  });

  test("should have keyboard accessible login form", async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/email/i)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByLabel(/password/i)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: /sign in|login/i })
    ).toBeFocused();
  });
});

test.describe("Registration Flow", () => {
  test("should navigate to registration from login", async ({ page }) => {
    await page.goto("/");

    const registerLink = page.getByRole("link", {
      name: /sign up|register|create account/i,
    });

    if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register|\/signup/i);
    } else {
      test.skip(true, "Registration link not found");
    }
  });

  test("should validate registration form", async ({ page }) => {
    await page.goto("/register");

    // Try submitting empty form
    const submitButton = page.getByRole("button", {
      name: /sign up|register|create account/i,
    });

    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();

      // Should show validation errors
      await expect(
        page.locator('text=/required|please enter/i').first()
      ).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, "Registration page not implemented");
    }
  });
});
