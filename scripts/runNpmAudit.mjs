import { spawn } from "node:child_process";
import { once } from "node:events";

const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : process.platform === "win32" ? "cmd.exe" : "npm";
const npmArgs = npmExecPath
  ? [npmExecPath, "audit", "--audit-level=moderate"]
  : process.platform === "win32"
    ? ["/d", "/s", "/c", "npm.cmd audit --audit-level=moderate"]
    : ["audit", "--audit-level=moderate"];
const existingNodeOptions = process.env.NODE_OPTIONS ?? "";
const canAppendSystemCaFlag =
  !existingNodeOptions.includes("--use-system-ca") &&
  (process.allowedNodeEnvironmentFlags?.has("--use-system-ca") ?? false);
const nodeOptions = existingNodeOptions.includes("--use-system-ca")
  ? existingNodeOptions
  : canAppendSystemCaFlag
    ? `${existingNodeOptions} --use-system-ca`.trim()
    : existingNodeOptions;

const audit = spawn(npmCommand, npmArgs, {
  cwd: process.cwd(),
  stdio: "inherit",
  windowsHide: process.platform === "win32",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

const [code] = await once(audit, "exit");
process.exit(code ?? 1);
