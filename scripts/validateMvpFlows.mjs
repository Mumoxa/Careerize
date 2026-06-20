import { CAREER_ROUTES } from "../src/data/careerCatalog.js";
import { CAREER_ACADEMIC_PATHWAY_INDEX } from "../src/data/careerPathwayGraph.js";
import { rankCareerRoutes } from "../src/lib/scoring.js";
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

const greenRisk = assessSubjectRisk(pathway, {
  currentSubjects: ["Mathematics", "Information Technology"],
  mathsChoice: "Mathematics",
});
if (greenRisk.level !== "green") fail(`Expected green risk for maths/IT software profile, got ${greenRisk.level}.`);

const redRisk = assessSubjectRisk(pathway, {
  currentSubjects: ["Tourism", "Hospitality Studies"],
  mathsChoice: "Mathematical Literacy",
});
if (!["amber", "red"].includes(redRisk.level)) fail(`Expected amber/red risk for missing mathematics, got ${redRisk.level}.`);

const unknownRisk = assessSubjectRisk(pathway, {});
if (unknownRisk.level !== "unknown") fail(`Expected unknown risk when no subjects are captured, got ${unknownRisk.level}.`);

console.log("MVP flow validation passed: scoring tags and subject-risk states behave as expected.");
