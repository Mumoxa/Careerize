import fs from "node:fs";
import path from "node:path";
import { CAREER_COVERAGE_SUMMARY, CAREER_ROUTES, SOURCE_REGISTRY } from "../src/data/careerCatalog.js";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const schemaPath = path.join(root, "supabase", "schema.sql");
const errors = [];

function readRows(file) {
  const target = path.join(foundationDir, file);
  if (!fs.existsSync(target)) {
    errors.push(`Missing production readiness file: ${file}`);
    return [];
  }
  return fs.readFileSync(target, "utf8").trim().split(/\r?\n/);
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
  const rows = readRows(file);
  if (rows.length === 0) return [];
  const header = parseCsvLine(rows[0]);
  return rows.slice(1).map((row) => Object.fromEntries(parseCsvLine(row).map((value, index) => [header[index], value])));
}

const officialSourceIds = new Set([
  "dhet-occupations-high-demand-2024",
  "saqa-nqf-source",
  "qcto-occupational-source",
  "che-accreditation-source",
  "dhet-institution-registers-source",
]);
const sourceIds = new Set(SOURCE_REGISTRY.map((source) => source.id));
for (const sourceId of officialSourceIds) {
  if (!sourceIds.has(sourceId)) errors.push(`Official source registry is missing ${sourceId}.`);
}

if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  for (const requiredTable of [
    "public.careerize_claim_verifications",
    "public.careerize_research_queue",
    "public.careerize_research_team_workplan",
    "careerize_published_claims_require_evidence",
    "careerize_research_team_workplan_requires_reviewers",
    "Careerize published claim verifications public read",
    "Careerize research queue public read",
    "Careerize research team workplan authenticated read",
  ]) {
    if (!schema.includes(requiredTable)) errors.push(`Supabase schema is missing production evidence structure: ${requiredTable}.`);
  }
} else {
  errors.push("Missing Supabase schema.sql for production evidence validation.");
}

if (CAREER_COVERAGE_SUMMARY.totalRoutes !== CAREER_ROUTES.length) {
  errors.push(`Coverage summary totalRoutes ${CAREER_COVERAGE_SUMMARY.totalRoutes} does not match live route count ${CAREER_ROUTES.length}.`);
}

const sourceVerifiedRoutes = CAREER_ROUTES.filter((route) => route.evidenceState?.profile === "source-verified");
if (CAREER_COVERAGE_SUMMARY.sourceVerifiedProfileCount !== sourceVerifiedRoutes.length) {
  errors.push(`sourceVerifiedProfileCount must match source-verified route count; summary says ${CAREER_COVERAGE_SUMMARY.sourceVerifiedProfileCount}, routes show ${sourceVerifiedRoutes.length}.`);
}

for (const route of sourceVerifiedRoutes) {
  if (!route.sourceIds?.some((sourceId) => officialSourceIds.has(sourceId))) {
    errors.push(`Route ${route.id} is marked source-verified without an official source id.`);
  }
}

const routeIds = new Set(CAREER_ROUTES.map((route) => route.id));
const qualificationRows = parseCsv("career_qualification_coverage.csv");
const researchRows = parseCsv("career_research_queue.csv");
const workplanRows = parseCsv("career_research_team_workplan.csv");

for (const [file, rows] of [
  ["career_qualification_coverage.csv", qualificationRows],
  ["career_research_queue.csv", researchRows],
  ["career_research_team_workplan.csv", workplanRows],
]) {
  if (rows.length !== CAREER_ROUTES.length) errors.push(`${file} must contain ${CAREER_ROUTES.length} rows; found ${rows.length}.`);
  const ids = new Set(rows.map((row) => row.career_id));
  for (const routeId of routeIds) {
    if (!ids.has(routeId)) errors.push(`${file} is missing live career id ${routeId}.`);
  }
  for (const id of ids) {
    if (!routeIds.has(id)) errors.push(`${file} contains unknown career id ${id}.`);
  }
}

