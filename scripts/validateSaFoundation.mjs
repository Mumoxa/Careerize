import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readCsv } from "./saFoundationResearchUtils.mjs";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const requiredFiles = [
  "README.md",
  "careerize_sa_repository_manifest.csv",
  "careerize_sa_top100_build_queue.csv",
  "careerize_sa_graph_summary.csv",
  "careerize_sa_research_archive_manifest.csv",
  "careerize_sa_research_raw_master.csv",
  "careerize_sa_research_canonical_careers.csv",
  "careerize_sa_research_duplicate_groups.csv",
  "careerize_sa_research_alignment.csv",
  "careerize_sa_research_reality_profiles.csv",
  "careerize_sa_starter_route_research_links.csv",
  "careerize_sa_starter_route_research_gaps.csv",
  "careerize_sa_top100_research_gaps.csv",
  "careerize_sa_research_graph_nodes.csv",
  "careerize_sa_research_graph_edges.csv",
  "careerize_sa_research_graph_summary.csv",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

function parseCount(value) {
  const count = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(count) ? count : 0;
}

function ensureFile(fileName) {
  const target = path.join(foundationDir, fileName);
  if (!fs.existsSync(target)) {
    fail(`Missing foundation file: ${fileName}`);
    return null;
  }

  const stat = fs.statSync(target);
  if (stat.size === 0) {
    fail(`Foundation file is empty: ${fileName}`);
    return null;
  }

  return target;
}

if (!fs.existsSync(foundationDir)) {
  fail("Missing data/sa-foundation directory.");
}

for (const file of requiredFiles) {
  ensureFile(file);
}

function readText(fileName) {
  return fs.readFileSync(path.join(foundationDir, fileName), "utf8");
}

const manifestPath = ensureFile("careerize_sa_repository_manifest.csv");
if (manifestPath) {
  const manifest = readText("careerize_sa_repository_manifest.csv");
  const requiredManifestItems = [
    "careerize_sa_oihd_350_seed.csv",
    "careerize_sa_graph_nodes.csv",
    "careerize_sa_graph_edges.csv",
    "careerize_sa_qualification_pathway_matrix.csv",
    "careerize_sa_top100_build_queue.csv",
    "careerize_sa_salary_verification_tracker.csv",
  ];
  for (const item of requiredManifestItems) {
    if (!manifest.includes(item)) {
      fail(`Foundation manifest does not reference expected workspace file: ${item}`);
    }
  }
}

const top100Path = ensureFile("careerize_sa_top100_build_queue.csv");
if (top100Path) {
  const rows = readText("careerize_sa_top100_build_queue.csv").trim().split(/\r?\n/);
  if (rows.length !== 101) {
    fail(`Top 100 build queue should contain 100 records plus header; found ${rows.length - 1}.`);
  }
  if (!rows[0].includes("priority_rank,career_title,cluster,current_repo_status,next_action")) {
    fail("Top 100 build queue header is not the expected schema.");
  }
}

const legacyGraphSummaryPath = ensureFile("careerize_sa_graph_summary.csv");
if (legacyGraphSummaryPath) {
  const graphSummary = readText("careerize_sa_graph_summary.csv");
  for (const item of ["node_type,career,43", "node_type,oihd_occupation,350", "edge_type,qualifies_for,64"]) {
    if (!graphSummary.includes(item)) {
      fail(`Graph summary missing expected count: ${item}`);
    }
  }
}

const researchArchiveManifestPath = ensureFile("careerize_sa_research_archive_manifest.csv");
if (researchArchiveManifestPath) {
  const archiveManifestRows = readCsv(researchArchiveManifestPath);
  for (const expectedRow of [
    "sa_career_database_batch_001_seed.csv",
    "career_research/output/sa_career_database_batch_008_250_future_2030_watchlist.csv",
    "career_research/output/sa_career_database_batch_009_250_enriched_scarce_high_demand.csv",
    "SOUTH_AFRICA_CAREER_DATABASE_MASTER_DOCUMENT.md",
  ]) {
    if (!archiveManifestRows.some((row) => row.archive_path === expectedRow)) {
      fail(`Research archive manifest does not include ${expectedRow}.`);
    }
  }
}

const rawMasterPath = ensureFile("careerize_sa_research_raw_master.csv");
const canonicalPath = ensureFile("careerize_sa_research_canonical_careers.csv");
const duplicateGroupsPath = ensureFile("careerize_sa_research_duplicate_groups.csv");
const alignmentPath = ensureFile("careerize_sa_research_alignment.csv");
const realityProfilesPath = ensureFile("careerize_sa_research_reality_profiles.csv");
const starterRouteLinksPath = ensureFile("careerize_sa_starter_route_research_links.csv");
const starterRouteGapsPath = ensureFile("careerize_sa_starter_route_research_gaps.csv");
const top100GapsPath = ensureFile("careerize_sa_top100_research_gaps.csv");
const graphNodesPath = ensureFile("careerize_sa_research_graph_nodes.csv");
const graphEdgesPath = ensureFile("careerize_sa_research_graph_edges.csv");
const graphSummaryPath = ensureFile("careerize_sa_research_graph_summary.csv");

const [catalogModule] = await Promise.all([
  import(pathToFileURL(path.join(root, "src", "data", "careerCatalog.js")).href),
]);

if (rawMasterPath && canonicalPath && duplicateGroupsPath && alignmentPath && realityProfilesPath && starterRouteLinksPath && starterRouteGapsPath && top100GapsPath && graphNodesPath && graphEdgesPath && graphSummaryPath) {
  const rawMasterRows = readCsv(rawMasterPath);
  const canonicalRows = readCsv(canonicalPath);
  const duplicateGroupRows = readCsv(duplicateGroupsPath);
  const alignmentRows = readCsv(alignmentPath);
  const realityProfileRows = readCsv(realityProfilesPath);
  const starterRouteLinkRows = readCsv(starterRouteLinksPath);
  const starterRouteGapRows = readCsv(starterRouteGapsPath);
  const top100GapRows = readCsv(top100GapsPath);
  const graphNodes = readCsv(graphNodesPath);
  const graphEdges = readCsv(graphEdgesPath);
  const graphSummaryRows = readCsv(graphSummaryPath);

  const rawIds = new Set(rawMasterRows.map((row) => row.career_id));
  if (rawIds.size !== rawMasterRows.length) {
    fail("Research raw master contains duplicate career_id values.");
  }
  if (rawMasterRows.length !== 1775) {
    fail(`Research raw master should contain 1775 source-backed records; found ${rawMasterRows.length}.`);
  }

  const enrichedRawRows = rawMasterRows.filter((row) => row.has_batch_009_enrichment === "yes");
  if (enrichedRawRows.length !== 250) {
    fail(`Research raw master should retain 250 Batch 009-enriched records; found ${enrichedRawRows.length}.`);
  }

  const canonicalIds = new Set(canonicalRows.map((row) => row.canonical_career_id));
  if (canonicalIds.size !== canonicalRows.length) {
    fail("Canonical research careers contain duplicate canonical_career_id values.");
  }

  const normalizedTitles = new Set(rawMasterRows.map((row) => row.normalized_career_name));
  if (canonicalRows.length !== normalizedTitles.size) {
    fail(`Canonical research careers should match the unique normalized title count (${normalizedTitles.size}); found ${canonicalRows.length}.`);
  }

  if (canonicalRows.length >= rawMasterRows.length) {
    fail("Canonical research careers should be smaller than the raw research master because duplicate title groups must collapse.");
  }

  const duplicateGroupCount = [...normalizedTitles].filter(
    (title) => rawMasterRows.filter((row) => row.normalized_career_name === title).length > 1
  ).length;
  if (duplicateGroupRows.length !== duplicateGroupCount) {
    fail(`Duplicate-group export should contain ${duplicateGroupCount} duplicate title groups; found ${duplicateGroupRows.length}.`);
  }

  if (alignmentRows.length !== canonicalRows.length) {
    fail(`Research alignment should contain one row per canonical career; expected ${canonicalRows.length}, found ${alignmentRows.length}.`);
  }

  const missingAlignmentLinks = alignmentRows.filter(
    (row) => !row.starter_stream || !row.pathway_template_kind || !row.pathway_template_profile || !row.pathway_plan_id
  );
  if (missingAlignmentLinks.length > 0) {
    fail(`Research alignment contains ${missingAlignmentLinks.length} rows without stream or pathway linkage.`);
  }

  if (realityProfileRows.length !== canonicalRows.length) {
    fail(`Research reality profiles should contain one row per canonical career; expected ${canonicalRows.length}, found ${realityProfileRows.length}.`);
  }

  const realityProfileIds = new Set(realityProfileRows.map((row) => row.canonical_career_id));
  if (realityProfileIds.size !== realityProfileRows.length) {
    fail("Research reality profiles contain duplicate canonical_career_id values.");
  }

  const invalidRealityScores = realityProfileRows.filter((row) =>
    ["earnings_signal_score", "travel_signal_score", "stress_signal_score", "danger_signal_score"].some((field) => {
      const value = Number.parseFloat(row[field]);
      return !Number.isFinite(value) || value < 0 || value > 100;
    })
  );
  if (invalidRealityScores.length > 0) {
    fail(`Research reality profiles contain ${invalidRealityScores.length} invalid score rows.`);
  }

  if (starterRouteLinkRows.length !== catalogModule.CAREER_ROUTES.length) {
    fail(`Starter-route research links should contain one row per starter route; expected ${catalogModule.CAREER_ROUTES.length}, found ${starterRouteLinkRows.length}.`);
  }

  const starterRouteIds = new Set(starterRouteLinkRows.map((row) => row.starter_route_id));
  if (starterRouteIds.size !== starterRouteLinkRows.length) {
    fail("Starter-route research links contain duplicate starter_route_id values.");
  }

  const invalidCoverageRows = starterRouteLinkRows.filter((row) => !["direct_match", "suggestion_only", "manual_curated_link", "no_research_link"].includes(row.coverage_status));
  if (invalidCoverageRows.length > 0) {
    fail(`Starter-route research links contain ${invalidCoverageRows.length} rows with invalid coverage_status values.`);
  }

  const inconsistentManualCuratedRows = starterRouteLinkRows.filter((row) => {
    const directCount = parseCount(row.direct_canonical_career_count);
    const suggestedCount = parseCount(row.suggested_canonical_career_count);
    const manualCount = parseCount(row.manual_curated_canonical_career_count);

    if (row.coverage_status === "manual_curated_link") {
      return directCount !== 0 || suggestedCount !== 0 || manualCount === 0 || row.research_reality_profile_available !== "yes";
    }

    if (row.coverage_status === "no_research_link") {
      return directCount !== 0 || suggestedCount !== 0 || manualCount !== 0 || row.research_reality_profile_available !== "no";
    }

    return false;
  });
  if (inconsistentManualCuratedRows.length > 0) {
    fail(`Starter-route research links contain ${inconsistentManualCuratedRows.length} rows with inconsistent curated-link or no-link counts.`);
  }

  const expectedStarterRouteGaps = starterRouteLinkRows.filter((row) => row.coverage_status === "no_research_link").length;
  if (starterRouteGapRows.length !== expectedStarterRouteGaps) {
    fail(`Starter-route research gaps should contain ${expectedStarterRouteGaps} uncovered starter routes; found ${starterRouteGapRows.length}.`);
  }

  const nodeCounts = graphNodes.reduce((counts, node) => {
    counts[node.node_type] = (counts[node.node_type] ?? 0) + 1;
    return counts;
  }, {});
  const edgeCounts = graphEdges.reduce((counts, edge) => {
    counts[edge.edge_type] = (counts[edge.edge_type] ?? 0) + 1;
    return counts;
  }, {});

  if ((nodeCounts.canonical_career ?? 0) !== canonicalRows.length) {
    fail(`Research graph should contain ${canonicalRows.length} canonical career nodes; found ${nodeCounts.canonical_career ?? 0}.`);
  }

  if ((nodeCounts.starter_route ?? 0) !== catalogModule.CAREER_ROUTES.length) {
    fail(`Research graph should include all ${catalogModule.CAREER_ROUTES.length} starter-route nodes; found ${nodeCounts.starter_route ?? 0}.`);
  }

  if ((edgeCounts.mapped_to_starter_stream ?? 0) !== canonicalRows.length) {
    fail(`Research graph should map every canonical career to a starter stream; found ${edgeCounts.mapped_to_starter_stream ?? 0} edges.`);
  }

  if ((edgeCounts.uses_pathway_template ?? 0) !== canonicalRows.length) {
    fail(`Research graph should map every canonical career to a pathway template; found ${edgeCounts.uses_pathway_template ?? 0} edges.`);
  }

  const directRouteMatches = alignmentRows.filter((row) => row.matched_starter_route_id).length;
  if ((edgeCounts.aligned_to_starter_route ?? 0) !== directRouteMatches) {
    fail(`Direct starter-route alignment edges should match the alignment export (${directRouteMatches}); found ${edgeCounts.aligned_to_starter_route ?? 0}.`);
  }

  const queuedForEnrichmentRows = alignmentRows.filter((row) => row.top100_priority_rank);
  if ((edgeCounts.queued_for_enrichment ?? 0) !== queuedForEnrichmentRows.length) {
    fail(`Top 100 queue edges should match aligned queue links (${queuedForEnrichmentRows.length}); found ${edgeCounts.queued_for_enrichment ?? 0}.`);
  }

  const uniqueQueuedRanks = new Set(queuedForEnrichmentRows.map((row) => row.top100_priority_rank));
  const expectedTop100Gaps = 100 - uniqueQueuedRanks.size;
  if (top100GapRows.length !== expectedTop100Gaps) {
    fail(`Top 100 gap export should contain ${expectedTop100Gaps} unresolved queue items; found ${top100GapRows.length}.`);
  }

  const enrichedCanonicalRows = canonicalRows.filter((row) => row.has_batch_009_enrichment === "yes").length;
  if ((edgeCounts.enriched_in_batch_009 ?? 0) !== enrichedCanonicalRows) {
    fail(`Batch 009 enrichment edges should match enriched canonical careers (${enrichedCanonicalRows}); found ${edgeCounts.enriched_in_batch_009 ?? 0}.`);
  }

  const graphSummaryLookup = new Map(
    graphSummaryRows.map((row) => [`${row.summary_type}:${row.name}`, Number.parseInt(row.count, 10)])
  );
  for (const [type, count] of Object.entries(nodeCounts)) {
    if (graphSummaryLookup.get(`node_type:${type}`) !== count) {
      fail(`Research graph summary count mismatch for node_type:${type}.`);
    }
  }
  for (const [type, count] of Object.entries(edgeCounts)) {
    if (graphSummaryLookup.get(`edge_type:${type}`) !== count) {
      fail(`Research graph summary count mismatch for edge_type:${type}.`);
    }
  }

  if (graphSummaryLookup.get("dataset:raw_research_records") !== rawMasterRows.length) {
    fail("Research graph summary raw record count does not match the raw master export.");
  }
  if (graphSummaryLookup.get("dataset:canonical_careers") !== canonicalRows.length) {
    fail("Research graph summary canonical career count does not match the canonical export.");
  }
  if (graphSummaryLookup.get("dataset:research_reality_profiles") !== realityProfileRows.length) {
    fail("Research graph summary reality profile count does not match the reality-profile export.");
  }
  if (graphSummaryLookup.get("dataset:top100_linked_careers") !== queuedForEnrichmentRows.length) {
    fail("Research graph summary Top 100 linked-career count does not match the alignment export.");
  }
  if (graphSummaryLookup.get("dataset:starter_routes_with_direct_research_alignment") !== starterRouteLinkRows.filter((row) => row.coverage_status === "direct_match").length) {
    fail("Research graph summary direct starter-route count does not match the starter-route coverage export.");
  }
  if (graphSummaryLookup.get("dataset:starter_routes_with_any_research_link") !== starterRouteLinkRows.filter((row) => row.coverage_status !== "no_research_link").length) {
    fail("Research graph summary linked starter-route count does not match the starter-route coverage export.");
  }
  if (graphSummaryLookup.get("dataset:starter_routes_with_curated_research_link") !== starterRouteLinkRows.filter((row) => row.coverage_status === "manual_curated_link").length) {
    fail("Research graph summary curated starter-route count does not match the starter-route coverage export.");
  }
  if (graphSummaryLookup.get("dataset:starter_routes_without_research_link") !== starterRouteGapRows.length) {
    fail("Research graph summary uncovered starter-route count does not match the starter-route gap export.");
  }
}

if (errors.length) {
  console.error("SA foundation validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("SA foundation validation passed for the legacy foundation files and the aligned research foundation layer.");
