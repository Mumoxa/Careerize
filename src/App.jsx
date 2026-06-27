import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  Lock,
  Map as MapIcon,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import learnersCollaborating640 from "./assets/learners-collaborating-640.jpg";
import learnersCollaborating1280 from "./assets/learners-collaborating-1280.jpg";
import { CAREER_COVERAGE_SUMMARY, CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog.js";
import { getAcademicPathwayForCareer } from "./data/careerPathwayGraph.js";
import { assessSubjectRisk } from "./lib/subjectRisk.js";
import {
  DEFAULT_LIFESTYLE_PREFERENCES,
  PREFERENCE_DEFINITIONS,
  getProfileProgress,
  rankCareerRoutes,
  toggleSignal,
} from "./lib/scoring.js";

const SIGNAL_LABELS = new Map(INTEREST_SIGNALS.map((signal) => [signal.value, signal.label]));
const STARTER_ROUTE_IDS = ["software-developer", "environmental-scientist", "data-analyst"];
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "Accounting",
  "Business Studies",
  "Economics",
  "Geography",
  "Information Technology",
  "Computer Applications Technology",
  "Engineering Graphics and Design",
  "Agricultural Sciences",
  "Tourism",
  "Hospitality Studies",
  "Visual Arts",
  "Design",
];

function initialRouteState() {
  if (typeof window === "undefined") return { signals: [], pathwayId: null };
  const params = new URLSearchParams(window.location.search);
  const validSignals = new Set(INTEREST_SIGNALS.map((signal) => signal.value));
  const signals = (params.get("signals") ?? "")
    .split(",")
    .filter((signal) => validSignals.has(signal));
  const pathwayId = CAREER_ROUTES.some((route) => route.id === params.get("pathway"))
    ? params.get("pathway")
    : null;
  return { signals, pathwayId };
}

