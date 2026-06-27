import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import { CAREER_ACADEMIC_PATHWAY_INDEX } from "../src/data/careerPathwayGraph.js";
import { DEFAULT_LIFESTYLE_PREFERENCES, getPreferenceScore, rankCareerRoutes, validateGuidanceLanguage } from "../src/lib/scoring.js";
import { assessSubjectRisk } from "../src/lib/subjectRisk.js";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const techRanked = rankCareerRoutes(CAREER_ROUTES, {}, ["technology", "maths", "problemSolving"]);
const careRanked = rankCareerRoutes(CAREER_ROUTES, {}, ["helping", "care", "biology"]);

if (techRanked.length !== CAREER_ROUTES.length) fail("Scoring did not return all career routes.");
if (techRanked[0].stream !== "Technology, data and AI") fail(`Technology tags did not surface a technology route first: ${techRanked[0].title}`);
if (careRanked[0].stream !== "Health, care and social services") fail(`Care tags did not surface a care route first: ${careRanked[0].title}`);

const software = CAREER_ROUTES.find((route) => route.id === "software-developer");
const pathway = CAREER_ACADEMIC_PATHWAY_INDEX[software.id]?.academicPathway;
if (!pathway) fail("Missing academic pathway for software developer.");

const neutralPreferenceScore = getPreferenceScore(software, DEFAULT_LIFESTYLE_PREFERENCES);
if (neutralPreferenceScore !== 0) fail(`Neutral lifestyle preferences should not affect ranking; got ${neutralPreferenceScore}.`);

const preferenceRanked = rankCareerRoutes(CAREER_ROUTES, {}, [], { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 90 });
if (preferenceRanked.some((route) => !route.preferenceFit?.summary || !Number.isFinite(route.preferenceScore))) {
  fail("Preference ranking did not attach preference fit metadata to every route.");
}

const neutralSoftware = rankCareerRoutes([software], {}, [], DEFAULT_LIFESTYLE_PREFERENCES)[0];
const earningsWeightedSoftware = rankCareerRoutes([software], {}, [], { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 90 })[0];
if (neutralSoftware.matchPercent !== earningsWeightedSoftware.matchPercent) {
  fail("Lifestyle preferences should not inflate signal match percentages.");
}

const greenRisk = assessSubjectRisk(pathway, {
  currentSubjects: ["Mathematics", "Information Technology"],
  mathsChoice: "Mathematics",
});
if (greenRisk.level !== "green") fail(`Expected green risk for maths/IT software profile, got ${greenRisk.level}.`);
if (greenRisk.label !== "No template subject gap found") fail(`Unexpected template-safe green label: ${greenRisk.label}`);
if (!greenRisk.summary.includes("has not checked provider admission requirements")) fail("Green subject guidance must state that provider requirements were not checked.");

const redRisk = assessSubjectRisk(pathway, {
  currentSubjects: ["Tourism", "Hospitality Studies"],
  mathsChoice: "Mathematical Literacy",
});
if (!["amber", "red"].includes(redRisk.level)) fail(`Expected amber/red risk for missing mathematics, got ${redRisk.level}.`);
if (redRisk.label === "Route appears open" || redRisk.label === "Major subject gate risk") fail(`Unsafe subject-risk label remains: ${redRisk.label}`);
if (!redRisk.summary.includes("starter template")) fail("Missing-subject guidance must identify its starter-template basis.");

const unknownRisk = assessSubjectRisk(pathway, {});
if (unknownRisk.level !== "unknown") fail(`Expected unknown risk when no subjects are captured, got ${unknownRisk.level}.`);
if (!unknownRisk.summary.includes("does not check provider admission requirements")) fail("Unknown subject guidance must state its provider-verification limit.");

const unsafeGuidanceExamples = [
  "This is your perfect match.",
  "Admission is guaranteed.",
  "This result is 100% accurate.",
  "You qualify for this pathway.",
  "You are eligible for this programme.",
  "This is the best route for you.",
  "This is your recommended career.",
  "Route appears open.",
];

for (const example of unsafeGuidanceExamples) {
  const result = validateGuidanceLanguage(example);
  if (result.valid) fail(`Unsafe guidance language was not blocked: ${example}`);
}

const safeGuidanceExamples = [
  "This is an exploration match based on the signals you selected.",
  "This is starter guidance, not an admissions decision.",
  "Requirements vary by provider and admission is not guaranteed.",
  "Review recommended subjects, then check eligibility requirements with the provider.",
  "This possible route still needs provider verification.",
];

for (const example of safeGuidanceExamples) {
  const result = validateGuidanceLanguage(example);
  if (!result.valid) fail(`Safe guidance language was incorrectly blocked: ${example} (${result.reason})`);
}

console.log("MVP flow validation passed: scoring tags, template-safe subject-risk states and guidance-language guardrails behave as expected.");