const researchById = new Map(researchRows.map((row) => [row.career_id, row]));
const allowedPhases = new Set(["phase_1", "phase_2", "phase_3"]);
const allowedStatuses = new Set(["not_started", "in_progress", "evidence_review", "learner_safety_review", "ready_for_profile_update", "blocked"]);
const requiredRoles = new Set([
  "occupation_mapper",
  "qualification_accreditation_researcher",
  "professional_registration_researcher",
  "career_reality_researcher",
  "source_evidence_reviewer",
  "learner_safety_editor",
]);
const seenRoles = new Set();
const seenLanes = new Set();

for (const row of workplanRows) {
  const researchRow = researchById.get(row.career_id);
  if (!researchRow) {
    errors.push(`Research team workplan row ${row.career_id} does not have a matching research queue row.`);
    continue;
  }
  if (row.research_priority !== researchRow.research_priority) {
    errors.push(`Research team workplan row ${row.career_id} has priority ${row.research_priority}, but research queue has ${researchRow.research_priority}.`);
  }
  if (!allowedPhases.has(row.sprint_phase)) errors.push(`Research team workplan row ${row.career_id} has invalid sprint phase ${row.sprint_phase}.`);
  if (!allowedStatuses.has(row.current_status)) errors.push(`Research team workplan row ${row.career_id} has invalid current status ${row.current_status}.`);
  if (!allowedStatuses.has(row.qa_status)) errors.push(`Research team workplan row ${row.career_id} has invalid QA status ${row.qa_status}.`);
  if (row.research_priority === "high" && row.sprint_phase !== "phase_1") {
    errors.push(`High-priority career ${row.career_id} must be assigned to phase_1.`);
  }
  if (!row.research_lane || row.research_lane === "unassigned") errors.push(`Research team workplan row ${row.career_id} is missing a research lane.`);
  if (!row.primary_researcher_role || row.primary_researcher_role === "unassigned") errors.push(`Research team workplan row ${row.career_id} is missing a primary researcher role.`);
  if (row.evidence_reviewer_role !== "source_evidence_reviewer") errors.push(`Research team workplan row ${row.career_id} must use source_evidence_reviewer.`);
  if (row.qa_reviewer_role !== "learner_safety_editor") errors.push(`Research team workplan row ${row.career_id} must use learner_safety_editor.`);
  if (!row.required_output?.includes("claim verification record")) errors.push(`Research team workplan row ${row.career_id} must require a claim verification record.`);
  if (!row.handoff_rule?.includes("source URL") || !row.handoff_rule?.includes("confidence score")) {
    errors.push(`Research team workplan row ${row.career_id} must preserve source URL and confidence score handoff requirements.`);
  }
  seenRoles.add(row.primary_researcher_role);
  seenRoles.add(row.evidence_reviewer_role);
  seenRoles.add(row.qa_reviewer_role);
  seenLanes.add(row.research_lane);
}

for (const role of requiredRoles) {
  if (!seenRoles.has(role)) errors.push(`Research team workplan does not exercise required role ${role}.`);
}

if (seenLanes.size < 15) {
  errors.push(`Research team workplan should cover all 15 research lanes; found ${seenLanes.size}.`);
}

for (const row of researchRows) {
  if (!row.required_sources?.includes("DHET OIHD/OFO") && !row.required_sources?.includes("official occupation source")) {
    errors.push(`Research queue row ${row.career_id} does not require official occupation-source mapping.`);
  }
  if (!row.fields_blocked_until_verified?.includes("salary figures") || !row.fields_blocked_until_verified?.includes("APS/marks")) {
    errors.push(`Research queue row ${row.career_id} does not block salary and APS claims.`);
  }
}

const unsafeSummaryClaims = [
  CAREER_COVERAGE_SUMMARY.status,
  CAREER_COVERAGE_SUMMARY.proofPolicy,
].join(" ").toLowerCase();
if (unsafeSummaryClaims.includes("fully verified") || unsafeSummaryClaims.includes("complete source verified")) {
  errors.push("Coverage summary must not imply complete source verification while the research queue is still active.");
}

if (errors.length) {
  console.error("Production readiness validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Production readiness validation passed for ${CAREER_ROUTES.length} live routes, ${qualificationRows.length} qualification rows, ${researchRows.length} research queue rows, ${workplanRows.length} team workplan rows and ${SOURCE_REGISTRY.length} source records.`);
