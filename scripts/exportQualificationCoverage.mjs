import fs from "node:fs";
import path from "node:path";
import { CAREER_ROUTES } from "../src/data/careerCatalog.js";

const output = path.join(process.cwd(), "data", "sa-foundation", "career_qualification_coverage.csv");
const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const header = [
  "career_id",
  "career_title",
  "career_stream",
  "qualification_pathway_ids",
  "qualification_families",
  "verification_statuses",
  "association_status",
  "required_next_check",
];

const rows = CAREER_ROUTES.map((route) => {
  const qualifications = route.qualificationPathways ?? [];
  return [
    route.id,
    route.title,
    route.stream,
    qualifications.map((item) => item.id).join("; "),
    qualifications.map((item) => item.name).join("; "),
    [...new Set(qualifications.map((item) => item.verificationStatus))].join("; "),
    qualifications.length ? "qualification_family_associated" : "missing_association",
    "Verify exact provider programme, entry requirements, NQF record and accreditation against an official source",
  ].map(quote).join(",");
});

fs.writeFileSync(output, `${header.join(",")}\n${rows.join("\n")}\n`, "utf8");
console.log(`Exported ${rows.length} career-to-qualification coverage rows to ${output}.`);

