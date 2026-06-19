import { CAREER_ROUTES, CAREER_COVERAGE_SUMMARY } from "./careerCatalog";
import {
  ACADEMIC_PATHWAY_TEMPLATE_SUMMARY,
  STREAM_TO_PATHWAY_TEMPLATE,
  getAcademicPathwayPlan,
} from "./academicPathwayTemplates";

function resolveTemplateMeta(route) {
  return STREAM_TO_PATHWAY_TEMPLATE[route.stream] ?? { kind: "people", profile: "mixed" };
}

export const CAREER_ACADEMIC_PATHWAYS = CAREER_ROUTES.map((route) => {
  const templateMeta = resolveTemplateMeta(route);
  const academicPathway = getAcademicPathwayPlan({
    title: route.title,
    stream: route.stream,
    kind: templateMeta.kind,
    profile: templateMeta.profile,
  });

  return {
    careerId: route.id,
    careerTitle: route.title,
    stream: route.stream,
    templateKind: templateMeta.kind,
    templateProfile: templateMeta.profile,
    academicPathway,
    subjectGateSummary: {
      requiredOrStronglyRecommended: academicPathway.grade10Subjects.requiredOrStronglyRecommended,
      recommended: academicPathway.grade10Subjects.recommended,
      avoidDropping: academicPathway.grade10Subjects.avoidDropping,
      mathsGate: academicPathway.grade10Subjects.mathsGate,
      scienceGate: academicPathway.grade10Subjects.scienceGate,
    },
    routeTypes: academicPathway.qualificationRoutes.map((option) => option.type),
    verificationStatus: academicPathway.verification.status,
  };
});

export const CAREER_ACADEMIC_PATHWAY_INDEX = Object.fromEntries(
  CAREER_ACADEMIC_PATHWAYS.map((pathway) => [pathway.careerId, pathway])
);

export function getAcademicPathwayForCareer(careerId) {
  return CAREER_ACADEMIC_PATHWAY_INDEX[careerId] ?? null;
}

export const CAREER_PATHWAY_COVERAGE_SUMMARY = {
  careerRouteCount: CAREER_COVERAGE_SUMMARY.totalRoutes,
  academicPathwayCount: CAREER_ACADEMIC_PATHWAYS.length,
  allCareerRoutesLinked: CAREER_COVERAGE_SUMMARY.totalRoutes === CAREER_ACADEMIC_PATHWAYS.length,
  templateSummary: ACADEMIC_PATHWAY_TEMPLATE_SUMMARY,
  streamCounts: CAREER_COVERAGE_SUMMARY.streamCounts,
};
