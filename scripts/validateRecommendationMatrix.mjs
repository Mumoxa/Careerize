import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "../src/data/careerCatalog.js";
import { DEFAULT_LIFESTYLE_PREFERENCES, rankCareerRoutes } from "../src/lib/scoring.js";

const errors = [];
const TOP_RELEVANT_COUNT = 20;

const routeById = new Map(CAREER_ROUTES.map((route) => [route.id, route]));
const routeIds = new Set(routeById.keys());
const routeSignals = new Set(CAREER_ROUTES.flatMap((route) => Object.keys(route.signalWeights ?? {})));
const visibleSignals = new Set(INTEREST_SIGNALS.map((signal) => signal.value));
const questionSignals = new Set(DISCOVERY_QUESTIONS.flatMap((question) => question.options.map((option) => option.value)));
const careAdjacentStreams = new Set(["Health, care and social services", "Education, training and youth development"]);
const preferenceCases = [
  ["neutral", DEFAULT_LIFESTYLE_PREFERENCES],
  ["earnings-low", { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 0 }],
  ["earnings-high", { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 }],
  ["travel-low", { ...DEFAULT_LIFESTYLE_PREFERENCES, travel: 0 }],
  ["travel-high", { ...DEFAULT_LIFESTYLE_PREFERENCES, travel: 100 }],
  ["stress-low", { ...DEFAULT_LIFESTYLE_PREFERENCES, stress: 0 }],
  ["stress-high", { ...DEFAULT_LIFESTYLE_PREFERENCES, stress: 100 }],
  ["danger-low", { ...DEFAULT_LIFESTYLE_PREFERENCES, danger: 0 }],
  ["danger-high", { ...DEFAULT_LIFESTYLE_PREFERENCES, danger: 100 }],
];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function rank({ answers = {}, signals = [], preferences = DEFAULT_LIFESTYLE_PREFERENCES }) {
  return rankCareerRoutes(CAREER_ROUTES, answers, signals, preferences);
}

function answerCombinations() {
  return DISCOVERY_QUESTIONS.reduce(
    (combinations, question) =>
      combinations.flatMap((answers) => question.options.map((option) => ({ ...answers, [question.id]: option.value }))),
    [{}]
  );
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

function assertSignalProducesMatches(signal, context) {
  const results = rank({ signals: [signal] });
  assert(results[0]?.signalScore > 0, `${context} (${signal}) did not produce a signal-overlap career first.`);
}

const combinations = answerCombinations();
assert(combinations.length === 256, `Expected 256 discovery answer combinations; found ${combinations.length}.`);

for (const signal of INTEREST_SIGNALS) {
  assertSignalProducesMatches(signal.value, `Visible interest tag ${signal.label}`);
}

for (const question of DISCOVERY_QUESTIONS) {
  for (const option of question.options) {
    assertSignalProducesMatches(option.value, `Question option ${question.id}:${option.label}`);
  }
}

for (const signal of ["money"]) {
  assert(!visibleSignals.has(signal), `Deprecated signal ${signal} is still visible as an interest tag.`);
  assert(!questionSignals.has(signal), `Deprecated signal ${signal} is still visible as a question option.`);
  assert(!routeSignals.has(signal), `Deprecated signal ${signal} is still used by a career route.`);
}

for (const [caseName, preferences] of preferenceCases) {
  for (const answers of combinations) {
    const results = rank({ answers, preferences });
    assert(results.length === CAREER_ROUTES.length, `${caseName} discovery matrix returned ${results.length} routes instead of ${CAREER_ROUTES.length}.`);
    assertRelevantTop(results, `${caseName} answers ${JSON.stringify(answers)}`);
  }
}

for (const signal of INTEREST_SIGNALS) {
  for (const [caseName, preferences] of preferenceCases) {
    const results = rank({ signals: [signal.value], preferences });
    assert(results[0]?.signalScore > 0, `${caseName} interest ${signal.value} did not rank a signal-overlap career first.`);
    assertRelevantTop(results, `${caseName} interest ${signal.value}`);
  }
}

for (let first = 0; first < INTEREST_SIGNALS.length; first += 1) {
  for (let second = first + 1; second < INTEREST_SIGNALS.length; second += 1) {
    const pair = [INTEREST_SIGNALS[first].value, INTEREST_SIGNALS[second].value];

    for (const [caseName, preferences] of preferenceCases) {
      const results = rank({ signals: pair, preferences });
      assert(results[0]?.signalScore > 0, `${caseName} interest pair ${pair.join("+")} did not rank a signal-overlap career first.`);
      assertRelevantTop(results, `${caseName} interest pair ${pair.join("+")}`);
    }
  }
}

const legacyMoneyBaseline = rank({ signals: ["care"], preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 } });
const legacyMoneyResults = rank({ signals: ["care", "money"], preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 } });
assert(
  topSignature(legacyMoneyBaseline, 25) === topSignature(legacyMoneyResults, 25),
  "Legacy saved money signal changed the care plus high-earning recommendation order."
);

const careHighEarning = rank({
  answers: { day: "helping" },
  signals: ["care"],
  preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 },
});
assert(
  careHighEarning.slice(0, 20).every((route) => careAdjacentStreams.has(route.stream)),
  `Care plus high-earning should keep care or education-support routes in the top 20; saw ${[...new Set(careHighEarning.slice(0, 20).map((route) => route.stream))].join(" | ")}.`
);

const explicitFinance = rank({
  answers: { school: "numbers" },
  signals: ["accounting"],
  preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 90 },
});
assert(
  explicitFinance[0]?.stream === "Finance, admin and business operations",
  `Explicit accounting/finance interest should rank finance first; saw ${explicitFinance[0]?.stream}.`
);

const peopleHighEarning = rank({
  answers: { interest: "people" },
  preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, earnings: 100 },
});
assert(
  !peopleHighEarning.slice(0, 15).some((route) => route.stream === "Finance, admin and business operations"),
  "People plus high earning collapsed into finance/admin routes in the top 15."
);

const practicalSafety = rank({
  answers: { interest: "handsOn" },
  signals: ["tools"],
  preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, stress: 35, danger: 0 },
});
const practicalDanger = rank({
  answers: { interest: "handsOn" },
  signals: ["tools"],
  preferences: { ...DEFAULT_LIFESTYLE_PREFERENCES, stress: 80, danger: 100 },
});
assertRelevantTop(practicalSafety, "practical low-danger scenario");
assertRelevantTop(practicalDanger, "practical high-danger scenario");
assert(
  practicalSafety[0]?.preferenceScore !== practicalDanger[0]?.preferenceScore
    || topSignature(practicalSafety) !== topSignature(practicalDanger),
  "Practical safety and danger slider scenarios did not produce a visible ranking or lifestyle-fit difference."
);

for (const route of CAREER_ROUTES) {
  for (const similarId of route.similarCareerIds ?? []) {
    assert(routeIds.has(similarId), `Route ${route.id} links to unknown similar career ${similarId}.`);
    assert(similarId !== route.id, `Route ${route.id} links to itself as a similar career.`);
  }
}

if (errors.length) {
  console.error("Recommendation matrix validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Recommendation matrix validation passed for ${combinations.length} answer combinations, ${INTEREST_SIGNALS.length} individual tags, ${INTEREST_SIGNALS.length * (INTEREST_SIGNALS.length - 1) / 2} tag pairs and ${preferenceCases.length} lifestyle cases.`
);
