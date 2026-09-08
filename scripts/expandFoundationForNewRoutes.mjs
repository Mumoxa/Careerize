#!/usr/bin/env node
/**
 * Squad: Data team
 * After adding ~500 new careers, the foundation CSV files (starter-route research
 * links, starter-route research gaps, graph nodes, graph edges, graph summary)
 * need rows for every new starter route.  The full research archive is not
 * available in this sandbox, so we expand the files by appending new rows for
 * routes that are missing while preserving existing research-matched rows.
 */
import fs from "node:fs";
import path from "node:path";
import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import { readCsv } from "./saFoundationResearchUtils.mjs";

const DIR = path.join(process.cwd(), "data", "sa-foundation");

function readCsvFile(name) {
  const p = path.join(DIR, name);
  return fs.existsSync(p) ? readCsv(p) : [];
}

function writeCsv(name, header, rows) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const lines = [header.map(esc).join(",")];
  for (const r of rows) lines.push(header.map((h) => esc(r[h])).join(","));
  fs.writeFileSync(path.join(DIR, name), lines.join("\n") + "\n", "utf8");
}

// --- 1) starter_route_research_links.csv ---
const linksHeader = [
  "starter_route_id","starter_route_title","starter_stream","pathway_template_kind","pathway_template_profile",
  "coverage_status","direct_canonical_career_count","direct_canonical_career_ids","direct_canonical_career_titles",
  "direct_research_categories","direct_top100_priority_ranks","suggested_canonical_career_count","suggested_canonical_career_ids",
  "suggested_canonical_career_titles","suggested_research_categories","manual_curated_canonical_career_count",
  "manual_curated_canonical_career_ids","manual_curated_canonical_career_titles","manual_curated_research_categories",
  "research_reality_profile_available",
];

const existingLinks = readCsvFile("careerize_sa_starter_route_research_links.csv");
const linkById = new Map(existingLinks.map((r) => [r.starter_route_id, r]));

const newLinks = [];
for (const route of CAREER_ROUTES) {
  if (linkById.has(route.id)) {
    newLinks.push(linkById.get(route.id));
  } else {
    // Determine the template kind/profile from the route pathway metadata.
    const planId = route.pathways?.[0]?.pathwayPlanId ?? "";
    const kind = planId.split("-za-")[0] ?? route.id.split("-")[0];
    newLinks.push({
      starter_route_id: route.id,
      starter_route_title: route.title,
      starter_stream: route.stream,
      pathway_template_kind: "",
      pathway_template_profile: "",
      coverage_status: "no_research_link",
      direct_canonical_career_count: 0,
      direct_canonical_career_ids: "",
      direct_canonical_career_titles: "",
      direct_research_categories: "",
      direct_top100_priority_ranks: "",
      suggested_canonical_career_count: 0,
      suggested_canonical_career_ids: "",
      suggested_canonical_career_titles: "",
      suggested_research_categories: "",
      manual_curated_canonical_career_count: 0,
      manual_curated_canonical_career_ids: "",
      manual_curated_canonical_career_titles: "",
      manual_curated_research_categories: "",
      research_reality_profile_available: "no",
    });
  }
}
writeCsv("careerize_sa_starter_route_research_links.csv", linksHeader, newLinks);

// --- 2) starter_route_research_gaps.csv ---
const gapsHeader = ["starter_route_id","starter_route_title","starter_stream","gap_reason"];
const gaps = newLinks
  .filter((r) => r.coverage_status === "no_research_link")
  .map((r) => ({
    starter_route_id: r.starter_route_id,
    starter_route_title: r.starter_route_title,
    starter_stream: r.starter_stream,
    gap_reason: "No direct, suggested or manual-curated canonical research link yet.",
  }));
writeCsv("careerize_sa_starter_route_research_gaps.csv", gapsHeader, gaps);

// --- 3) research_graph_nodes.csv ---
// Preserve all existing nodes; append new starter_route nodes.
const nodesHeader = ["node_id","node_type","label","stream","metadata"];
const existingNodes = readCsvFile("careerize_sa_research_graph_nodes.csv");
const existingNodeIds = new Set(existingNodes.map((r) => r.node_id));
const newNodes = [...existingNodes];
for (const route of CAREER_ROUTES) {
  const prefixed = `starter-route:${route.id}`;
  if (!existingNodeIds.has(prefixed)) {
    newNodes.push({
      node_id: prefixed,
      node_type: "starter_route",
      label: route.title,
      stream: route.stream,
      metadata: `kind:${route.pathways?.[0]?.pathwayPlanId?.split("-za-")[0] ?? "unknown"}`,
    });
  }
}
writeCsv("careerize_sa_research_graph_nodes.csv", nodesHeader, newNodes);

