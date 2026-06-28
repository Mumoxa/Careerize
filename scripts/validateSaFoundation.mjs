import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const requiredFiles = [
  "README.md",
  "careerize_sa_repository_manifest.csv",
  "careerize_sa_top100_build_queue.csv",
  "careerize_sa_graph_summary.csv",
  "qualification_pathway_schema.csv",
  "subject_choice_rules_seed.csv",
  "accreditation_source_registry.csv",
  "career_qualification_coverage.csv",
  "career_research_queue.csv",
  "career_research_team_workplan.csv",
];

const errors = [];

if (!fs.existsSync(foundationDir)) {
  errors.push("Missing data/sa-foundation directory.");
}

if (fs.existsSync(path.join(foundationDir, "career_qualification_coverage.csv"))) {
  const rows = read("career_qualification_coverage.csv").trim().split(/\r?\n/);
  if (rows.length !== 462) errors.push(`Qualification coverage should contain 461 records plus header; found ${rows.length - 1}.`);
  if (rows.slice(1).some((row) => row.includes('"missing_association"'))) {
    errors.push("Qualification coverage contains one or more missing career associations.");
  }
}

if (fs.existsSync(path.join(foundationDir, "career_research_queue.csv"))) {
  const rows = read("career_research_queue.csv").trim().split(/\r?\n/);
  const header = rows[0] ?? "";
  if (rows.length !== 462) errors.push(`Career research queue should contain 461 records plus header; found ${rows.length - 1}.`);
  if (!header.includes("queue_rank,career_id,career_title,stream,research_priority,current_profile_status")) {
    errors.push("Career research queue header is not the expected schema.");
  }
  if (!rows.slice(1).every((row) => row.includes("demand strength | salary figures | APS/marks | provider-specific entry requirements | professional registration claims"))) {
    errors.push("Career research queue must keep high-risk claims blocked until source verification.");
  }
  if (!rows.slice(1).every((row) => row.includes("official occupation source") || row.includes("DHET OIHD/OFO"))) {
    errors.push("Career research queue must require official occupation-source mapping for every row.");
  }
}

if (fs.existsSync(path.join(foundationDir, "career_research_team_workplan.csv"))) {
  const rows = read("career_research_team_workplan.csv").trim().split(/\r?\n/);
  const header = rows[0] ?? "";
  if (rows.length !== 462) errors.push(`Career research team workplan should contain 461 records plus header; found ${rows.length - 1}.`);
  if (!header.includes("batch_id,sprint_phase,career_id,career_title,stream,research_priority,research_lane,primary_researcher_role")) {
    errors.push("Career research team workplan header is not the expected schema.");
  }
  if (!rows.slice(1).every((row) => row.includes("source_evidence_reviewer") && row.includes("learner_safety_editor"))) {
    errors.push("Career research team workplan must assign evidence reviewer and learner-safety QA roles for every row.");
  }
  if (!rows.slice(1).every((row) => row.includes("without source URL, access date, verification status and confidence score"))) {
    errors.push("Career research team workplan must preserve the source-evidence handoff rule for every row.");
  }
}

for (const file of requiredFiles) {
  const target = path.join(foundationDir, file);
  if (!fs.existsSync(target)) {
    errors.push(`Missing foundation file: ${file}`);
    continue;
  }
  const stat = fs.statSync(target);
  if (stat.size === 0) errors.push(`Foundation file is empty: ${file}`);
}

function read(file) {
  return fs.readFileSync(path.join(foundationDir, file), "utf8");
}

if (fs.existsSync(path.join(foundationDir, "careerize_sa_repository_manifest.csv"))) {
  const manifest = read("careerize_sa_repository_manifest.csv");
  const requiredManifestItems = [
    "careerize_sa_oihd_350_seed.csv",
    "careerize_sa_graph_nodes.csv",
    "careerize_sa_graph_edges.csv",
    "careerize_sa_qualification_pathway_matrix.csv",
    "careerize_sa_top100_build_queue.csv",
    "careerize_sa_salary_verification_tracker.csv",
    "career_qualification_coverage.csv",
    "career_research_queue.csv",
    "career_research_team_workplan.csv",
  ];
  for (const item of requiredManifestItems) {
    if (!manifest.includes(item)) errors.push(`Foundation manifest does not reference expected workspace file: ${item}`);
  }
}

if (fs.existsSync(path.join(foundationDir, "careerize_sa_top100_build_queue.csv"))) {
  const rows = read("careerize_sa_top100_build_queue.csv").trim().split(/\r?\n/);
  if (rows.length !== 101) errors.push(`Top 100 build queue should contain 100 records plus header; found ${rows.length - 1}.`);
  if (!rows[0].includes("priority_rank,career_title,cluster,current_repo_status,next_action")) {
    errors.push("Top 100 build queue header is not the expected schema.");
  }
}

if (fs.existsSync(path.join(foundationDir, "careerize_sa_graph_summary.csv"))) {
  const graphSummary = read("careerize_sa_graph_summary.csv");
  for (const item of ["node_type,career,43", "node_type,oihd_occupation,350", "edge_type,qualifies_for,64"]) {
    if (!graphSummary.includes(item)) errors.push(`Graph summary missing expected count: ${item}`);
  }
}

if (errors.length) {
  console.error("SA foundation validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SA foundation validation passed for ${requiredFiles.length} committed foundation files, 461 qualification rows, 461 research queue rows and 461 research team workplan rows.`);
