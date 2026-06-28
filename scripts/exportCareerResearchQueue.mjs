import fs from "node:fs";
import path from "node:path";
import { CAREER_ROUTES } from "../src/data/careerCatalog.js";

const outputPath = path.join(process.cwd(), "data", "sa-foundation", "career_research_queue.csv");

const SOURCE_PLAN_BY_STREAM = {
  "Technology, data and AI": ["DHET OIHD/OFO occupation mapping", "SAQA or CHE qualification record", "provider programme page", "vendor certification source where relevant"],
  "Finance, admin and business operations": ["DHET OIHD/OFO occupation mapping", "SAQA or CHE qualification record", "professional body source where regulated", "provider programme page"],
  "Skilled trades, construction and engineering": ["DHET OIHD/OFO occupation mapping", "QCTO occupational qualification or trade route", "NAMB or trade-test source where relevant", "provider or SETA route source"],
  "Health, care and social services": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE/QCTO qualification record", "professional council or registration body source", "provider programme page"],
  "Education, training and youth development": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE qualification record", "SACE or education authority source where relevant", "provider programme page"],
  "Agriculture, food and environment": ["DHET OIHD/OFO occupation mapping", "SAQA/QCTO/CHE qualification record", "SETA or industry body route source", "provider programme page"],
  "Logistics, transport and supply chain": ["DHET OIHD/OFO occupation mapping", "SAQA/QCTO qualification record", "licence or regulatory source where relevant", "provider or SETA route source"],
  "Law, public service and public safety": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE/QCTO qualification record", "professional or public-service entry source", "provider programme page"],
  "Creative, media and design": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE/QCTO qualification record where formal route applies", "portfolio or industry-body source", "provider programme page"],
  "Sales, marketing and customer work": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE/QCTO qualification record where formal route applies", "professional body or licensing source where regulated", "provider or workplace route source"],
  "Hospitality, tourism, sport and events": ["DHET OIHD/OFO occupation mapping", "SAQA/QCTO/CATHSSETA route source", "licence or registration source where relevant", "provider programme page"],
  "Manufacturing, mining and energy": ["DHET OIHD/OFO occupation mapping", "QCTO occupational qualification or trade route", "Mine Health and Safety or energy regulator source where relevant", "provider or SETA route source"],
  "Informal, entrepreneurship and community economy": ["DHET OIHD/OFO or informal-economy mapping where available", "municipal by-law or compliance source where relevant", "small-business support source", "local market validation evidence"],
  "Science, research and frontier careers": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE qualification record", "professional or research-body source where relevant", "provider programme page"],
  "Arts, culture, heritage and society": ["DHET OIHD/OFO occupation mapping", "SAQA/CHE/QCTO qualification record where formal route applies", "arts/culture/heritage body source where relevant", "provider or portfolio route source"],
};

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function priorityFor(route) {
  const priorityStreams = new Set([
    "Technology, data and AI",
    "Skilled trades, construction and engineering",
    "Health, care and social services",
    "Manufacturing, mining and energy",
    "Finance, admin and business operations",
  ]);
  if (priorityStreams.has(route.stream)) return "high";
  if (route.pathways?.some((pathway) => ["university", "tvet", "learnership", "apprenticeship"].includes(pathway.type))) return "medium";
  return "standard";
}

const rows = CAREER_ROUTES.map((route, index) => {
  const requiredSources = SOURCE_PLAN_BY_STREAM[route.stream] ?? ["DHET OIHD/OFO occupation mapping", "SAQA/QCTO/CHE/DHET route source", "provider programme page"];
  return {
    queue_rank: index + 1,
    career_id: route.id,
    career_title: route.title,
    stream: route.stream,
    research_priority: priorityFor(route),
    current_profile_status: route.evidenceState?.profile ?? "starter-editorial",
    current_qualification_status: route.evidenceState?.qualification ?? "family-only",
    current_demand_status: route.evidenceState?.demand ?? "not-source-verified",
    earning_policy: route.evidenceState?.earning ?? "qualitative-only",
    required_sources: requiredSources.join(" | "),
    fields_blocked_until_verified: "demand strength | salary figures | APS/marks | provider-specific entry requirements | professional registration claims",
    next_editorial_action: "Map role to official occupation source, verify qualification route, add provider/accreditation evidence, then review learner-facing copy.",
  };
});

const header = [
  "queue_rank",
  "career_id",
  "career_title",
  "stream",
  "research_priority",
  "current_profile_status",
  "current_qualification_status",
  "current_demand_status",
  "earning_policy",
  "required_sources",
  "fields_blocked_until_verified",
  "next_editorial_action",
];

const output = [
  header.join(","),
  ...rows.map((row) => header.map((field) => csv(row[field])).join(",")),
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${output}\n`, "utf8");

console.log(`Exported ${rows.length} career research queue rows to ${outputPath}.`);
