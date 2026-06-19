import { CAREER_ROUTES, CAREER_COVERAGE_SUMMARY } from "../src/data/careerCatalog.js";
import {
  CAREER_ACADEMIC_PATHWAYS,
  CAREER_ACADEMIC_PATHWAY_INDEX,
  CAREER_PATHWAY_COVERAGE_SUMMARY,
} from "../src/data/careerPathwayGraph.js";

function fail(message) {
  console.error(`Academic pathway validation failed: ${message}`);
  process.exit(1);
}

if (CAREER_ROUTES.length !== CAREER_COVERAGE_SUMMARY.totalRoutes) {
  fail(`CAREER_ROUTES length ${CAREER_ROUTES.length} does not match summary ${CAREER_COVERAGE_SUMMARY.totalRoutes}.`);
}

if (CAREER_ACADEMIC_PATHWAYS.length !== CAREER_ROUTES.length) {
  fail(`Expected ${CAREER_ROUTES.length} academic pathways but found ${CAREER_ACADEMIC_PATHWAYS.length}.`);
}

if (!CAREER_PATHWAY_COVERAGE_SUMMARY.allCareerRoutesLinked) {
  fail("Coverage summary says not all routes are linked.");
}

const routeIds = new Set(CAREER_ROUTES.map((route) => route.id));

for (const route of CAREER_ROUTES) {
  const pathway = CAREER_ACADEMIC_PATHWAY_INDEX[route.id];
  if (!pathway) fail(`Missing academic pathway for ${route.id}.`);

  if (!pathway.academicPathway?.grade10Subjects?.recommended?.length) {
    fail(`Missing recommended Grade 10 subjects for ${route.id}.`);
  }

  if (!pathway.academicPathway?.qualificationRoutes?.length) {
    fail(`Missing qualification routes for ${route.id}.`);
  }

  if (!pathway.academicPathway?.fromGrade10ToWork?.length) {
    fail(`Missing Grade 10-to-work timeline for ${route.id}.`);
  }

  if (pathway.verificationStatus !== "template_linked_needs_provider_verification") {
    fail(`Unexpected verification status for ${route.id}: ${pathway.verificationStatus}.`);
  }
}

for (const pathway of CAREER_ACADEMIC_PATHWAYS) {
  if (!routeIds.has(pathway.careerId)) {
    fail(`Academic pathway references unknown career ID ${pathway.careerId}.`);
  }
}

console.log(`Academic pathway validation passed: ${CAREER_ACADEMIC_PATHWAYS.length} career routes linked to Grade 10, NSC, qualification and intake-gate templates.`);
