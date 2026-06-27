import { spawn } from "node:child_process";
import http from "node:http";
import { once } from "node:events";

const host = "127.0.0.1";
const port = 4173;
const baseURL = `http://${host}:${port}`;
const serverTimeoutMs = 30000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < serverTimeoutMs) {
    const ready = await new Promise((resolve) => {
      const request = http.get(baseURL, (response) => {
        response.resume();
        resolve(response.statusCode >= 200 && response.statusCode < 500);
      });

      request.on("error", () => resolve(false));
      request.setTimeout(1000, () => {
        request.destroy();
        resolve(false);
      });
    });

    if (ready) return;
    await wait(250);
  }

  throw new Error(`Timed out waiting for ${baseURL}.`);
}

function spawnNode(args, options = {}) {
  return spawn(process.execPath, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    windowsHide: true,
    ...options,
    env: {
      ...process.env,
      FORCE_COLOR: "1",
      ...(options.env ?? {}),
    },
  });
}

async function stopServer(server) {
  if (server.exitCode !== null || server.killed) return;

  server.kill();
  const exited = await Promise.race([
    once(server, "exit").then(() => true),
    wait(5000).then(() => false),
  ]);

  if (!exited && server.exitCode === null) {
    server.kill("SIGKILL");
  }
}

const server = spawnNode([
  "./node_modules/vite/bin/vite.js",
  "preview",
  "--host",
  host,
  "--port",
  String(port),
  "--strictPort",
]);

let exitCode = 1;

try {
  await waitForServer();

  const playwright = spawnNode(
    ["./node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)],
    { env: { CAREERIZE_PLAYWRIGHT_MANAGED_SERVER: "1" } }
  );

  const [code] = await once(playwright, "exit");
  exitCode = code ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  await stopServer(server);
}

process.exit(exitCode);
