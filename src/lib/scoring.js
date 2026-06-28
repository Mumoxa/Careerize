export const DEFAULT_REALITY_PREFERENCES = {
  earning: 50,
  travel: 50,
  stress: 50,
  danger: 50,
};

export const REALITY_PREFERENCE_LABELS = {
  earning: "Earning ambition",
  travel: "Travel and movement",
  stress: "Stress tolerance",
  danger: "Safety and danger tolerance",
};

function normalisePreference(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 50;
  return Math.min(100, Math.max(0, number));
}

export function getRealityFit(route, preferences = DEFAULT_REALITY_PREFERENCES) {
  const reality = route.careerReality ?? DEFAULT_REALITY_PREFERENCES;
  const dimensions = Object.keys(DEFAULT_REALITY_PREFERENCES);
  const details = dimensions.map((dimension) => {
    const learner = normalisePreference(preferences[dimension]);
    const routeValue = normalisePreference(reality[dimension]);
    const difference = Math.abs(learner - routeValue);
    return {
      dimension,
      learner,
      routeValue,
      fit: Math.max(0, 100 - difference),
    };
  });
  const averageFit = Math.round(details.reduce((total, item) => total + item.fit, 0) / details.length);
  const changed = details.some((item) => item.learner !== 50);

  return {
    score: changed ? Math.round((averageFit - 50) / 10) : 0,
    matchPercent: averageFit,
    details,
    changed,
  };
}
export function getSelectedSignals(answers, selectedSignals) {
  const answerSignals = Object.values(answers).filter(Boolean);
  return [...new Set([...answerSignals, ...selectedSignals])];
}

export function getRouteScore(route, selectedSignals) {
  return selectedSignals.reduce((total, signal) => {
    return total + (route.signalWeights?.[signal] ?? 0);
  }, 0);
}

export function explainRoute(route, selectedSignals) {
  const weights = route.signalWeights ?? {};
  const weightedSignals = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const matchedSignals = weightedSignals
    .filter(([signal]) => selectedSignals.includes(signal))
    .map(([signal, weight]) => ({ signal, weight }));
  const missingStrongSignals = weightedSignals
    .filter(([signal, weight]) => !selectedSignals.includes(signal) && weight >= 2)
    .map(([signal, weight]) => ({ signal, weight }));

  const sourceConfidence = route.dataConfidence ?? 40;
  const evidenceCoverage = Math.min(100, matchedSignals.length * 18 + selectedSignals.length * 6);
  const explanationConfidence = Math.round((sourceConfidence + evidenceCoverage) / 2);

  let confidenceLabel = "Low";
  if (explanationConfidence >= 70) confidenceLabel = "High";
  else if (explanationConfidence >= 45) confidenceLabel = "Medium";

  return {
    matchedSignals,
    missingStrongSignals,
    confidenceLabel,
    explanationConfidence,
    sourceConfidence,
    reason:
      matchedSignals.length > 0
        ? `This route is suggested because it shares ${matchedSignals.length} of the learner's selected signals. It is still a discussion starter, not a verdict.`
        : "This route has limited signal overlap so far. More answers are needed before comparing it seriously.",
    nextStep:
      missingStrongSignals.length > 0
        ? `Check whether the learner is open to ${missingStrongSignals.slice(0, 2).map((item) => item.signal).join(" and ")} work before treating this as a strong option.`
        : "Open the pathway and reality sections, then compare the route with at least two alternatives.",
  };
}

export function rankCareerRoutes(routes, answers, selectedSignals, realityPreferences = DEFAULT_REALITY_PREFERENCES) {
  const knownSignals = new Set(routes.flatMap((route) => Object.keys(route.signalWeights ?? {})));
  const uniqueSignals = getSelectedSignals(answers, selectedSignals).filter((signal) => knownSignals.has(signal));

  return [...routes]
    .map((route) => {
      const score = getRouteScore(route, uniqueSignals);
      const maxScore = Object.values(route.signalWeights ?? {}).reduce((total, weight) => total + weight, 0);
      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const explanation = explainRoute(route, uniqueSignals);
      const realityFit = getRealityFit(route, realityPreferences);

      return {
        ...route,
        score: score + realityFit.score,
        signalScore: score,
        matchPercent,
        realityFit,
        explanation,
      };
    })
    .sort((a, b) => {
      const aHasSignalOverlap = uniqueSignals.length === 0 || a.signalScore > 0;
      const bHasSignalOverlap = uniqueSignals.length === 0 || b.signalScore > 0;
      return Number(bHasSignalOverlap) - Number(aHasSignalOverlap)
        || b.score - a.score
        || b.matchPercent - a.matchPercent
        || b.realityFit.matchPercent - a.realityFit.matchPercent
        || a.title.localeCompare(b.title);
    });
}

export function getProfileProgress(answers, questions) {
  if (!questions.length) return 0;
  return Math.round((Object.keys(answers).length / questions.length) * 100);
}

export function toggleSignal(currentSignals, signal) {
  if (currentSignals.includes(signal)) {
    return currentSignals.filter((item) => item !== signal);
  }

  return [...currentSignals, signal];
}

const RISK_ORDER = { green: 0, amber: 1, red: 2 };

export function evaluatePathwayRisk(route, selectedSubjects, subjectMarks, rules) {
  const chosen = new Set(selectedSubjects ?? []);
  const applicableRules = rules.filter((rule) => rule.clusters.includes(route.stream));

  const impacts = applicableRules.map((rule) => {
    const selected = chosen.has(rule.subject);
    const mark = Number(subjectMarks?.[rule.subject] ?? 0);
    let status = "green";
    let reason = `${rule.subject} supports this route.`;

    if (!selected && rule.strength === "blocks_some_routes_if_missing") {
      status = "red";
      reason = rule.warning;
    } else if (!selected && ["strongly_recommended", "route_dependent"].includes(rule.strength)) {
      status = "amber";
      reason = rule.warning;
    } else if (!selected && rule.strength === "helpful") {
      status = "green";
      reason = `${rule.subject} could help, but it is not presented as an absolute requirement.`;
    } else if (selected && mark > 0 && mark < 50 && ["blocks_some_routes_if_missing", "strongly_recommended", "route_dependent"].includes(rule.strength)) {
      status = "amber";
      reason = `${rule.subject} is selected, but the current estimate may need improvement for some routes.`;
    }

    return { ...rule, selected, mark: mark || null, status, reason };
  });

  const highest = impacts.reduce((current, impact) => RISK_ORDER[impact.status] > RISK_ORDER[current] ? impact.status : current, "green");
  const status = applicableRules.length === 0 ? "amber" : highest;

  return {
    status,
    label: status === "green" ? "Subjects support this route" : status === "red" ? "A major route may be at risk" : "Route needs a closer check",
    impacts,
    disclaimer: "This is broad planning guidance. Confirm exact subjects, marks and APS with each provider or awarding body.",
  };
}

export function validateGuidanceLanguage(text) {
  const bannedPhrases = ["perfect match", "guaranteed", "100% accurate", "certain to", "always will"];
  const lowerText = String(text ?? "").toLowerCase();
  const bannedPhrase = bannedPhrases.find((phrase) => lowerText.includes(phrase));

  if (bannedPhrase) {
    return { valid: false, reason: `Banned overclaim phrase: ${bannedPhrase}` };
  }

  return { valid: true };
}
