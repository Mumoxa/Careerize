import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "../src/data/careerCatalog.js";
import { rankCareerRoutes } from "../src/lib/scoring.js";

const errors = [];
const routeIds = new Set();
const signalValues = new Set(INTEREST_SIGNALS.map((signal) => signal.value));

for (const question of DISCOVERY_QUESTIONS) {
  if (!question.id || !question.label || !Array.isArray(question.options) || question.options.length === 0) {
    errors.push(`Question ${question.id ?? "unknown"} is missing required fields.`);
    continue;
  }

  for (const option of question.options) {
    if (!option.value || !option.label) {
      errors.push(`Question ${question.id} contains an option with a missing value or label.`);
    }
    signalValues.add(option.value);
  }
}

for (const route of CAREER_ROUTES) {
  if (!route.id || !route.title || !route.stream) {
    errors.push(`Route ${route.id ?? "unknown"} is missing id, title or stream.`);
  }

  if (routeIds.has(route.id)) {
    errors.push(`Duplicate route id found: ${route.id}.`);
  }
  routeIds.add(route.id);

  const weights = route.signalWeights ?? {};
  const weightEntries = Object.entries(weights);

  if (weightEntries.length === 0) {
    errors.push(`Route ${route.id} has no signal weights.`);
  }

  for (const [signal, weight] of weightEntries) {
    if (!signalValues.has(signal)) {
      errors.push(`Route ${route.id} uses unknown signal: ${signal}.`);
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      errors.push(`Route ${route.id} has invalid weight for ${signal}: ${weight}.`);
    }
  }

  for (const field of ["summary", "day", "tools", "environment", "stress", "remote", "growth", "worst", "best"]) {
    if (!route[field]) {
      errors.push(`Route ${route.id} is missing required display field: ${field}.`);
    }
  }

  if (route.researchBasis !== undefined) {
    if (!Array.isArray(route.researchBasis) || route.researchBasis.length === 0) {
      errors.push(`Route ${route.id} researchBasis must be a non-empty array when provided.`);
    } else {
      for (const source of route.researchBasis) {
        if (!source.label || !source.url || !URL.canParse(source.url)) {
          errors.push(`Route ${route.id} has an invalid research source.`);
        }
      }
    }
  }
}

const sampleAnswers = Object.fromEntries(
  DISCOVERY_QUESTIONS.map((question) => [question.id, question.options[0]?.value]).filter(([, value]) => Boolean(value))
);
const ranked = rankCareerRoutes(CAREER_ROUTES, sampleAnswers, []);

if (ranked.length !== CAREER_ROUTES.length) {
  errors.push("Scoring did not return every career route.");
}

if (ranked.some((route) => !Number.isFinite(route.score) || !Number.isFinite(route.matchPercent))) {
  errors.push("Scoring produced a non-numeric score or match percentage.");
}

if (errors.length) {
  console.error("Career catalog validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Career catalog validation passed for ${CAREER_ROUTES.length} routes, ${DISCOVERY_QUESTIONS.length} questions and ${INTEREST_SIGNALS.length} interest signals.`);
