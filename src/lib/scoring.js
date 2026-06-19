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

export function rankCareerRoutes(routes, answers, selectedSignals) {
  const uniqueSignals = getSelectedSignals(answers, selectedSignals);

  return [...routes]
    .map((route) => {
      const score = getRouteScore(route, uniqueSignals);
      const maxScore = Object.values(route.signalWeights ?? {}).reduce((total, weight) => total + weight, 0);
      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const explanation = explainRoute(route, uniqueSignals);

      return {
        ...route,
        score,
        matchPercent,
        explanation,
      };
    })
    .sort((a, b) => b.score - a.score || b.matchPercent - a.matchPercent || a.title.localeCompare(b.title));
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
  const bannedPhrases = ["perfect match", "guaranteed", "100% accurate", "certain to", "always will"];
  const lowerText = String(text ?? "").toLowerCase();
  const bannedPhrase = bannedPhrases.find((phrase) => lowerText.includes(phrase));

  if (bannedPhrase) {
    return { valid: false, reason: `Banned overclaim phrase: ${bannedPhrase}` };
  }

  return { valid: true };
}
