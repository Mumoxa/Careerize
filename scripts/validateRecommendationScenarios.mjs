import fs from "node:fs";
import path from "node:path";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "../src/data/careerCatalog.js";
import { DEFAULT_LIFESTYLE_PREFERENCES, rankCareerRoutes } from "../src/lib/scoring.js";

const errors = [];
const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const careAdjacentStreams = new Set(["Health, care and social services", "Education, training and youth development"]);

const routeById = new Map(CAREER_ROUTES.map((route) => [route.id, route]));
const routeIds = new Set(routeById.keys());
const visibleSignals = new Set(INTEREST_SIGNALS.map((signal) => signal.value));
const questionSignals = new Set(DISCOVERY_QUESTIONS.flatMap((question) => question.options.map((option) => option.value)));

function topTitles(results, count = 10) {
  return results.slice(0, count).map((route) => route.title);
}

function topStreams(results, count = 10) {
  return [...new Set(results.slice(0, count).map((route) => route.stream))];
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function rank({ answers = {}, signals = [], preferences = {} }) {
  return rankCareerRoutes(CAREER_ROUTES, answers, signals, {
    ...DEFAULT_LIFESTYLE_PREFERENCES,
    ...preferences,
  });
}

const careHighIncome = rank({
  answers: { day: "helping" },
  signals: ["care"],
  preferences: { earnings: 100 },
});
assert(
  topStreams(careHighIncome, 20).every((stream) => careAdjacentStreams.has(stream)),
  `Care plus high-income scenario should keep care or education-support routes in the top 20; saw ${topStreams(careHighIncome, 20).join(" | ")}.`
);
const financeStream = "Finance, admin and business operations";
assert(
  !topTitles(careHighIncome, 20).some((title, i) =>
    careHighIncome[i]?.stream === financeStream &&
    /account(?!ing teacher)|creditor|debtor|bookkeeper|payroll/i.test(title)
  ),
  `Care plus high-income scenario must not surface finance clerk routes in top 20; saw ${topTitles(careHighIncome, 20).join(" | ")}.`
);

const legacyMoneyWithCare = rank({
  answers: { day: "helping" },
  signals: ["care", "money"],
  preferences: { earnings: 100 },
});
assert(
  topStreams(legacyMoneyWithCare, 20).every((stream) => careAdjacentStreams.has(stream)),
  "Legacy saved 'money' signal must not override caring intent after the high-income slider split."
);

const legacyMoneyOnly = rank({
  signals: ["money"],
  preferences: { earnings: 100 },
});
const highEarningOnly = rank({
  preferences: { earnings: 100 },
});
assert(
  topTitles(legacyMoneyOnly, 25).join("|") === topTitles(highEarningOnly, 25).join("|"),
  "Legacy saved 'money' signal alone must be ignored and behave like the high-earning slider without finance interest."
);

const accountingInterest = rank({
  answers: { school: "numbers" },
  signals: ["accounting"],
  preferences: { earnings: 80 },
});
assert(
  accountingInterest[0]?.stream === "Finance, admin and business operations",
  `Explicit accounting interest should still rank finance/admin routes first; saw ${accountingInterest[0]?.stream}.`
);

const peopleHighIncome = rank({
  answers: { interest: "people" },
  preferences: { earnings: 100 },
});
assert(
  !topStreams(peopleHighIncome, 15).includes("Finance, admin and business operations"),
  `People plus high-income should not imply finance/admin routes; saw ${topStreams(peopleHighIncome, 15).join(" | ")}.`
);

const techHighIncome = rank({
  answers: { school: "technology" },
  signals: ["problemSolving"],
  preferences: { earnings: 100 },
});
assert(
  techHighIncome[0]?.stream === "Technology, data and AI",
  `Technology plus high-income should rank technology routes first; saw ${techHighIncome[0]?.stream}.`
);

const practicalSafety = rank({
  answers: { interest: "handsOn" },
  signals: ["tools"],
  preferences: { danger: 0, stress: 35 },
});
assert(
  practicalSafety.slice(0, 20).every((route) => route.signalScore > 0),
  "Lifestyle sliders must refine practical matches instead of promoting zero-signal routes into the top 20."
);

for (const route of CAREER_ROUTES) {
  for (const similarId of route.similarCareerIds ?? []) {
    assert(routeIds.has(similarId), `Route ${route.id} links to unknown similar career ${similarId}.`);
    assert(similarId !== route.id, `Route ${route.id} links to itself as a similar career.`);
  }

  for (const signal of Object.keys(route.signalWeights ?? {})) {
    assert(
      visibleSignals.has(signal) || questionSignals.has(signal),
      `Route ${route.id} uses signal ${signal}, but no question or interest tag can produce it.`
    );
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function parseCsv(file) {
  const target = path.join(foundationDir, file);
  if (!fs.existsSync(target)) {
    errors.push(`Missing link-integrity file: ${file}`);
    return [];
  }
  const rows = fs.readFileSync(target, "utf8").trim().split(/\r?\n/);
  const header = parseCsvLine(rows[0]);
  return rows.slice(1).map((row) => Object.fromEntries(parseCsvLine(row).map((value, index) => [header[index], value])));
}

for (const file of ["career_qualification_coverage.csv", "career_research_queue.csv", "career_research_team_workplan.csv"]) {
  const rows = parseCsv(file);
  const ids = new Set(rows.map((row) => row.career_id));
  assert(rows.length === CAREER_ROUTES.length, `${file} should contain ${CAREER_ROUTES.length} rows; found ${rows.length}.`);
  for (const routeId of routeIds) assert(ids.has(routeId), `${file} is missing route id ${routeId}.`);
  for (const id of ids) assert(routeIds.has(id), `${file} includes unknown route id ${id}.`);
}

if (errors.length) {
  console.error("Recommendation scenario validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Recommendation scenario validation passed for ${CAREER_ROUTES.length} routes, ${INTEREST_SIGNALS.length} visible interest tags and ${DISCOVERY_QUESTIONS.length} question sets.`);
