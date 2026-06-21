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
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole("link", { name: /Start exploring/i }).first().click();
  await page.getByRole("button", { name: "Digital tools", exact: true }).click();
  await page.getByRole("button", { name: /^View pathway:/i }).first().click();
  await expect(page.getByText("Needs provider verification", { exact: true }).first()).toBeVisible();
  await expectNoA11yViolations(page);
});
