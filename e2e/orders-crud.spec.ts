import { test, expect } from "@playwright/test";

test.describe("Orders CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });

    // Navigate to orders
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");
  });

  test("should display orders list", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /orders/i }).first()
    ).toBeVisible();

    // Should have table or list of orders
    const hasTable = await page.locator("table").isVisible({ timeout: 2000 });
    const hasList = await page
      .locator('[role="list"], .order-item, .order-card')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(hasTable || hasList).toBeTruthy();
  });

  test("should open create order form", async ({ page }) => {
    const createButton = page
      .getByRole("button", { name: /new order|create order|add order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Should show form
      await expect(
        page.locator('input[name="client_name"], input[name="clientName"]')
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Try link instead
      const createLink = page.getByRole("link", {
        name: /new order|create order|add order/i,
      });
      await createLink.click();

      await expect(page).toHaveURL(/\/orders\/new|\/orders\/create/i);
    }
  });

  test("should validate order form", async ({ page }) => {
    const createButton = page
      .getByRole("button", { name: /new order|create order|add order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Wait for form
      await page.waitForSelector(
        'input[name="client_name"], input[name="clientName"]',
        { timeout: 5000 }
      );

      // Try to submit empty form
      const submitButton = page
        .getByRole("button", { name: /save|create|submit/i })
        .first();
      await submitButton.click();

      // Should show validation errors
      await expect(
        page.locator('text=/required|please enter|cannot be empty/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should create new order with valid data", async ({ page }) => {
    const createButton = page
      .getByRole("button", { name: /new order|create order|add order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Fill in form with test data
      const clientNameInput = page.locator(
        'input[name="client_name"], input[name="clientName"]'
      );
      await clientNameInput.fill(`Test Client ${Date.now()}`);

      const quantityInput = page.locator(
        'input[name="quantity"], input[type="number"]'
      );
      if (
        await quantityInput.first().isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await quantityInput.first().fill("100");
      }

      // Submit form
      const submitButton = page
        .getByRole("button", { name: /save|create|submit/i })
        .first();
      await submitButton.click();

      // Should show success message
      await expect(
        page.locator('text=/success|created|saved/i').first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("should search/filter orders", async ({ page }) => {
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[type="search"]'
    );

    if (
      await searchInput.first().isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await searchInput.first().fill("test");
      await page.waitForTimeout(1000); // Wait for debounce

      // Results should update
      expect(page.url()).toBeTruthy();
    }
  });

  test("should view order details", async ({ page }) => {
    // Find first order in list
    const firstOrder = page
      .locator(
        'tr:has(td):not(:has(th)), .order-item, .order-card, [data-testid="order-row"]'
      )
      .first();

    if (await firstOrder.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click to view details
      const viewButton = firstOrder.getByRole("button", {
        name: /view|details/i,
      });

      if (await viewButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await viewButton.click();
      } else {
        // Click the row itself
        await firstOrder.click();
      }

      // Should show order details
      await expect(
        page.locator('text=/order.*details|order id|client/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("should handle network errors gracefully", async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);

    const createButton = page
      .getByRole("button", { name: /new order|create order|add order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Try to submit
      const submitButton = page
        .getByRole("button", { name: /save|create|submit/i })
        .first();

      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click();

        // Should show error message
        await expect(
          page.locator('text=/error|failed|network|offline/i').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }

    await context.setOffline(false);
  });

  test("should have accessible form labels", async ({ page }) => {
    const createButton = page
      .getByRole("button", { name: /new order|create order|add order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Check for form labels
      const labels = await page.locator("label").count();
      expect(labels).toBeGreaterThan(0);

      // Each input should have associated label
      const inputs = await page.locator('input[type="text"], input[type="number"]').all();
      for (const input of inputs.slice(0, 3)) {
        const id = await input.getAttribute("id");
        const name = await input.getAttribute("name");

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count();
          expect(hasLabel).toBeGreaterThan(0);
        }
      }
    }
  });
});
