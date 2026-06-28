import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS, PATHWAY_TYPES, SOURCE_REGISTRY } from "../src/data/careerCatalog.js";
import { evaluatePathwayRisk, rankCareerRoutes, validateGuidanceLanguage } from "../src/lib/scoring.js";
import { SUBJECT_RULES } from "../src/data/subjectRules.js";

const errors = [];
const routeIds = new Set();
const sourceIds = new Set(SOURCE_REGISTRY.map((source) => source.id));
const pathwayTypes = new Set(PATHWAY_TYPES.map((pathway) => pathway.id));
const signalValues = new Set(INTEREST_SIGNALS.map((signal) => signal.value));

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

  if (!Array.isArray(route.qualificationPathways) || route.qualificationPathways.length === 0) {
    errors.push(`Route ${route.id} has no associated qualification pathway family.`);
  }

  for (const qualification of route.qualificationPathways ?? []) {
    if (!qualification.id || !qualification.name || !qualification.type || !qualification.routeType || !qualification.verificationStatus || !qualification.sourceUrl) {
      errors.push(`Route ${route.id} contains an incomplete qualification pathway association.`);
    }
    if (qualification.verificationStatus === "verified" && (!qualification.accessDate || qualification.sourceUrl.includes("required"))) {
      errors.push(`Route ${route.id} marks qualification ${qualification.id} verified without a dated official source.`);
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
  if (!route.evidenceState?.profile || !route.evidenceState?.qualification || !route.evidenceState?.demand || !Array.isArray(route.evidenceState?.verificationRequired)) {
    errors.push(`Route ${route.id} must expose evidence state and verification requirements.`);
  }

  for (const dimension of ["earning", "travel", "stress", "danger"]) {
    const value = route.careerReality?.[dimension];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push(`Route ${route.id} has invalid career reality dimension ${dimension}.`);
    }
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
const ranked = rankCareerRoutes(CAREER_ROUTES, sampleAnswers, [], { earning: 80, travel: 25, stress: 45, danger: 20 });

if (CAREER_ROUTES.length !== 461) {
  errors.push(`Career coverage must account for exactly 461 routes; found ${CAREER_ROUTES.length}.`);
}

if (ranked.length !== CAREER_ROUTES.length) {
  errors.push("Scoring did not return every career route.");
}

if (ranked.some((route) => !Number.isFinite(route.score) || !Number.isFinite(route.matchPercent) || !route.explanation?.confidenceLabel || !route.realityFit?.matchPercent)) {
  errors.push("Scoring produced an invalid score, match percentage, reality fit or explanation.");
}

const engineeringRoute = CAREER_ROUTES.find((route) => route.title === "Civil Engineering Technician");
const engineeringRiskWithoutSubjects = evaluatePathwayRisk(engineeringRoute, [], {}, SUBJECT_RULES);
const engineeringRiskWithSubjects = evaluatePathwayRisk(engineeringRoute, ["Mathematics", "Physical Sciences"], { Mathematics: 70, "Physical Sciences": 68 }, SUBJECT_RULES);
if (engineeringRiskWithoutSubjects.status !== "red") errors.push("Engineering route should flag red when Mathematics and Physical Sciences are absent.");
if (engineeringRiskWithSubjects.status !== "green") errors.push("Engineering route should flag green when Mathematics and Physical Sciences are selected with strong estimated marks.");

if (errors.length) {
  console.error("Career catalog validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Career catalog validation passed for ${CAREER_ROUTES.length} routes, ${DISCOVERY_QUESTIONS.length} questions, ${INTEREST_SIGNALS.length} interest signals, ${PATHWAY_TYPES.length} SA pathway types, ${SOURCE_REGISTRY.length} source records and qualitative earning-potential insights.`);
