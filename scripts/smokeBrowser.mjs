import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexPath = path.join(distDir, "index.html");

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function fail(message) {
  throw new Error(message);
}

function startStaticServer() {
  if (!fs.existsSync(indexPath)) {
    fail("Missing dist/index.html. Run npm run build before npm run smoke:browser.");
  }

  const server = http.createServer((request, response) => {
    const rawUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const safePath = path.normalize(rawUrl.pathname).replace(/^(\.\.[/\\])+/, "");
    const requestedPath = path.join(distDir, safePath === "/" ? "index.html" : safePath);
    const targetPath = requestedPath.startsWith(distDir) && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
      ? requestedPath
      : indexPath;
    const extension = path.extname(targetPath);

    response.writeHead(200, { "content-type": mimeTypes[extension] ?? "application/octet-stream" });
    fs.createReadStream(targetPath).pipe(response);
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    console.log(`Browser smoke skipped: Playwright package is unavailable (${error.message}).`);
    return null;
  }
}

function isMissingBrowserError(error) {
  return /executable doesn't exist|browser executable|please run.*playwright install|host system is missing|spawn eperm|operation not permitted|access is denied/i.test(error.message ?? "");
}

async function setSlider(page, label, value) {
  await page.getByRole("slider", { name: label }).evaluate((input, nextValue) => {
    input.value = String(nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function main() {
  const playwright = await importPlaywright();
  if (!playwright) return;

  const { server, url } = await startStaticServer();
  let browser;
  const consoleErrors = [];

  try {
    try {
      browser = await playwright.chromium.launch({ headless: true });
    } catch (error) {
      if (isMissingBrowserError(error)) {
        console.log(`Browser smoke skipped: Chromium runtime is unavailable (${error.message.split("\n")[0]}).`);
        return;
      }
      throw error;
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /turn interests into career paths/i }).waitFor();

    await page.getByRole("button", { name: /Talking to people/ }).click();
    await page.getByRole("button", { name: /Caring for people/ }).click();
    await setSlider(page, "Earning potential", 100);

    const firstRoute = page.locator('[data-testid="route-card"]').first();
    await firstRoute.waitFor();
    const firstRouteText = await firstRoute.innerText();
    if (!firstRouteText.includes("Health, care and social services")) {
      fail(`Care plus high earning did not keep a health/care route first. Saw: ${firstRouteText}`);
    }
    if (!/Reality signal:/i.test(firstRouteText)) fail("First route did not show a lifestyle reality signal.");

    const secondRoute = page.locator('[data-testid="route-card"]').nth(1);
    const routeId = await secondRoute.getAttribute("data-route-id");
    const selectedTitle = (await secondRoute.locator("h3").innerText()).trim();
    await secondRoute.locator(`[data-testid="route-open"][data-route-id="${routeId}"]`).click();
    await page.locator(`h2:has-text("${selectedTitle}")`).waitFor();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("Open navigation").click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).waitFor();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Pathway guide" }).click();
    await page.getByLabel("Open navigation").waitFor();

    if (consoleErrors.length) {
      fail(`Browser console/page errors detected:\n- ${consoleErrors.join("\n- ")}`);
    }

    console.log("Browser smoke validation passed for desktop discovery, sliders, route selection and mobile navigation.");
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(`Browser smoke validation failed: ${error.message}`);
  process.exit(1);
});
