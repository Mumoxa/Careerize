import { expect, test } from "@playwright/test";

test("learner can complete the public discovery and pathway journey", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Careerize/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const careerSearch = page.getByRole("searchbox", { name: /Career search/i });
  await expect(careerSearch).toBeVisible();
  await careerSearch.fill("Data Analyst");

  const beforeProfileSelection = page.url();
  await page.getByRole("button", { name: /Open first match/i }).click();

  await expect.poll(() => page.url()).not.toBe(beforeProfileSelection);
  await expect(page).toHaveURL(/pathway=data-analyst/);
  await expect(page.locator("#pathway-detail").getByRole("heading", { name: "Data Analyst", exact: true })).toBeVisible();
  await expect(page.getByText("Starter guidance", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Template guidance", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs provider verification", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/not an admissions decision/i).first()).toBeVisible();

  await expect(page.getByRole("searchbox", { name: "Search interests" })).toBeVisible();
});