export default function App() {
  const initial = useMemo(initialRouteState, []);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedSignals, setSelectedSignals] = useState(initial.signals);
  const [activePathwayId, setActivePathwayId] = useState(initial.pathwayId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [lifestylePreferences, setLifestylePreferences] = useState(DEFAULT_LIFESTYLE_PREFERENCES);
  const pathwayHeadingRef = useRef(null);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, lifestylePreferences),
    [answers, selectedSignals, lifestylePreferences]
  );
  const hasPreferenceInput = Object.entries(lifestylePreferences).some(([key, value]) => value !== DEFAULT_LIFESTYLE_PREFERENCES[key]);
  const hasDiscoveryInput = Object.keys(answers).length > 0 || selectedSignals.length > 0 || hasPreferenceInput;
  const starterRoutes = STARTER_ROUTE_IDS.map((id) => ranked.find((route) => route.id === id)).filter(Boolean);
  const hasRouteFilters = routeSearch.trim().length > 0 || streamFilter !== "all";
  const defaultResults = hasDiscoveryInput || hasRouteFilters ? ranked : starterRoutes;
  const routeStreams = useMemo(
    () => [...new Set(CAREER_ROUTES.map((route) => route.stream))].sort(),
    []
  );
  const visibleRoutes = useMemo(() => {
    const search = routeSearch.trim().toLowerCase();
    return defaultResults
      .filter((route) => {
        const searchable = [route.title, route.stream, route.summary, ...(route.subjects ?? [])]
          .join(" ")
          .toLowerCase();
        return (!search || searchable.includes(search)) &&
          (streamFilter === "all" || route.stream === streamFilter);
      })
      .slice(0, hasDiscoveryInput || hasRouteFilters ? 9 : 3);
  }, [defaultResults, hasDiscoveryInput, hasRouteFilters, routeSearch, streamFilter]);
  const activeRoute = ranked.find((route) => route.id === activePathwayId) ?? visibleRoutes[0] ?? ranked[0];
  const pathwayRecord = activeRoute ? getAcademicPathwayForCareer(activeRoute.id) : null;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);
  const currentQuestion = DISCOVERY_QUESTIONS[questionStep];

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (activePathwayId) url.searchParams.set("pathway", activePathwayId);
    else url.searchParams.delete("pathway");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activePathwayId, selectedSignals]);

  function choose(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setActivePathwayId(null);
  }

  function toggleInterest(signal) {
    setSelectedSignals((current) => toggleSignal(current, signal));
    setActivePathwayId(null);
  }

  function updateLifestylePreference(id, value) {
    setLifestylePreferences((current) => ({ ...current, [id]: Number(value) }));
    setActivePathwayId(null);
  }

  function toggleSubject(subject) {
    setSelectedSubjects((current) =>
      current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject]
    );
  }

  function openPathway(routeId) {
    setActivePathwayId(routeId);
    window.requestAnimationFrame(() => {
      document.querySelector("#pathway-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
      pathwayHeadingRef.current?.focus({ preventScroll: true });
    });
  }

  function resetDiscovery() {
    setAnswers({});
    setSelectedSignals([]);
    setActivePathwayId(null);
    setQuestionStep(0);
    setRouteSearch("");
    setStreamFilter("all");
    setLifestylePreferences(DEFAULT_LIFESTYLE_PREFERENCES);
  }

  function advanceDiscovery() {
    if (questionStep < DISCOVERY_QUESTIONS.length - 1) {
      setQuestionStep((step) => step + 1);
      return;
    }
    document.querySelector("#matches")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-sage-200 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5">
          <a href="#top" className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="#discover">Discovery</a>
            <a href="#matches">Exploration matches</a>
            <a href="#pathway-detail">Pathway guide</a>
            <a href="#trust">Trust</a>
          </nav>
          <a href="#discover" className="primary-button hidden md:inline-flex">Start exploring</a>
          <button
            type="button"
            onClick={() => setMobileNavOpen((value) => !value)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            className="icon-button md:hidden"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileNavOpen ? (
          <nav id="mobile-navigation" className="grid gap-4 border-t border-sage-200 bg-cream-100 px-5 py-5 text-sm font-semibold md:hidden">
            <a href="#discover" onClick={() => setMobileNavOpen(false)}>Discovery</a>
            <a href="#matches" onClick={() => setMobileNavOpen(false)}>Exploration matches</a>
            <a href="#pathway-detail" onClick={() => setMobileNavOpen(false)}>Pathway guide</a>
            <a href="#trust" onClick={() => setMobileNavOpen(false)}>Trust</a>
          </nav>
        ) : null}
      </header>

      <main id="main-content">
        <section id="top" className="mx-auto grid max-w-[1240px] gap-12 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div>
            <GuidanceLabels />
            <h1 className="mt-6 max-w-[680px] text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
              Explore career and study routes from the signals you choose.
            </h1>
            <div className="accent-stroke mt-5" />
            <p className="mt-8 max-w-2xl text-lg leading-8 text-forest-800/80">
              Careerize helps you explore possible study and career routes based on the signals you choose. This is starter guidance, not an admissions decision. Check subject and entry requirements with each provider.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#discover" className="primary-button">Start exploring <ArrowRight size={18} /></a>
              <a href="#matches" className="secondary-button">Browse starter routes</a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-forest-800/80"><MapIcon size={18} className="text-forest-700" /> Built for South African learners</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-sage-200 bg-sage-100 shadow-[8px_8px_0_#a9c59f]">
            <img
              src={learnersCollaborating1280}
              srcSet={`${learnersCollaborating640} 640w, ${learnersCollaborating1280} 1280w`}
              sizes="(min-width: 1024px) 52vw, 100vw"
              width="1280"
              height="720"
              fetchpriority="high"
              decoding="async"
              alt="Learners discussing possible study and career routes"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="grid gap-2 bg-forest-900 p-5 text-cream-50 sm:grid-cols-3">
              <HeroFact value={CAREER_COVERAGE_SUMMARY.totalRoutes.toLocaleString("en-ZA")} label="starter career profiles" />
              <HeroFact value="Signals" label="not suitability scores" />
              <HeroFact value="Provider check" label="before subject choices" />
            </div>
          </div>
        </section>

        <section id="discover" className="section-border bg-sage-50/80">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Quick discovery" text="Your answers change the order of exploration routes. They do not determine eligibility or readiness." />
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold">{currentQuestion.label}</h2>
                <span className="text-sm text-forest-700">Question {questionStep + 1} of {DISCOVERY_QUESTIONS.length}</span>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => choose(currentQuestion.id, option.value)}
                      aria-pressed={selected}
                      className={`answer-card ${selected ? "answer-card-selected" : ""}`}
                    >
                      <span>{option.label}</span>
                      <span className="selection-dot" aria-hidden="true">{selected ? <Check size={14} /> : null}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex flex-wrap justify-between gap-3">
                <button type="button" className="secondary-button" disabled={questionStep === 0} onClick={() => setQuestionStep((step) => Math.max(0, step - 1))}>Back</button>
                <button type="button" className="primary-button" onClick={advanceDiscovery}>
                  {questionStep === DISCOVERY_QUESTIONS.length - 1 ? "View exploration matches" : "Next question"} <ArrowRight size={17} />
                </button>
              </div>
              <p className="mt-5 text-sm text-forest-700">Discovery answers complete: {progress}%</p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Interest signals" text="Choose any signals that feel useful. The address updates so you can revisit or share this exploration state." />
            <div>
              <div className="flex flex-wrap gap-3">
                {INTEREST_SIGNALS.map((signal) => {
                  const selected = selectedSignals.includes(signal.value);
                  return (
                    <button
                      type="button"
                      key={signal.value}
                      onClick={() => toggleInterest(signal.value)}
                      aria-pressed={selected}
                      className={`interest-chip ${selected ? "interest-chip-selected" : ""}`}
                    >
                      {signal.label}{selected ? <Check size={15} aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                <button type="button" onClick={resetDiscovery} className="text-sm font-semibold text-forest-700 underline">Clear discovery</button>
                <span className="text-sm text-forest-700">{selectedSignals.length} interest signals selected</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Career reality sliders" text="Add the life conditions that matter: earning ambition, travel, stress and danger tolerance. These sliders help compare trade-offs, not judge ambition." />
            <div className="grid gap-5 md:grid-cols-2">
              {PREFERENCE_DEFINITIONS.map((preference) => (
                <PreferenceSlider
                  key={preference.id}
                  preference={preference}
                  value={lifestylePreferences[preference.id]}
                  onChange={updateLifestylePreference}
                />
              ))}
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950 md:col-span-2">
                <strong>Important:</strong> Careerize uses qualitative starter signals for earning potential, travel, stress and danger. South African salary bands, injury risks and demand data still require source-verified labour-market records before being shown as facts.
              </div>
            </div>
          </div>
        </section>

        <section id="matches" className="section-border bg-sage-50/80">
          <div className="mx-auto max-w-[1240px] px-5 py-16">
            <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
              <SectionIntro title="Exploration matches" text="These matches are based on the signals you selected. They are not admissions decisions. Subject and provider requirements must still be checked." />
              <div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                  <label className="text-sm font-semibold text-forest-800">
                    Search exploration routes
                    <span className="relative mt-2 block">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-600/60" size={18} aria-hidden="true" />
                      <input
                        type="search"
                        value={routeSearch}
                        onChange={(event) => setRouteSearch(event.target.value)}
                        className="w-full rounded-xl border border-sage-300 bg-cream-50 py-3 pl-11 pr-4 font-normal text-forest-900 placeholder:text-forest-600/50"
                        placeholder="Try data, nursing, plumbing or tourism"
                      />
                    </span>
                  </label>
                  <label className="text-sm font-semibold text-forest-800">
                    Filter by career cluster
                    <select value={streamFilter} onChange={(event) => setStreamFilter(event.target.value)} className="mt-2 w-full rounded-xl border border-sage-300 bg-cream-50 px-4 py-3 font-normal text-forest-900">
                      <option value="all">All career clusters</option>
                      {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
                    </select>
                  </label>
                </div>
                <p className="mt-5 rounded-xl border border-sage-300 bg-sage-100 p-4 text-sm leading-6 text-forest-800" aria-live="polite">
                  {hasDiscoveryInput
                    ? `${visibleRoutes.length} exploration matches shown. Ranking uses your selected answers, interest signals and career reality sliders.`
                    : hasRouteFilters
                      ? `${visibleRoutes.length} starter routes shown from your search or career-cluster filter. No personal fit is inferred.`
                    : "Choose an answer or interest signal to rank routes. These three routes are starter examples."}
                </p>
                {visibleRoutes.length ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleRoutes.map((route) => (
                      <ExplorationCard key={route.id} route={route} active={activePathwayId === route.id} hasInput={hasDiscoveryInput} onOpen={openPathway} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-sage-300 bg-cream-50 p-6 text-forest-800/80">No routes match those filters. Try a broader title, subject or career cluster.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="pathway-detail" className="section-border scroll-mt-24 bg-sage-100/70">
          <div className="mx-auto max-w-[1240px] px-5 py-16">
            {activeRoute && pathwayRecord ? (
              <PathwayDetail
                route={activeRoute}
                pathwayRecord={pathwayRecord}
                selectedSubjects={selectedSubjects}
                onToggleSubject={toggleSubject}
                headingRef={pathwayHeadingRef}
              />
            ) : (
              <p>No starter pathway is available for this route.</p>
            )}
          </div>
        </section>

        <section id="trust" className="section-border">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Trust, privacy and saving" text="The public launch keeps exploration available without creating an account." />
            <div className="grid gap-5 md:grid-cols-3">
              <TrustPoint icon={Lock} title="No public pseudo-account" text="This launch build does not offer browser-only email accounts. Real saved profiles require configured, tested account infrastructure." />
              <TrustPoint icon={Compass} title="Session exploration" text="Answers stay in the current app session. Selected interest signals and the open pathway appear in the URL so the route is linkable." />
              <TrustPoint icon={ShieldCheck} title="Clear guidance boundary" text="Every current pathway is starter template guidance. Provider-specific verification is required before subject or application decisions." />
            </div>
            <div className="rounded-xl border border-sage-300 bg-sage-50 p-5 text-sm leading-6 text-forest-800 md:col-start-2">
              <strong>Verified pathway</strong> is reserved for provider-specific information checked against source records. No current starter pathway carries that label.
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-sage-200 bg-cream-200/60">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 text-sm text-forest-800 md:flex-row md:items-center md:justify-between">
          <a href="#top" className="brand-wordmark">Careerize</a>
          <p>Explore possible routes. Verify the details.</p>
          <p>(c) 2026 Careerize - South Africa</p>
        </div>
      </footer>
    </>
  );
}

function GuidanceLabels() {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Current guidance status">
      <StatusBadge tone="leaf">Starter guidance</StatusBadge>
      <StatusBadge tone="cream">Template guidance</StatusBadge>
      <StatusBadge tone="amber">Needs provider verification</StatusBadge>
    </div>
  );
}

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    leaf: "border-sage-300 bg-sage-100 text-forest-800",
    cream: "border-cream-300 bg-cream-50 text-forest-800",
    amber: "border-amber-300 bg-amber-50 text-amber-900",
    green: "border-forest-300 bg-forest-50 text-forest-900",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

function HeroFact({ value, label }) {
  return <div><p className="font-extrabold">{value}</p><p className="mt-1 text-xs leading-5 text-sage-200">{label}</p></div>;
}

function SectionIntro({ title, text }) {
  return <div><h2 className="text-3xl font-extrabold tracking-[-0.035em] text-forest-950">{title}</h2><div className="accent-stroke mt-3 w-24" /><p className="mt-5 max-w-[260px] leading-7 text-forest-800/80">{text}</p></div>;
}

function matchedSignalLabels(route) {
  return route.explanation.matchedSignals
    .slice(0, 4)
    .map((item) => SIGNAL_LABELS.get(item.signal) ?? item.signal);
}

function PreferenceSlider({ preference, value, onChange }) {
  return (
    <label className="rounded-xl border border-sage-300 bg-cream-50 p-5">
      <span className="font-bold text-forest-950">{preference.label}</span>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(event) => onChange(preference.id, event.target.value)}
        className="mt-4 w-full accent-forest-700"
        aria-describedby={`${preference.id}-helper`}
      />
      <span className="mt-2 flex justify-between gap-3 text-xs font-semibold text-forest-700">
        <span>{preference.lowLabel}</span>
        <span>{preference.highLabel}</span>
      </span>
      <span id={`${preference.id}-helper`} className="mt-3 block text-sm leading-6 text-forest-800/80">{preference.helper}</span>
    </label>
  );
}

function ExplorationCard({ route, active, hasInput, onOpen }) {
  const matched = matchedSignalLabels(route);
  return (
    <article className={`flex min-h-[330px] flex-col rounded-xl border bg-cream-50 p-5 ${active ? "border-2 border-forest-700 shadow-[4px_4px_0_#a9c59f]" : "border-sage-300"}`}>
      <div className="flex items-start justify-between gap-3">
        <StatusBadge tone="leaf">Exploration match</StatusBadge>
        <span className="text-xs font-semibold text-forest-700">Starter profile</span>
      </div>
      <h3 className="mt-5 text-xl font-bold">{route.title}</h3>
      <p className="mt-1 text-xs font-semibold text-forest-700">{route.stream}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-forest-800/80">{route.summary}</p>
      <p className="mt-3 text-xs font-semibold text-forest-700">Reality signal: {route.preferenceFit.strongestPreference}</p>
      <div className="mt-5 rounded-lg bg-sage-50 p-3 text-sm leading-6 text-forest-800">
        <strong>Why this route:</strong>{" "}
        {hasInput && matched.length
          ? `It overlaps with ${matched.join(", ")}.`
          : "It is a starter example. Choose signals to create a ranked comparison."}
      </div>
      <button type="button" onClick={() => onOpen(route.id)} className="mt-auto flex items-center justify-between pt-6 text-left text-sm font-bold text-forest-700">
        <span>View pathway: {route.title}</span><ChevronRight size={18} aria-hidden="true" />
      </button>
    </article>
  );
}

function PathwayDetail({ route, pathwayRecord, selectedSubjects, onToggleSubject, headingRef }) {
  const pathway = pathwayRecord.academicPathway;
  const verified = pathwayRecord.verificationStatus === "verified_provider_specific";
  const subjectRisk = assessSubjectRisk(pathway, { currentSubjects: selectedSubjects });
  const matched = matchedSignalLabels(route);
  const riskTone = {
    green: "border-sage-300 bg-sage-100",
    amber: "border-amber-300 bg-amber-50",
    red: "border-red-300 bg-red-50",
    unknown: "border-sage-300 bg-cream-50",
  }[subjectRisk.level] ?? "border-sage-300 bg-cream-50";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {verified ? <StatusBadge tone="green">Verified pathway</StatusBadge> : <GuidanceLabels />}
      </div>
      <div className="mt-6 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-forest-700">Pathway detail</p>
          <h2 ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-[-0.04em] outline-none sm:text-5xl">{route.title}</h2>
          <p className="mt-3 font-semibold text-forest-800/80">Career cluster: {route.stream}</p>
          <p className="mt-6 leading-7 text-forest-800">{route.summary}</p>
          <div className="mt-6 rounded-xl border border-sage-300 bg-sage-50 p-5 text-sm leading-6 text-forest-800">
            <strong>Why this route matched:</strong>{" "}
            {matched.length ? `Your selected signals overlap with ${matched.join(", ")}.` : "This is a starter route shown before enough signals have been selected."}
            {" "}Signal overlap does not measure admission readiness, suitability or likelihood of success.
          </div>
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <strong>This is a starter pathway guide, not an admissions decision.</strong> Requirements vary by provider. Verify subjects, marks, APS, accreditation, availability and dates with the institution or provider before making subject or application choices.
          </div>
        </div>

        <div className="grid gap-5">
          <DetailSection title="Subject relevance">
            <div className="grid gap-3 sm:grid-cols-3">
              <SubjectNote label="Template signals to keep open" text={pathway.grade10Subjects.requiredOrStronglyRecommended.join(", ")} />
              <SubjectNote label="May be helpful" text={pathway.grade10Subjects.recommended.join(", ")} />
              <SubjectNote label="Check before dropping" text={pathway.grade10Subjects.avoidDropping.join(", ")} />
            </div>
            <p className="mt-4 text-sm leading-6 text-forest-800/80">{pathway.grade10Subjects.mathsGate}</p>
            <p className="mt-2 text-sm leading-6 text-forest-800/80">{pathway.grade10Subjects.scienceGate}</p>
          </DetailSection>

          <DetailSection title="Optional subject-risk check">
            <p className="text-sm leading-6 text-forest-800/80">Select current or planned subjects. This compares them with a broad template and cannot confirm provider entry.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const selected = selectedSubjects.includes(subject);
                return (
                  <button type="button" key={subject} onClick={() => onToggleSubject(subject)} aria-pressed={selected} className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${selected ? "border-forest-700 bg-sage-100 text-forest-800" : "border-sage-300 bg-cream-50 text-forest-800"}`}>
                    <span>{subject}</span>{selected ? <Check size={13} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            <div className={`mt-5 rounded-xl border p-4 ${riskTone}`} aria-live="polite">
              <p className="font-bold">{subjectRisk.label}</p>
              <p className="mt-2 text-sm leading-6 text-forest-800">{subjectRisk.summary}</p>
              <p className="mt-2 text-sm leading-6 text-forest-800/80">{subjectRisk.nextStep}</p>
            </div>
          </DetailSection>

          <DetailSection title="Career reality trade-offs">
            <div className="grid gap-3 sm:grid-cols-2">
              <SubjectNote label="Earning potential" text={route.earningPotential.label} />
              <SubjectNote label="Stress" text={route.stress} />
              <SubjectNote label="Travel or place" text={route.remote} />
              <SubjectNote label="Environment and safety" text={route.environment} />
            </div>
            <p className="mt-4 text-sm leading-6 text-forest-800/80">{route.preferenceFit.summary}</p>
          </DetailSection>

          <DetailSection title="Possible qualification routes">
            <div className="grid gap-3 sm:grid-cols-2">
              {pathway.qualificationRoutes.slice(0, 4).map((option) => (
                <article key={`${option.type}-${option.qualification}`} className="rounded-xl border border-sage-300 bg-cream-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-forest-700">{option.type.replaceAll("_", " ")}</p>
                  <h4 className="mt-2 font-bold">{option.qualification}</h4>
                  <p className="mt-2 text-sm leading-6 text-forest-800/80">Entry guide: {option.gate}</p>
                  <p className="mt-2 text-xs font-semibold text-amber-800">Template guidance · provider check required</p>
                </article>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Next exploration steps">
            <ol className="grid gap-3">
              {[
                "Compare this route with at least two alternatives.",
                `Ask a provider which subjects, marks, APS and additional selection steps apply to its ${route.title.toLowerCase()} route.`,
                `Speak to someone doing related work and test the route through a project, visit, shadowing opportunity or introductory course.`,
              ].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl bg-sage-50 p-4 text-sm leading-6 text-forest-800"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-700 font-bold text-white">{index + 1}</span>{step}</li>
              ))}
            </ol>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return <section className="rounded-2xl border border-sage-200 bg-cream-50 p-5 sm:p-6"><h3 className="text-xl font-extrabold text-forest-950">{title}</h3><div className="mt-4">{children}</div></section>;
}

function SubjectNote({ label, text }) {
  return <div className="rounded-xl bg-sage-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-forest-700">{label}</p><p className="mt-2 text-sm leading-6 text-forest-800">{text || "No template note available."}</p></div>;
}

function TrustPoint({ icon: Icon, title, text }) {
  return <div className="rounded-xl border border-sage-200 bg-cream-50 p-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-forest-700 text-white"><Icon size={20} aria-hidden="true" /></span><h3 className="mt-4 font-bold text-forest-950">{title}</h3><p className="mt-2 text-sm leading-6 text-forest-800/80">{text}</p></div>;
}
