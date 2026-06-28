import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "../src/data/careerCatalog.js";
import { DEFAULT_REALITY_PREFERENCES, rankCareerRoutes } from "../src/lib/scoring.js";

const errors = [];
const TOP_RELEVANT_COUNT = 20;

const routeById = new Map(CAREER_ROUTES.map((route) => [route.id, route]));
const routeIds = new Set(routeById.keys());
const routeSignals = new Set(CAREER_ROUTES.flatMap((route) => Object.keys(route.signalWeights ?? {})));
const visibleSignals = new Set(INTEREST_SIGNALS.map((signal) => signal.value));
const questionSignals = new Set(DISCOVERY_QUESTIONS.flatMap((question) => question.options.map((option) => option.value)));
const realityCases = [
  ["neutral", DEFAULT_REALITY_PREFERENCES],
  ["earning-low", { ...DEFAULT_REALITY_PREFERENCES, earning: 0 }],
  ["earning-high", { ...DEFAULT_REALITY_PREFERENCES, earning: 100 }],
  ["travel-low", { ...DEFAULT_REALITY_PREFERENCES, travel: 0 }],
  ["travel-high", { ...DEFAULT_REALITY_PREFERENCES, travel: 100 }],
  ["stress-low", { ...DEFAULT_REALITY_PREFERENCES, stress: 0 }],
  ["stress-high", { ...DEFAULT_REALITY_PREFERENCES, stress: 100 }],
  ["danger-low", { ...DEFAULT_REALITY_PREFERENCES, danger: 0 }],
  ["danger-high", { ...DEFAULT_REALITY_PREFERENCES, danger: 100 }],
];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function rank({ answers = {}, signals = [], reality = DEFAULT_REALITY_PREFERENCES }) {
  return rankCareerRoutes(CAREER_ROUTES, answers, signals, reality);
}

function topSignature(results, count = 10) {
  return results.slice(0, count).map((route) => route.id).join("|");
}

function assertRelevantTop(results, context, count = TOP_RELEVANT_COUNT) {
  const zeroSignalRoutes = results.slice(0, count).filter((route) => route.signalScore <= 0);
  assert(
    zeroSignalRoutes.length === 0,
    `${context} promoted zero-signal routes into the top ${count}: ${zeroSignalRoutes.map((route) => route.title).join(", ")}.`
  );
}

function answerCombinations() {
  return DISCOVERY_QUESTIONS.reduce(
    (combinations, question) =>
      combinations.flatMap((answers) => question.options.map((option) => ({ ...answers, [question.id]: option.value }))),
    [{}]
  );
}

const combinations = answerCombinations();
assert(combinations.length === 256, `Expected 256 discovery answer combinations; found ${combinations.length}.`);

for (const signal of INTEREST_SIGNALS) {
  assert(routeSignals.has(signal.value), `Visible interest tag ${signal.value} (${signal.label}) is not produced by any career route.`);
}

for (const question of DISCOVERY_QUESTIONS) {
  for (const option of question.options) {
    assert(routeSignals.has(option.value), `Question option ${question.id}:${option.value} is not produced by any career route.`);
  }
}

for (const signal of ["money"]) {
  assert(!visibleSignals.has(signal), `Deprecated signal ${signal} is still visible as an interest tag.`);
  assert(!questionSignals.has(signal), `Deprecated signal ${signal} is still visible as a question option.`);
  assert(!routeSignals.has(signal), `Deprecated signal ${signal} is still used by a career route.`);
}

for (const [caseName, reality] of realityCases) {
  for (const answers of combinations) {
    const results = rank({ answers, reality });
    assert(results.length === CAREER_ROUTES.length, `${caseName} discovery matrix returned ${results.length} routes instead of ${CAREER_ROUTES.length}.`);
    assertRelevantTop(results, `${caseName} answers ${JSON.stringify(answers)}`);
  }
}

for (const signal of INTEREST_SIGNALS) {
  for (const [caseName, reality] of realityCases) {
    const results = rank({ signals: [signal.value], reality });
    assert(results[0]?.signalScore > 0, `${caseName} interest ${signal.value} did not rank a signal-overlap career first.`);
    assertRelevantTop(results, `${caseName} interest ${signal.value}`);
  }
}

