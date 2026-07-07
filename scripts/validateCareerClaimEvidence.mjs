import fs from "node:fs";
import path from "node:path";
import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import { readCsv } from "./saFoundationResearchUtils.mjs";

const root = process.cwd();
const evidencePath = path.join(root, "data", "sa-foundation", "career_claim_evidence.csv");
const errors = [];

const REQUIRED_COLUMNS = [
  "evidence_id",
  "career_id",
  "career_title",
  "claim_type",
  "claim_text",
  "source_name",
  "source_type",
  "source_url",
  "access_date",
  "supports_field",
  "verification_status",
  "confidence_score",
  "learner_safe_copy",
  "blocked_fields",
  "review_notes",
];

const ALLOWED_CLAIM_TYPES = new Set([
  "occupation_recognition",
  "high_demand_signpost",
  "critical_skill_signpost",
  "qualification_route",
  "nqf_level",
  "provider_entry_requirement",
  "professional_registration",
  "subject_requirement",
  "workplace_learning_route",
  "tools_and_tasks",
  "career_progression",
  "geographic_demand",
  "salary",
  "source_limitation",
]);

const ALLOWED_SOURCE_TYPES = new Set([
  "official_government",
  "official_register",
  "quality_council",
  "professional_body",
  "sector_body",
  "provider_source",
  "vendor",
  "internal_methodology",
  "research_archive",
]);

const ALLOWED_STATUSES = new Set([
  "verified",
  "source_found_needs_review",
  "varies_by_provider",
  "not_publicly_confirmed",
  "needs_manual_verification",
  "unsupported_do_not_publish",
  "retired_or_discontinued",
  "replaced_by_current_route",
]);

const INTERNAL_BLOCKED_CLAIMS = new Set([
  "high_demand_signpost",
  "critical_skill_signpost",
  "qualification_route",
  "nqf_level",
  "provider_entry_requirement",
  "professional_registration",
  "subject_requirement",
  "geographic_demand",
  "salary",
]);

if (!fs.existsSync(evidencePath)) {
  console.error(`Career claim evidence validation failed:\n\n- Missing evidence file: ${path.relative(root, evidencePath)}`);
  process.exit(1);
}

const rows = readCsv(evidencePath);
const routeById = new Map(CAREER_ROUTES.map((route) => [route.id, route]));
const evidenceIds = new Set();
const routeCoverage = new Map(CAREER_ROUTES.map((route) => [route.id, { total: 0, sourceLimitation: 0, occupationRecognition: 0 }]));

if (rows.length === 0) {
  errors.push("career_claim_evidence.csv must contain at least one evidence row.");
}

for (const [index, row] of rows.entries()) {
  const rowNumber = index + 2;

  for (const column of REQUIRED_COLUMNS) {
    if (!Object.hasOwn(row, column)) {
      errors.push(`Row ${rowNumber} is missing required column ${column}.`);
    } else if (String(row[column] ?? "").trim() === "" && column !== "review_notes") {
      errors.push(`Row ${rowNumber} has an empty ${column}.`);
    }
  }

  if (evidenceIds.has(row.evidence_id)) {
    errors.push(`Row ${rowNumber} duplicates evidence_id ${row.evidence_id}.`);
  }
  evidenceIds.add(row.evidence_id);

  if (!routeById.has(row.career_id)) {
    errors.push(`Row ${rowNumber} references unknown career_id ${row.career_id}.`);
  } else {
    const route = routeById.get(row.career_id);
    if (row.career_title !== route.title) {
      errors.push(`Row ${rowNumber} career_title "${row.career_title}" does not match live title "${route.title}".`);
    }
    const coverage = routeCoverage.get(row.career_id);
    coverage.total += 1;
    if (row.claim_type === "source_limitation") coverage.sourceLimitation += 1;
    if (row.claim_type === "occupation_recognition") coverage.occupationRecognition += 1;
  }

  if (!ALLOWED_CLAIM_TYPES.has(row.claim_type)) {
    errors.push(`Row ${rowNumber} has invalid claim_type ${row.claim_type}.`);
  }

  if (!ALLOWED_SOURCE_TYPES.has(row.source_type)) {
    errors.push(`Row ${rowNumber} has invalid source_type ${row.source_type}.`);
  }

  if (!ALLOWED_STATUSES.has(row.verification_status)) {
    errors.push(`Row ${rowNumber} has invalid verification_status ${row.verification_status}.`);
  }

  const confidence = Number(row.confidence_score);
  if (!Number.isInteger(confidence) || confidence < 0 || confidence > 100) {
    errors.push(`Row ${rowNumber} has invalid confidence_score ${row.confidence_score}.`);
  }

  if (row.verification_status === "verified" && confidence < 75) {
    errors.push(`Row ${rowNumber} is verified but confidence_score is below 75.`);
  }

  if (row.source_type === "internal_methodology" && INTERNAL_BLOCKED_CLAIMS.has(row.claim_type) && row.verification_status === "verified") {
    errors.push(`Row ${rowNumber} uses internal_methodology to verify blocked claim type ${row.claim_type}.`);
  }

  if (row.claim_type === "provider_entry_requirement") {
    const allowedProviderStatuses = new Set(["source_found_needs_review", "varies_by_provider", "not_publicly_confirmed", "needs_manual_verification"]);
    if (row.source_type !== "provider_source" && !allowedProviderStatuses.has(row.verification_status)) {
      errors.push(`Row ${rowNumber} provider entry claim must use provider_source or remain unpromoted.`);
    }
  }

  if (row.claim_type === "salary" && row.verification_status !== "unsupported_do_not_publish") {
    errors.push(`Row ${rowNumber} salary evidence must remain unsupported_do_not_publish until a salary-policy spec exists.`);
  }

  const sourceUrl = String(row.source_url);
  const allowedRepoPath = sourceUrl.startsWith("docs/") || sourceUrl.startsWith("data/sa-foundation/");
  if (!sourceUrl.startsWith("http") && !allowedRepoPath) {
    errors.push(`Row ${rowNumber} source_url must be an http(s) URL or an allowed repo evidence path.`);
  }

  if (sourceUrl.startsWith("data/sa-foundation/") && row.source_type !== "research_archive") {
    errors.push(`Row ${rowNumber} uses a repo data path but is not marked as research_archive.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.access_date)) {
    errors.push(`Row ${rowNumber} access_date must use YYYY-MM-DD format.`);
  }

  if (row.verification_status === "verified" && row.blocked_fields.toLowerCase().includes("none") && row.claim_type !== "occupation_recognition") {
    errors.push(`Row ${rowNumber} verified non-occupation claim must still state blocked fields explicitly.`);
  }
}

for (const [careerId, coverage] of routeCoverage.entries()) {
  if (coverage.total === 0) {
    errors.push(`Missing all evidence rows for live career ${careerId}.`);
  }
  if (coverage.sourceLimitation === 0) {
    errors.push(`Live career ${careerId} is missing a source_limitation row.`);
  }
  if (coverage.occupationRecognition === 0) {
    errors.push(`Live career ${careerId} is missing an occupation_recognition row.`);
  }
}

if (errors.length) {
  console.error("Career claim evidence validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const verifiedRows = rows.filter((row) => row.verification_status === "verified");
const blockedRows = rows.filter((row) => row.verification_status === "unsupported_do_not_publish");

console.log(`Career claim evidence validation passed for ${rows.length} evidence rows across ${CAREER_ROUTES.length} live careers (${verifiedRows.length} verified rows, ${blockedRows.length} unsupported-do-not-publish rows).`);
