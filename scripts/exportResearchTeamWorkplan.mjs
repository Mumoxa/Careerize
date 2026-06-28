import fs from "node:fs";
import path from "node:path";

const foundationDir = path.join(process.cwd(), "data", "sa-foundation");
const researchQueuePath = path.join(foundationDir, "career_research_queue.csv");
const outputPath = path.join(foundationDir, "career_research_team_workplan.csv");

const LANE_BY_STREAM = {
  "Technology, data and AI": "digital-data-ai",
  "Finance, admin and business operations": "finance-business-services",
  "Skilled trades, construction and engineering": "trades-built-environment",
  "Health, care and social services": "health-care-social",
  "Education, training and youth development": "education-youth",
  "Agriculture, food and environment": "agri-food-environment",
  "Logistics, transport and supply chain": "logistics-transport",
  "Law, public service and public safety": "public-law-safety",
  "Creative, media and design": "creative-media-design",
  "Sales, marketing and customer work": "commercial-customer",
  "Hospitality, tourism, sport and events": "hospitality-tourism-sport",
  "Manufacturing, mining and energy": "manufacturing-mining-energy",
  "Informal, entrepreneurship and community economy": "informal-enterprise",
  "Science, research and frontier careers": "science-frontier",
  "Arts, culture, heritage and society": "arts-culture-society",
};

const PRIMARY_ROLE_BY_LANE = {
  "digital-data-ai": "occupation_mapper",
  "finance-business-services": "occupation_mapper",
  "trades-built-environment": "qualification_accreditation_researcher",
  "health-care-social": "professional_registration_researcher",
  "education-youth": "professional_registration_researcher",
  "agri-food-environment": "qualification_accreditation_researcher",
  "logistics-transport": "occupation_mapper",
  "public-law-safety": "professional_registration_researcher",
  "creative-media-design": "career_reality_researcher",
  "commercial-customer": "occupation_mapper",
  "hospitality-tourism-sport": "qualification_accreditation_researcher",
  "manufacturing-mining-energy": "qualification_accreditation_researcher",
  "informal-enterprise": "career_reality_researcher",
  "science-frontier": "qualification_accreditation_researcher",
  "arts-culture-society": "career_reality_researcher",
};

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

function readResearchQueue() {
  const rows = fs.readFileSync(researchQueuePath, "utf8").trim().split(/\r?\n/);
  const header = parseCsvLine(rows[0]);
  return rows.slice(1).map((row) => Object.fromEntries(parseCsvLine(row).map((value, index) => [header[index], value])));
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function phaseFor(priority) {
  if (priority === "high") return "phase_1";
  if (priority === "medium") return "phase_2";
  return "phase_3";
}

function batchFor(index) {
  return `batch_${String(Math.floor(index / 25) + 1).padStart(2, "0")}`;
}

if (!fs.existsSync(researchQueuePath)) {
  throw new Error("Run npm run export:career-research-queue before exporting the research team workplan.");
}

const workplan = readResearchQueue().map((row, index) => {
  const lane = LANE_BY_STREAM[row.stream] ?? "general-research";
  return {
    batch_id: batchFor(index),
    sprint_phase: phaseFor(row.research_priority),
    career_id: row.career_id,
    career_title: row.career_title,
    stream: row.stream,
    research_priority: row.research_priority,
    research_lane: lane,
    primary_researcher_role: PRIMARY_ROLE_BY_LANE[lane] ?? "occupation_mapper",
    evidence_reviewer_role: "source_evidence_reviewer",
    qa_reviewer_role: "learner_safety_editor",
    current_status: "not_started",
    qa_status: "not_started",
    required_output: "occupation mapping record | claim verification record | qualification/accreditation note | learner-safe profile update recommendation",
    handoff_rule: "No salary, demand, APS, provider-entry or registration claim moves to reviewed/published without source URL, access date, verification status and confidence score.",
  };
});

const header = [
  "batch_id",
  "sprint_phase",
  "career_id",
  "career_title",
  "stream",
  "research_priority",
  "research_lane",
  "primary_researcher_role",
  "evidence_reviewer_role",
  "qa_reviewer_role",
  "current_status",
  "qa_status",
  "required_output",
  "handoff_rule",
];

const output = [
  header.join(","),
  ...workplan.map((row) => header.map((field) => csv(row[field])).join(",")),
].join("\n");

fs.writeFileSync(outputPath, `${output}\n`, "utf8");

console.log(`Exported ${workplan.length} career research team workplan rows to ${outputPath}.`);
