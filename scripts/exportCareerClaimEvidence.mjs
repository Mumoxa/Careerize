import path from "node:path";
import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import { MASTER_CAREER_LIST } from "../src/data/masterCareerList.js";
import { readCsv, slugify, splitList, writeCsv } from "./saFoundationResearchUtils.mjs";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const outputPath = path.join(foundationDir, "career_claim_evidence.csv");

const ACCESS_DATE = "2026-07-07";
const BLOCKED_FIELDS = "salary figures | APS/marks | provider-specific entry requirements | province-level demand | accreditation status | guaranteed employment outcomes";

const COLUMNS = [
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

const masterByTitle = new Map(MASTER_CAREER_LIST.map((career) => [career.title, career]));
const researchLinks = readCsv(path.join(foundationDir, "careerize_sa_starter_route_research_links.csv"));
const canonicalCareers = readCsv(path.join(foundationDir, "careerize_sa_research_canonical_careers.csv"));
const linkByRouteId = new Map(researchLinks.map((row) => [row.starter_route_id, row]));
const canonicalById = new Map(canonicalCareers.map((row) => [row.canonical_career_id, row]));

function makeEvidenceId(careerId, claimType, suffix = "") {
  return [careerId, claimType, suffix].filter(Boolean).map(slugify).join("__");
}

function firstDirectCanonical(linkRow) {
  const [firstId] = splitList(linkRow?.direct_canonical_career_ids ?? "");
  return firstId ? canonicalById.get(firstId) : null;
}

function directSourceLinks(canonical) {
  return splitList(canonical?.source_links_pool ?? "");
}

function extractUrl(value) {
  const match = String(value ?? "").match(/https?:\/\/\S+/i);
  return match ? match[0].replace(/[),.;]+$/, "") : "";
}

function hasDhetHighDemandEvidence(canonical) {
  const text = [
    canonical?.classification,
    canonical?.current_sa_demand_evidence,
    canonical?.source_links_pool,
    canonical?.source_quality_rating,
  ].join(" ");
  return /occupations? in high demand|oihd|50510gen2414|dhet 2024 national list/i.test(text);
}

function hasCriticalSkillEvidence(canonical) {
  const text = [
    canonical?.classification,
    canonical?.current_sa_demand_evidence,
    canonical?.source_links_pool,
    canonical?.source_quality_rating,
  ].join(" ");
  return /critical skills|scarce skill|47182gon2334|critical-skills/i.test(text);
}

function professionalBodySource(canonical) {
  const links = directSourceLinks(canonical).map(extractUrl).filter(Boolean);
  const professional = links.find((url) => /ecsa|sanc|hpcsa|saica|actuarialsociety|lssa|legalpracticecouncil|sacplan|sacapsa|sacssp|sacqsp/i.test(url));
  return professional ?? "";
}

function officialSourceForDemand(canonical) {
  const links = directSourceLinks(canonical).map(extractUrl).filter(Boolean);
  return links.find((url) => /50510gen2414|occupations?%20in%20high%20demand|oihd/i.test(url)) ??
    "https://www.gov.za/sites/default/files/gcis_document/202404/50510gen2414.pdf";
}

function sourceQualityConfidence(canonical, fallback = 50) {
  const score = Number.parseInt(canonical?.confidence_score, 10);
  if (Number.isInteger(score)) return Math.min(70, Math.max(25, score * 15));
  return fallback;
}

function baseRow(route, claimType, suffix = "") {
  return {
    evidence_id: makeEvidenceId(route.id, claimType, suffix),
    career_id: route.id,
    career_title: route.title,
    claim_type: claimType,
    claim_text: "",
    source_name: "",
    source_type: "",
    source_url: "",
    access_date: ACCESS_DATE,
    supports_field: "",
    verification_status: "",
    confidence_score: "",
    learner_safe_copy: "",
    blocked_fields: BLOCKED_FIELDS,
    review_notes: "",
  };
}

function occupationRecognitionRow(route) {
  const master = masterByTitle.get(route.title);
  return {
    ...baseRow(route, "occupation_recognition"),
    claim_text: master?.ofoCode
      ? `${route.title} is mapped in Careerize to DHET OFO 2021 code ${master.ofoCode}.`
      : `${route.title} is present in the Careerize live route catalogue but needs OFO code review.`,
    source_name: "DHET Organising Framework for Occupations 2021",
    source_type: "official_government",
    source_url: "https://www.dhet.gov.za/SitePages/OFO.aspx",
    supports_field: "occupation title | occupation code | occupation recognition",
    verification_status: master?.ofoCode ? "verified" : "source_found_needs_review",
    confidence_score: master?.ofoCode ? "85" : "50",
    learner_safe_copy: master?.ofoCode
      ? `${route.title} has an OFO occupation-code mapping. This supports occupation recognition, not salary, provider entry or employment guarantees.`
      : `${route.title} is in the route catalogue, but its occupation-code mapping still needs review before stronger claims are shown.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: master?.sourceRef ?? "OFO mapping not found in MASTER_CAREER_LIST by exact title.",
  };
}

function sourceLimitationRow(route, linkRow) {
  const coverageStatus = linkRow?.coverage_status ?? "no_research_link";
  return {
    ...baseRow(route, "source_limitation"),
    claim_text: `${route.title} remains blocked for exact salary, APS, provider-entry, accreditation and province-level demand claims until source-specific evidence rows are added.`,
    source_name: "Careerize source-verification policy",
    source_type: "internal_methodology",
    source_url: "docs/superpowers/specs/2026-07-07-source-verified-career-data-design.md",
    supports_field: "blocked fields | learner-safe caveat | verification workflow",
    verification_status: "unsupported_do_not_publish",
    confidence_score: "0",
    learner_safe_copy: `Use ${route.title} as an exploration route only where exact provider, salary, APS, accreditation or local-demand details have not been verified.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: `Research-link coverage status: ${coverageStatus}.`,
  };
}

