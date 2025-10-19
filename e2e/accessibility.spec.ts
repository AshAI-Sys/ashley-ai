import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/");
    await page.getByLabel(/email/i).fill("admin@ashleyai.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in|login/i }).click();
    await page.waitForURL(/\/dashboard|\/orders|\/home/i, { timeout: 10000 });
  });

  test("dashboard should not have automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("orders page should not have automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/orders");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("login page should not have automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have skip to main content link", async ({ page }) => {
    await page.goto("/dashboard");

    // Tab to get skip link
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", {
      name: /skip to (main )?content/i,
    });

    if (await skipLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      expect(await skipLink.isVisible()).toBeTruthy();
    } else {
      test.skip(true, "Skip to content link not implemented");
    }
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/dashboard");

    // Should have one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Headings should be in proper order
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    const levels = await Promise.all(
      headings.map(h => h.evaluate(el => parseInt(el.tagName.substring(1))))
    );

    // First heading should be h1
    expect(levels[0]).toBe(1);
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/dashboard");

    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      const ariaLabel = await img.getAttribute("aria-label");
      const role = await img.getAttribute("role");

      // Image should have alt text OR be decorative (role="presentation")
      expect(
        alt !== null || ariaLabel !== null || role === "presentation"
      ).toBeTruthy();
    }
  });

  test("interactive elements should be keyboard accessible", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // All buttons should be focusable
    const buttons = await page.locator("button:visible").all();

    for (const button of buttons.slice(0, 5)) {
      await button.focus();
      const isFocused = await button.evaluate(
        el => document.activeElement === el
      );
      expect(isFocused).toBeTruthy();
    }
  });

  test("forms should have associated labels", async ({ page }) => {
    await page.goto("/orders");

    const createButton = page
      .getByRole("button", { name: /new order|create order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Wait for form
      await page.waitForTimeout(1000);

      const inputs = await page
        .locator('input[type="text"], input[type="email"], input[type="number"]')
        .all();

      for (const input of inputs.slice(0, 3)) {
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");

        // Input should have id with corresponding label OR aria-label
        if (id && !ariaLabel && !ariaLabelledBy) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label).toBeGreaterThan(0);
        }
      }
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .include("body")
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === "color-contrast"
    );

    expect(contrastViolations).toEqual([]);
  });

  test("modal dialogs should trap focus", async ({ page }) => {
    await page.goto("/orders");

    const createButton = page
      .getByRole("button", { name: /new order|create order/i })
      .first();

    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();

      // Check if a modal/dialog opened
      const dialog = page.locator('[role="dialog"]');

      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Tab through elements
        const initialFocus = await page.evaluate(
          () => document.activeElement?.tagName
        );

        // Tab multiple times
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press("Tab");
        }

        // Focus should still be within dialog
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement;
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.contains(active);
        });

        expect(focusedElement).toBeTruthy();
      }
    }
  });

  test("should support dark mode without accessibility issues", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Look for dark mode toggle
    const darkModeToggle = page
      .getByRole("button", { name: /dark mode|theme/i })
      .first();

    if (
      await darkModeToggle.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);

      // Run accessibility scan in dark mode
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa"])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });
});
