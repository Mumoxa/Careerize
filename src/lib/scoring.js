export const DEFAULT_LIFESTYLE_PREFERENCES = {
  earnings: 50,
  travel: 50,
  stress: 50,
  danger: 50,
};

export const PREFERENCE_DEFINITIONS = [
  {
    id: "earnings",
    label: "Earning ambition",
    lowLabel: "Money is less important",
    highLabel: "Higher earning upside matters",
    helper: "Raises routes with stronger qualitative earning upside. Salary figures still need source verification.",
  },
  {
    id: "travel",
    label: "Travel and movement",
    lowLabel: "Mostly one place",
    highLabel: "Open to travel or field work",
    helper: "Balances office/remote-friendly routes against work that needs sites, vehicles, clients or field locations.",
  },
  {
    id: "stress",
    label: "Stress tolerance",
    lowLabel: "Lower pressure preferred",
    highLabel: "Can handle pressure",
    helper: "Considers pressure from deadlines, people, safety, public responsibility and unpredictable workloads.",
  },
  {
    id: "danger",
    label: "Safety and danger tolerance",
    lowLabel: "Low physical risk preferred",
    highLabel: "Open to higher-risk environments",
    helper: "Flags hands-on, site, emergency, mine, farm, plant or equipment-heavy environments for discussion.",
  },
];