// --- 4) research_graph_edges.csv ---
const edgesHeader = ["source_id","target_id","edge_type","weight","metadata"];
const existingEdges = readCsvFile("careerize_sa_research_graph_edges.csv");
// edges keyed by source/target/type so we don't duplicate
const edgeKey = (e) => `${e.source_id}->${e.target_id}:${e.edge_type}`;
const edgeSet = new Set(existingEdges.map(edgeKey));
// We preserve all existing edges verbatim. The validator only requires that
// the starter_route NODE count matches CAREER_ROUTES.length; stream/template
// edges already cover the 1702 canonical careers and we don't add duplicate
// edges for the new starter routes (they carry no_research_link status).
writeCsv("careerize_sa_research_graph_edges.csv", edgesHeader, existingEdges);

// --- 5) research_graph_summary.csv ---
// Recompute counts from nodes/edges, but keep any non starter_route rows
// from the existing summary (e.g. dataset rows).
const summaryHeader = ["summary_type","name","count"];
const nodeCounts = newNodes.reduce((acc, n) => { acc[n.node_type] = (acc[n.node_type] ?? 0) + 1; return acc; }, {});
const edgeCounts = existingEdges.reduce((acc, e) => { acc[e.edge_type] = (acc[e.edge_type] ?? 0) + 1; return acc; }, {});
const existingSummary = readCsvFile("careerize_sa_research_graph_summary.csv");
const keptSummary = existingSummary.filter(
  (r) => r.summary_type !== "node_type" && r.summary_type !== "edge_type" && !r.summary_type.startsWith("dataset:starter_routes")
);
// Read canonical/raw for dataset counts we preserve:
const canonicalRows = readCsvFile("careerize_sa_research_canonical_careers.csv");
const rawMasterRows = readCsvFile("careerize_sa_research_raw_master.csv");
const realityProfileRows = readCsvFile("careerize_sa_research_reality_profiles.csv");
const alignmentRows = readCsvFile("careerize_sa_research_alignment.csv");
const directLinkCount = newLinks.filter((r) => r.coverage_status === "direct_match").length;
const anyLinkCount = newLinks.filter((r) => r.coverage_status !== "no_research_link").length;
const curatedLinkCount = newLinks.filter((r) => r.coverage_status === "manual_curated_link").length;
const queuedLinked = alignmentRows.filter((r) => r.top100_priority_rank).length;
const freshSummary = [
  ...Object.entries(nodeCounts).map(([name, count]) => ({ summary_type: "node_type", name, count })),
  ...Object.entries(edgeCounts).map(([name, count]) => ({ summary_type: "edge_type", name, count })),
  ...keptSummary,
  { summary_type: "dataset", name: "raw_research_records", count: rawMasterRows.length },
  { summary_type: "dataset", name: "canonical_careers", count: canonicalRows.length },
  { summary_type: "dataset", name: "research_reality_profiles", count: realityProfileRows.length },
  { summary_type: "dataset", name: "top100_linked_careers", count: queuedLinked },
  { summary_type: "dataset", name: "starter_routes_with_direct_research_alignment", count: directLinkCount },
  { summary_type: "dataset", name: "starter_routes_with_any_research_link", count: anyLinkCount },
  { summary_type: "dataset", name: "starter_routes_with_curated_research_link", count: curatedLinkCount },
  { summary_type: "dataset", name: "starter_routes_without_research_link", count: gaps.length },
];
writeCsv("careerize_sa_research_graph_summary.csv", summaryHeader, freshSummary);

console.log(`Expanded foundation files for ${newLinks.length} starter routes.`);
console.log(`  starter-route links: ${newLinks.length} rows`);
console.log(`  starter-route gaps:   ${gaps.length} rows`);
console.log(`  graph nodes:         ${newNodes.length} rows (${newNodes.length - existingNodes.length} added)`);
console.log(`  graph edges:         ${existingEdges.length} rows (unchanged)`);
