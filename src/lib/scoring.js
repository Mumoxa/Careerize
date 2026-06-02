export function getSelectedSignals(answers, selectedSignals) {
  const answerSignals = Object.values(answers).filter(Boolean);
  return [...new Set([...answerSignals, ...selectedSignals])];
}

export function getRouteScore(route, selectedSignals) {
  return selectedSignals.reduce((total, signal) => {
    return total + (route.signalWeights?.[signal] ?? 0);
  }, 0);
}

export function rankCareerRoutes(routes, answers, selectedSignals) {
  const uniqueSignals = getSelectedSignals(answers, selectedSignals);

  return [...routes]
    .map((route) => {
      const score = getRouteScore(route, uniqueSignals);
      const maxScore = Object.values(route.signalWeights ?? {}).reduce((total, weight) => total + weight, 0);
      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        ...route,
        score,
        matchPercent,
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
