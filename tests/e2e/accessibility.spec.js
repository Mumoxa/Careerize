import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function expectNoA11yViolations(page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

test("landing and pathway journey have no automated WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Signal Deck Studio" })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole("link", { name: "Career search" }).click();
  await page.getByRole("searchbox", { name: /Career search/i }).fill("Data Analyst");
  await page.getByRole("button", { name: /Open first match/i }).click();
  await expect(page.getByText("Needs provider verification", { exact: true }).first()).toBeVisible();
  await expectNoA11yViolations(page);
});
