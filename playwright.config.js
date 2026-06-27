import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const managedServer = process.env.CAREERIZE_PLAYWRIGHT_MANAGED_SERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(executablePath
          ? { launchOptions: { executablePath } }
          : { channel: "chromium" }),
      },
    },
  ],
  webServer: managedServer
    ? undefined
    : {
        command: "node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
