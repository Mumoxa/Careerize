import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

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

if (errors.length) {
  console.error(`Public launch copy validation failed:\n\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log("Public launch copy validation passed: trust labels, honest framing, dead-control removal and low-data font/image boundaries are present.");
