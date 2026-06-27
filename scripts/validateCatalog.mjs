import { CAREER_COVERAGE_SUMMARY, CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS, PATHWAY_TYPES, SOURCE_REGISTRY } from "../src/data/careerCatalog.js";
import { rankCareerRoutes, validateGuidanceLanguage } from "../src/lib/scoring.js";

const errors = [];
const routeIds = new Set();
const sourceIds = new Set(SOURCE_REGISTRY.map((source) => source.id));
const pathwayTypes = new Set(PATHWAY_TYPES.map((pathway) => pathway.id));
const signalValues = new Set(INTEREST_SIGNALS.map((signal) => signal.value));

if (CAREER_COVERAGE_SUMMARY.totalRoutes !== CAREER_ROUTES.length) {
  errors.push(`Coverage summary totalRoutes (${CAREER_COVERAGE_SUMMARY.totalRoutes}) does not match generated route count (${CAREER_ROUTES.length}).`);
}

const actualStreamCounts = CAREER_ROUTES.reduce((counts, route) => {
  counts[route.stream] = (counts[route.stream] ?? 0) + 1;
  return counts;
}, {});

for (const [stream, count] of Object.entries(actualStreamCounts)) {
  if (CAREER_COVERAGE_SUMMARY.streamCounts?.[stream] !== count) {
    errors.push(`Coverage summary count for "${stream}" is ${CAREER_COVERAGE_SUMMARY.streamCounts?.[stream] ?? "missing"} but generated ${count}.`);
  }
}

for (const stream of Object.keys(CAREER_COVERAGE_SUMMARY.streamCounts ?? {})) {
  if (!actualStreamCounts[stream]) {
    errors.push(`Coverage summary includes unknown stream "${stream}".`);
  }
}

for (const source of SOURCE_REGISTRY) {
  if (!source.id || !source.title || !source.type || !source.url || !source.accessedAt || !Number.isFinite(source.confidence)) {
    errors.push(`Source ${source.id ?? "unknown"} is missing required source registry fields.`);
  }
}

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
  if (!route.id || !route.title || !route.stream || !route.country || !route.status || !route.lastUpdated) {
    errors.push(`Route ${route.id ?? "unknown"} is missing id, title, stream, country, status or lastUpdated.`);
  }

  if (routeIds.has(route.id)) {
    errors.push(`Duplicate route id found: ${route.id}.`);
  }
  routeIds.add(route.id);

  if (!Number.isFinite(route.dataConfidence) || route.dataConfidence < 0 || route.dataConfidence > 100) {
    errors.push(`Route ${route.id} has invalid dataConfidence.`);
  }

  if (!Array.isArray(route.sourceIds) || route.sourceIds.length === 0) {
    errors.push(`Route ${route.id} must reference at least one source.`);
  } else {
    for (const sourceId of route.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`Route ${route.id} references unknown source: ${sourceId}.`);
      }
    }
  }

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

  for (const listField of ["dayInLife", "keyTasks", "toolExamples", "subjects", "qualifications", "pathways", "misconceptions", "fitWarnings"]) {
    if (!Array.isArray(route[listField]) || route[listField].length === 0) {
      errors.push(`Route ${route.id} must include a non-empty ${listField} array.`);
    }
  }

  for (const pathway of route.pathways ?? []) {
    if (!pathway.type || !pathwayTypes.has(pathway.type) || !pathway.label || !pathway.timeToEntry || !Number.isFinite(pathway.confidence)) {
      errors.push(`Route ${route.id} contains an invalid pathway entry.`);
    }
  }

  if (route.salary) {
    errors.push(`Route ${route.id} must not carry a salary field. Use qualitative earningPotential instead.`);
  }

  if (!route.earningPotential?.status || !route.earningPotential?.label || !route.earningPotential?.explanation) {
    errors.push(`Route ${route.id} must show a qualitative earningPotential insight instead of salary numbers.`);
  }

  if (!route.demand?.status || !route.demand?.explanation) {
    errors.push(`Route ${route.id} must show a clear demand data status instead of unsupported demand claims.`);
  }

  const guidanceText = [route.summary, route.day, route.worst, route.best, route.earningPotential?.label, route.earningPotential?.explanation, ...(route.misconceptions ?? []), ...(route.fitWarnings ?? [])].join(" ");
  const language = validateGuidanceLanguage(guidanceText);
  if (!language.valid) {
    errors.push(`Route ${route.id} uses unsafe guidance language: ${language.reason}`);
  }
}

const sampleAnswers = Object.fromEntries(
  DISCOVERY_QUESTIONS.map((question) => [question.id, question.options[0]?.value]).filter(([, value]) => Boolean(value))
);
const ranked = rankCareerRoutes(CAREER_ROUTES, sampleAnswers, []);

if (ranked.length !== CAREER_ROUTES.length) {
  errors.push("Scoring did not return every career route.");
}

if (ranked.some((route) => !Number.isFinite(route.score) || !Number.isFinite(route.matchPercent) || !route.explanation?.confidenceLabel)) {
  errors.push("Scoring produced an invalid score, match percentage or explanation.");
}

for (const phrase of ["You qualify for this route", "You are eligible for this pathway", "Best route for you", "Recommended career", "Route appears open"]) {
  if (validateGuidanceLanguage(phrase).valid) {
    errors.push(`Guidance language guard failed to reject: ${phrase}`);
  }
}

for (const phrase of ["Possible route to explore", "Needs provider verification", "Requirements vary by provider", "Admission is not guaranteed", "Recommended subjects need provider checks"]) {
  const language = validateGuidanceLanguage(phrase);
  if (!language.valid) {
    errors.push(`Guidance language guard rejected safe copy: ${phrase} (${language.reason})`);
  }
}

if (errors.length) {
  console.error("Career catalog validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Career catalog validation passed for ${CAREER_ROUTES.length} routes, ${DISCOVERY_QUESTIONS.length} questions, ${INTEREST_SIGNALS.length} interest signals, ${PATHWAY_TYPES.length} SA pathway types, ${SOURCE_REGISTRY.length} source records and qualitative earning-potential insights.`);
