import fs from "node:fs";

import { CAREER_COVERAGE_SUMMARY } from "../src/data/careerCatalog.js";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");
const deploymentReadiness = fs.readFileSync(new URL("../docs/deployment-readiness.md", import.meta.url), "utf8");
const coverageManifest = fs.readFileSync(new URL("../docs/CAREER_COVERAGE_MANIFEST.md", import.meta.url), "utf8");

const requiredCopy = [
  "Starter guidance",
  "Template guidance",
  "Needs provider verification",
  "Verified pathway",
  "Exploration matches",
  "not an admissions decision",
  "Requirements vary by provider",
  "Why this route matched",
];

const bannedPatterns = [
  /you qualify for/i,
  /you (?:are|may be) eligible for/i,
  /best (?:study |career )?route for you/i,
  /recommended career/i,
  /route appears open/i,
  /perfect match/i,
];

const errors = [];
const currentRouteCount = new Intl.NumberFormat("en-US").format(CAREER_COVERAGE_SUMMARY.totalRoutes);
const launchDocs = {
  "README.md": readme,
  "docs/deployment-readiness.md": deploymentReadiness,
  "docs/CAREER_COVERAGE_MANIFEST.md": coverageManifest,
};

for (const copy of requiredCopy) {
  if (!app.includes(copy)) errors.push(`Missing required learner-facing copy: ${copy}`);
}

for (const pattern of bannedPatterns) {
  if (pattern.test(app)) errors.push(`Unsafe learner-facing claim found: ${pattern}`);
}

if (app.includes('placeholder="Search interests"')) {
  errors.push("The former non-functional interest search is still visible.");
}

if (/\.\/assets\/.+\.png/.test(app)) {
  errors.push("App still imports a large PNG asset.");
}

if (/fonts\.googleapis\.com/i.test(css)) {
  errors.push("Landing CSS still loads the Google Fonts network dependency.");
}

if (!app.includes("CAREER_COVERAGE_SUMMARY")) {
  errors.push("App should render the route count from CAREER_COVERAGE_SUMMARY instead of hardcoded copy.");
}

if (app.includes('value="344"') || /\b344 starter/.test(app)) {
  errors.push("App still contains stale 344-route public copy.");
}

for (const [fileName, content] of Object.entries(launchDocs)) {
  if (!content.includes(currentRouteCount)) {
    errors.push(`${fileName} does not include the current ${currentRouteCount}-route catalog count.`);
  }

  if (/[Ââ]/.test(content)) {
    errors.push(`${fileName} contains mojibake characters.`);
  }
}

if (/[Ââ]/.test(app)) {
  errors.push("App contains mojibake characters.");
}

if (/Framer Motion/i.test(readme)) {
  errors.push("README still lists Framer Motion even though it is not a dependency.");
}

if (/fallback when Supabase environment variables are absent/i.test(readme)) {
  errors.push("README still claims a live Supabase/local saved-profile fallback that is not exposed in the public UI.");
}

if (!readme.includes("public UI does not currently expose account creation")) {
  errors.push("README must state that account creation and saved profiles are not currently exposed in the public UI.");
}

if (errors.length) {
  console.error(`Public launch copy validation failed:\n\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log("Public launch copy validation passed: trust labels, honest framing, dead-control removal and low-data font/image boundaries are present.");
