import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import {
  ADMISSION_LEVELS,
  APS_SCALE,
  CAREER_STUDY_OVERRIDES,
  COMMON_DEGREES,
  NSC_SUBJECTS,
  NQF_LEVELS,
  QUALIFICATION_TYPES,
  STUDY_FIELDS,
  STUDY_SOURCE_REGISTRY,
  getStudyPathForCareer,
} from "../src/data/saQualifications.js";
import { validateGuidanceLanguage } from "../src/lib/scoring.js";

const errors = [];

const sourceIds = new Set(STUDY_SOURCE_REGISTRY.map((source) => source.id));
const subjectIds = new Set(NSC_SUBJECTS.map((subject) => subject.id));
const admissionIds = new Set(ADMISSION_LEVELS.map((level) => level.id));
const qualificationTypeIds = new Set(QUALIFICATION_TYPES.map((item) => item.id));
const routeTargetIds = new Set([...QUALIFICATION_TYPES, ...COMMON_DEGREES].map((item) => item.id));
const careerIds = new Set(CAREER_ROUTES.map((route) => route.id));
const fieldIds = new Set(Object.keys(STUDY_FIELDS));

function checkSources(ids, context) {
  if (!Array.isArray(ids) || ids.length === 0) {
    errors.push(`${context} must reference at least one study source.`);
    return;
  }
  for (const id of ids) {
    if (!sourceIds.has(id)) errors.push(`${context} references unknown study source: ${id}.`);
  }
}

for (const source of STUDY_SOURCE_REGISTRY) {
  if (!source.id || !source.title || !source.type || !source.url || !source.accessedAt || !Number.isFinite(source.confidence)) {
    errors.push(`Study source ${source.id ?? "unknown"} is missing required fields.`);
  }
}

if (NQF_LEVELS.length !== 10) {
  errors.push(`Expected 10 NQF levels; found ${NQF_LEVELS.length}.`);
}

checkSources(APS_SCALE.sourceIds, "APS scale");
if (!Array.isArray(APS_SCALE.levels) || APS_SCALE.levels.length !== 7) {
  errors.push("APS scale must list the 7-point achievement scale.");
}

for (const subject of NSC_SUBJECTS) {
  if (!subject.id || !subject.name || !subject.category || !subject.group) {
    errors.push(`Subject ${subject.id ?? "unknown"} is missing required fields.`);
  }
  if (typeof subject.designated !== "boolean") {
    errors.push(`Subject ${subject.id} must declare a boolean designated flag.`);
  }
  for (const unlock of subject.unlocks ?? []) {
    if (!fieldIds.has(unlock)) errors.push(`Subject ${subject.id} unlocks unknown field: ${unlock}.`);
  }
}

if (!NSC_SUBJECTS.some((subject) => subject.designated)) {
  errors.push("At least one designated subject must exist for Bachelor's admission guidance.");
}

for (const level of ADMISSION_LEVELS) {
  if (!level.id || !level.name || !level.minRequirement || !level.explanation) {
    errors.push(`Admission level ${level.id ?? "unknown"} is missing required fields.`);
  }
  checkSources(level.sourceIds, `Admission level ${level.id}`);
}

for (const qualification of QUALIFICATION_TYPES) {
  if (!qualification.id || !qualification.name || qualification.nqfLevel === undefined || !qualification.entryRequirement || !qualification.description) {
    errors.push(`Qualification type ${qualification.id ?? "unknown"} is missing required fields.`);
  }
  for (const target of qualification.progressesTo ?? []) {
    if (!qualificationTypeIds.has(target)) errors.push(`Qualification ${qualification.id} progresses to unknown type: ${target}.`);
  }
  checkSources(qualification.sourceIds, `Qualification ${qualification.id}`);
}

for (const degree of COMMON_DEGREES) {
  if (!degree.id || !degree.name || !degree.typeId || !degree.note) {
    errors.push(`Common degree ${degree.id ?? "unknown"} is missing required fields.`);
  }
  if (!qualificationTypeIds.has(degree.typeId)) {
    errors.push(`Common degree ${degree.id} references unknown qualification type: ${degree.typeId}.`);
  }
  for (const subjectId of [...(degree.requiredSubjects ?? []), ...(degree.recommendedSubjects ?? [])]) {
    if (!subjectIds.has(subjectId)) errors.push(`Common degree ${degree.id} references unknown subject: ${subjectId}.`);
  }
  for (const fieldId of degree.fields ?? []) {
    if (!fieldIds.has(fieldId)) errors.push(`Common degree ${degree.id} references unknown field: ${fieldId}.`);
  }
  checkSources(degree.sourceIds, `Common degree ${degree.id}`);
}

for (const [fieldId, field] of Object.entries(STUDY_FIELDS)) {
  if (!field.label || !field.admissionLevelId) {
    errors.push(`Study field ${fieldId} is missing a label or admission level.`);
  }
  if (!admissionIds.has(field.admissionLevelId)) {
    errors.push(`Study field ${fieldId} references unknown admission level: ${field.admissionLevelId}.`);
  }
  for (const entry of field.grade10 ?? []) {
    if (!subjectIds.has(entry.subjectId)) errors.push(`Study field ${fieldId} references unknown Grade 10 subject: ${entry.subjectId}.`);
  }
  if (!Array.isArray(field.routeIds) || field.routeIds.length === 0) {
    errors.push(`Study field ${fieldId} must list at least one qualification route.`);
  }
  for (const routeId of field.routeIds ?? []) {
    if (!routeTargetIds.has(routeId)) errors.push(`Study field ${fieldId} references unknown qualification route: ${routeId}.`);
  }
  const guidance = validateGuidanceLanguage([field.label, ...(field.notes ?? []), ...(field.progression ?? [])].join(" "));
  if (!guidance.valid) errors.push(`Study field ${fieldId} uses unsafe guidance language: ${guidance.reason}`);
}

for (const [careerId, override] of Object.entries(CAREER_STUDY_OVERRIDES)) {
  if (!careerIds.has(careerId)) {
    errors.push(`Study override targets unknown career id: ${careerId}.`);
  }
  if (override.admissionLevelId && !admissionIds.has(override.admissionLevelId)) {
    errors.push(`Study override ${careerId} references unknown admission level: ${override.admissionLevelId}.`);
  }
  for (const routeId of override.routeIds ?? []) {
    if (!routeTargetIds.has(routeId)) errors.push(`Study override ${careerId} references unknown qualification route: ${routeId}.`);
  }
}

let resolvedCount = 0;
for (const route of CAREER_ROUTES) {
  const studyPath = getStudyPathForCareer(route);
  if (!studyPath) {
    errors.push(`Career ${route.id} (study field ${route.studyFieldId ?? "missing"}) does not resolve to a study path.`);
    continue;
  }
  resolvedCount += 1;
  if (!studyPath.admissionLevel || studyPath.grade10.length === 0 || studyPath.qualifications.length === 0) {
    errors.push(`Career ${route.id} resolved to an incomplete study path.`);
  }
}

if (errors.length) {
  console.error("Study-path validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Study-path validation passed for ${resolvedCount} careers, ${NSC_SUBJECTS.length} NSC subjects, ${QUALIFICATION_TYPES.length} qualification types, ${COMMON_DEGREES.length} common degrees, ${Object.keys(STUDY_FIELDS).length} study fields and ${STUDY_SOURCE_REGISTRY.length} study sources.`
);