for (let first = 0; first < INTEREST_SIGNALS.length; first += 1) {
  for (let second = first + 1; second < INTEREST_SIGNALS.length; second += 1) {
    const pair = [INTEREST_SIGNALS[first].value, INTEREST_SIGNALS[second].value];

    for (const [caseName, reality] of realityCases) {
      const results = rank({ signals: pair, reality });
      assert(results[0]?.signalScore > 0, `${caseName} interest pair ${pair.join("+")} did not rank a signal-overlap career first.`);
      assertRelevantTop(results, `${caseName} interest pair ${pair.join("+")}`);
    }
  }
}

const legacyMoneyBaseline = rank({ signals: ["care"], reality: { ...DEFAULT_REALITY_PREFERENCES, earning: 100 } });
const legacyMoneyResults = rank({ signals: ["care", "money"], reality: { ...DEFAULT_REALITY_PREFERENCES, earning: 100 } });
assert(
  topSignature(legacyMoneyBaseline, 25) === topSignature(legacyMoneyResults, 25),
  "Legacy saved money signal changed the care plus high-earning recommendation order."
);

const careHighEarning = rank({
  answers: { day: "helping" },
  signals: ["care"],
  reality: { ...DEFAULT_REALITY_PREFERENCES, earning: 100 },
});
assert(
  careHighEarning.slice(0, 20).every((route) => route.stream === "Health, care and social services"),
  `Care plus high-earning should keep health/care routes in the top 20; saw ${[...new Set(careHighEarning.slice(0, 20).map((route) => route.stream))].join(" | ")}.`
);

const explicitFinance = rank({
  answers: { school: "numbers" },
  signals: ["accounting"],
  reality: { ...DEFAULT_REALITY_PREFERENCES, earning: 90 },
});
assert(
  explicitFinance[0]?.stream === "Finance, admin and business operations",
  `Explicit accounting/finance interest should rank finance first; saw ${explicitFinance[0]?.stream}.`
);

const peopleHighEarning = rank({
  answers: { interest: "people" },
  reality: { ...DEFAULT_REALITY_PREFERENCES, earning: 100 },
});
assert(
  !peopleHighEarning.slice(0, 15).some((route) => route.stream === "Finance, admin and business operations"),
  "People plus high earning collapsed into finance/admin routes in the top 15."
);

const practicalSafety = rank({
  answers: { interest: "handsOn" },
  signals: ["tools"],
  reality: { ...DEFAULT_REALITY_PREFERENCES, stress: 35, danger: 0 },
});
const practicalDanger = rank({
  answers: { interest: "handsOn" },
  signals: ["tools"],
  reality: { ...DEFAULT_REALITY_PREFERENCES, stress: 80, danger: 100 },
});
assertRelevantTop(practicalSafety, "practical low-danger scenario");
assertRelevantTop(practicalDanger, "practical high-danger scenario");
assert(
  practicalSafety[0]?.realityFit?.matchPercent !== practicalDanger[0]?.realityFit?.matchPercent
    || topSignature(practicalSafety) !== topSignature(practicalDanger),
  "Practical safety and danger slider scenarios did not produce a visible ranking or reality-fit difference."
);

for (const route of CAREER_ROUTES) {
  for (const similarId of route.similarCareerIds ?? []) {
    assert(routeIds.has(similarId), `Route ${route.id} links to unknown similar career ${similarId}.`);
    assert(similarId !== route.id, `Route ${route.id} links to itself as a similar career.`);
  }

  for (const qualification of route.qualificationPathways ?? []) {
    assert(
      qualification.appliesTo?.includes(route.stream),
      `Route ${route.id} links to qualification ${qualification.id}, but it does not apply to ${route.stream}.`
    );
  }
}

if (errors.length) {
  console.error("Recommendation matrix validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Recommendation matrix validation passed for ${combinations.length} answer combinations, ${INTEREST_SIGNALS.length} individual tags, ${INTEREST_SIGNALS.length * (INTEREST_SIGNALS.length - 1) / 2} tag pairs and ${realityCases.length} reality cases.`
);
