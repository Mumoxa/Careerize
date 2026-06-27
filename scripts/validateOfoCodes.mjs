import { MASTER_CAREER_LIST, MASTER_CAREER_GROUPS } from "../src/data/masterCareerList.js";
import { OFO_MAJOR_GROUPS, SOURCES } from "../src/data/accreditationSourceRegistry.js";

const errors = [];
const warnings = [];
const ofoPattern = /^2021-\d{6}$/;

for (const entry of MASTER_CAREER_LIST) {
  if (!entry.ofoCode) {
    errors.push(`Missing OFO code: ${entry.title} (${entry.stream})`);
    continue;
  }
  if (!ofoPattern.test(entry.ofoCode)) {
    errors.push(`Invalid OFO code format: ${entry.title} = ${entry.ofoCode} (expected 2021-NNNNNN)`);
  }
  if (!entry.sourceRef || !entry.sourceRef.startsWith("OFO 2021:")) {
    errors.push(`Missing or invalid sourceRef: ${entry.title} (${entry.ofoCode})`);
  }
  if (!entry.sourceStatus) {
    errors.push(`Missing sourceStatus: ${entry.title} (${entry.ofoCode})`);
  }
  if (!entry.sourceIds || !entry.sourceIds.includes("dhet-ofo-2021")) {
    errors.push(`Missing dhet-ofo-2021 sourceId: ${entry.title} (${entry.ofoCode})`);
  }
}

const ofoCounts = {};
for (const entry of MASTER_CAREER_LIST) {
  ofoCounts[entry.ofoCode] = (ofoCounts[entry.ofoCode] || 0) + 1;
}
for (const [code, count] of Object.entries(ofoCounts)) {
  if (count > 1) {
    const titles = MASTER_CAREER_LIST.filter((e) => e.ofoCode === code).map((e) => e.title);
    warnings.push(`OFO code ${code} shared by ${count} titles: ${titles.join(", ")}`);
  }
}

const validMajorCodes = new Set(OFO_MAJOR_GROUPS.map((g) => g.code));
for (const group of MASTER_CAREER_GROUPS) {
  for (const code of group.ofoMajorGroups) {
    if (!validMajorCodes.has(code)) {
      errors.push(`Invalid OFO major group code ${code} in stream "${group.stream}"`);
    }
  }
}

if (warnings.length > 0) {
  console.log(`OFO validation: ${warnings.length} warnings (shared OFO codes):`);
  for (const w of warnings.slice(0, 10)) {
    console.log(`  - ${w}`);
  }
  if (warnings.length > 10) {
    console.log(`  ... and ${warnings.length - 10} more`);
  }
}

if (errors.length > 0) {
  console.error(`OFO validation FAILED with ${errors.length} error(s):`);
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
}

console.log(`OFO validation passed for ${MASTER_CAREER_LIST.length} careers: all have valid 2021-NNNNNN codes, source-referenced, with ${warnings.length} shared-code warnings.`);
