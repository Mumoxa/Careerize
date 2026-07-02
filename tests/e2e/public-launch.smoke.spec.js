import { expect, test } from "@playwright/test";

test("learner can complete the public discovery and pathway journey", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Careerize/i);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: /Start exploring/i }).first().click();
  await expect(page).toHaveURL(/#discover/);

  const digitalTools = page.getByRole("button", { name: "Digital tools", exact: true });
  const beforeSignalSelection = page.url();
  await digitalTools.click();

  await expect(digitalTools).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.url()).not.toBe(beforeSignalSelection);
  await expect(page.getByRole("heading", { name: "Route explorer", exact: true })).toBeVisible();

  const pathwayButtons = page.getByRole("button", { name: /^View pathway:/i });
  await expect(pathwayButtons.first()).toBeVisible();

  const beforePathwaySelection = page.url();
  await pathwayButtons.first().click();

  await expect.poll(() => page.url()).not.toBe(beforePathwaySelection);
  await expect(page.getByText("Starter guidance", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Template guidance", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs provider verification", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/not an admissions decision/i).first()).toBeVisible();

  await expect(page.getByRole("textbox", { name: "Search interests" })).toHaveCount(0);
});
