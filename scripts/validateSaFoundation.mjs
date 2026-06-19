import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const requiredFiles = [
  "README.md",
  "careerize_sa_repository_manifest.csv",
  "careerize_sa_top100_build_queue.csv",
  "careerize_sa_graph_summary.csv",
];

const errors = [];

if (!fs.existsSync(foundationDir)) {
  errors.push("Missing data/sa-foundation directory.");
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

console.log(`SA foundation validation passed for ${requiredFiles.length} committed foundation files and the workspace manifest.`);