export function getSelectedSignals(answers, selectedSignals) {
  const answerSignals = Object.values(answers).filter(Boolean);
  const explicitSignals = [...answerSignals, ...selectedSignals];
  const derivedSignals = explicitSignals.flatMap((signal) => {
    if (signal === "remote") return ["quiet", "technology"];
    if (signal === "handsOn") return ["practical", "tools"];
    return [];
  });
  return [...new Set([...explicitSignals, ...derivedSignals])];
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

function includesAny(text, terms) {
  const value = String(text ?? "").toLowerCase();
  return terms.some((term) => value.includes(term));
}

export function getRoutePreferenceProfile(route) {
  const earningText = `${route.earningPotential?.label ?? ""} ${route.earningPotential?.explanation ?? ""}`;
  const environmentText = `${route.environment ?? ""} ${(route.workEnvironment ?? []).join(" ")}`;
  const stressText = route.stress ?? "";

  const earnings = includesAny(earningText, ["high", "strong", "specialist", "scarce", "good progression"])
    ? 80
    : includesAny(earningText, ["stable", "steady"])
      ? 60
      : 45;
  const travel = includesAny(environmentText, ["remote", "office", "online"])
    ? 25
    : includesAny(environmentText, ["site", "field", "vehicle", "farm", "mine", "customer locations", "events", "ports", "streets"])
      ? 78
      : 50;
  const stress = includesAny(stressText, ["high"])
    ? 82
    : includesAny(stressText, ["variable"])
      ? 66
      : 50;
  const danger = includesAny(environmentText, ["mine", "site", "plant", "factory", "farm", "emergency", "equipment", "vehicles", "workshops", "safety"])
    ? 72
    : includesAny(environmentText, ["clinic", "hospital", "field"])
      ? 58
      : 30;

  return { earnings, travel, stress, danger };
}

export function getPreferenceScore(route, preferences = DEFAULT_LIFESTYLE_PREFERENCES) {
  const hasExplicitPreference = Object.entries(DEFAULT_LIFESTYLE_PREFERENCES).some(([key, defaultValue]) => {
    return Number(preferences[key] ?? defaultValue) !== defaultValue;
  });
  if (!hasExplicitPreference) return 0;

  const profile = getRoutePreferenceProfile(route);
  return Object.entries(DEFAULT_LIFESTYLE_PREFERENCES).reduce((total, [key, defaultValue]) => {
    const learnerValue = Number(preferences[key] ?? defaultValue);
    const routeValue = Number(profile[key] ?? defaultValue);
    const distance = Math.abs(learnerValue - routeValue);
    return total + Math.max(0, 25 - distance / 4);
  }, 0);
}

export function explainPreferenceFit(route, preferences = DEFAULT_LIFESTYLE_PREFERENCES) {
  const profile = getRoutePreferenceProfile(route);
  const strongest = Object.entries(profile).sort((a, b) => b[1] - a[1])[0];
  const labels = {
    earnings: "earning upside",
    travel: "travel or movement",
    stress: "stress tolerance",
    danger: "physical safety risk",
  };
  return {
    profile,
    strongestPreference: strongest ? labels[strongest[0]] : "balanced conditions",
    summary: `Lifestyle fit compares your sliders with qualitative ${labels.earnings}, ${labels.travel}, ${labels.stress} and ${labels.danger} signals. It is a discussion prompt, not a guarantee.`,
  };
}

export function rankCareerRoutes(routes, answers, selectedSignals, preferences = DEFAULT_LIFESTYLE_PREFERENCES) {
  const knownSignals = new Set(routes.flatMap((route) => Object.keys(route.signalWeights ?? {})));
  const uniqueSignals = getSelectedSignals(answers, selectedSignals).filter((signal) => knownSignals.has(signal));

  return [...routes]
    .map((route) => {
      const signalScore = getRouteScore(route, uniqueSignals);
      const preferenceScore = getPreferenceScore(route, preferences);
      const score = signalScore + preferenceScore;
      const maxScore = Object.values(route.signalWeights ?? {}).reduce((total, weight) => total + weight, 0);
      const matchPercent = maxScore > 0 ? Math.round((signalScore / maxScore) * 100) : 0;
      const explanation = explainRoute(route, uniqueSignals);

      return {
        ...route,
        score,
        matchPercent,
        explanation,
        signalScore,
        preferenceScore,
        preferenceFit: explainPreferenceFit(route, preferences),
      };
    })
    .sort((a, b) => {
      const aHasSignalOverlap = uniqueSignals.length === 0 || a.signalScore > 0;
      const bHasSignalOverlap = uniqueSignals.length === 0 || b.signalScore > 0;
      return Number(bHasSignalOverlap) - Number(aHasSignalOverlap)
        || b.score - a.score
        || b.matchPercent - a.matchPercent
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

export function validateGuidanceLanguage(text) {
  const normalizedText = String(text ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  const textWithoutGuaranteeDisclaimers = normalizedText
    .replace(/\b(?:not|never) guaranteed\b/g, "")
    .replace(/\b(?:does not|do not|cannot|can't) guarantee\b/g, "");
  const overclaimPatterns = [
    { label: "perfect match", pattern: /\bperfect\s+match\b/, value: normalizedText },
    { label: "guaranteed", pattern: /\bguarantee(?:d|s)?\b/, value: textWithoutGuaranteeDisclaimers },
    { label: "100% accurate", pattern: /\b100\s*%\s*accurate\b/, value: normalizedText },
    { label: "certain to", pattern: /\bcertain\s+to\b/, value: normalizedText },
    { label: "always will", pattern: /\balways\s+will\b/, value: normalizedText },
    { label: "you qualify", pattern: /\byou\s+(?:(?:do|would|will|can)\s+)?(?:not\s+)?qualif(?:y|ied)\b/, value: normalizedText },
    { label: "you are eligible", pattern: /\byou(?:'re|\s+(?:are|may\s+be|might\s+be|could\s+be|will\s+be))\s+(?:not\s+)?eligible\b/, value: normalizedText },
    { label: "best route", pattern: /\bbest\s+(?:study\s+|career\s+)?route(?:\s+for\s+you)?\b/, value: normalizedText },
    { label: "recommended career", pattern: /\brecommended\s+career\b/, value: normalizedText },
    { label: "route appears open", pattern: /\broute\s+appears\s+open\b/, value: normalizedText },
  ];
  const overclaim = overclaimPatterns.find(({ pattern, value }) => pattern.test(value));

  if (overclaim) {
    return { valid: false, reason: `Banned overclaim phrase: ${overclaim.label}` };
  }

  return { valid: true };
}