function researchArchiveRow(route, canonical, linkRow) {
  const sourceUrl = directSourceLinks(canonical).map(extractUrl).find(Boolean) ??
    "data/sa-foundation/careerize_sa_research_canonical_careers.csv";
  return {
    ...baseRow(route, "tools_and_tasks", canonical.canonical_career_id),
    claim_text: [
      canonical.plain_english_career_description,
      canonical.typical_day,
      canonical.tools_technologies_used ? `Tools: ${canonical.tools_technologies_used}.` : "",
    ].filter(Boolean).join(" "),
    source_name: "Careerize imported research archive canonical career row",
    source_type: "research_archive",
    source_url: sourceUrl,
    supports_field: "career reality draft | tasks draft | tools draft",
    verification_status: "source_found_needs_review",
    confidence_score: String(sourceQualityConfidence(canonical)),
    learner_safe_copy: canonical.plain_english_career_description || `${route.title} has a linked research archive row that needs evidence review before publication.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: `Linked through ${linkRow.coverage_status}; canonical career ${canonical.canonical_career_id}. Archive rows are working data and do not automatically publish factual claims.`,
  };
}

function highDemandRow(route, canonical) {
  return {
    ...baseRow(route, "high_demand_signpost", canonical.canonical_career_id),
    claim_text: canonical.current_sa_demand_evidence,
    source_name: "DHET 2024 National List of Occupations in High Demand",
    source_type: "official_government",
    source_url: officialSourceForDemand(canonical),
    supports_field: "demand signpost | post-school planning evidence",
    verification_status: "verified",
    confidence_score: "75",
    learner_safe_copy: `${route.title} has a linked DHET high-demand evidence signpost. This does not guarantee employment and does not verify salary, APS, provider entry or provincial demand.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: `Promoted only as a high-demand signpost from direct canonical research row ${canonical.canonical_career_id}.`,
  };
}

function criticalSkillRow(route, canonical) {
  const sourceUrl = directSourceLinks(canonical).map(extractUrl).find((url) => /critical|47182gon2334/i.test(url)) ??
    "https://www.dhet.gov.za/Planning%20Monitoring%20and%20Evaluation%20Coordination/2022%20Technical%20Report%20Finalisation%20of%20the%20Critical%20Skills%20List.pdf";
  return {
    ...baseRow(route, "critical_skill_signpost", canonical.canonical_career_id),
    claim_text: canonical.current_sa_demand_evidence || canonical.classification,
    source_name: "DHET Critical Skills evidence",
    source_type: "official_government",
    source_url: sourceUrl,
    supports_field: "critical or scarce skill signpost",
    verification_status: "verified",
    confidence_score: "75",
    learner_safe_copy: `${route.title} has a linked scarce or critical-skill evidence signpost. This does not verify exact provider entry, salary or employment outcomes.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: `Promoted only as a critical-skill signpost from direct canonical research row ${canonical.canonical_career_id}.`,
  };
}

function professionalRegistrationRow(route, canonical, sourceUrl) {
  return {
    ...baseRow(route, "professional_registration", canonical.canonical_career_id),
    claim_text: canonical.professional_registration_required,
    source_name: "Relevant professional-body source from research archive",
    source_type: "professional_body",
    source_url: sourceUrl,
    supports_field: "professional registration signpost",
    verification_status: "source_found_needs_review",
    confidence_score: "50",
    learner_safe_copy: `${route.title} may involve a professional-body or statutory-registration pathway. Verify the exact category and requirements with the professional body before advising a learner.`,
    blocked_fields: BLOCKED_FIELDS,
    review_notes: `Professional body URL detected in direct canonical research row ${canonical.canonical_career_id}; manual review still required before verified publication.`,
  };
}

const rows = [];

for (const route of CAREER_ROUTES) {
  const linkRow = linkByRouteId.get(route.id);
  const canonical = firstDirectCanonical(linkRow);

  rows.push(occupationRecognitionRow(route));
  rows.push(sourceLimitationRow(route, linkRow));

  if (canonical) {
    rows.push(researchArchiveRow(route, canonical, linkRow));

    if (hasDhetHighDemandEvidence(canonical)) {
      rows.push(highDemandRow(route, canonical));
    }

    if (hasCriticalSkillEvidence(canonical)) {
      rows.push(criticalSkillRow(route, canonical));
    }

    const registrationSource = professionalBodySource(canonical);
    if (registrationSource && !/^not confirmed/i.test(canonical.professional_registration_required ?? "")) {
      rows.push(professionalRegistrationRow(route, canonical, registrationSource));
    }
  }
}

writeCsv(outputPath, rows, COLUMNS);

const routeCount = new Set(rows.map((row) => row.career_id)).size;
const verifiedCount = rows.filter((row) => row.verification_status === "verified").length;
console.log(`Exported ${rows.length} career claim evidence rows covering ${routeCount} live careers to ${outputPath}. Verified rows: ${verifiedCount}.`);
