import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  CornerDownRight,
  Lock,
  Map as MapIcon,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
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
const WORD_MAP_NODES = [
  { id: "data", routeId: "data-analyst", label: "Data", meta: "analysis", x: 50, y: 43, z: 118, scale: 1.08, tone: "green" },
  { id: "software", routeId: "software-developer", label: "Software", meta: "build", x: 20, y: 28, z: 76, scale: 0.96, tone: "teal" },
  { id: "nursing", routeId: "registered-nurse", label: "Nursing", meta: "care", x: 81, y: 28, z: 72, scale: 0.94, tone: "amber" },
  { id: "trades", routeId: "technical-artisan", label: "Trades", meta: "hands-on", x: 17, y: 61, z: 56, scale: 0.9, tone: "amber" },
  { id: "teaching", routeId: "teacher", label: "Teaching", meta: "people", x: 82, y: 59, z: 58, scale: 0.9, tone: "green" },
  { id: "tourism", routeId: "chef", label: "Tourism", meta: "service", x: 69, y: 82, z: 38, scale: 0.82, tone: "teal" },
  { id: "design", routeId: "graphic-designer", label: "Design", meta: "creative", x: 32, y: 82, z: 42, scale: 0.84, tone: "pink" },
  { id: "finance", routeId: "bookkeeper", label: "Finance", meta: "numbers", x: 50, y: 20, z: 30, scale: 0.78, tone: "teal" },
  { id: "environment", routeId: "environmental-scientist", label: "Environment", meta: "field", x: 65, y: 70, z: 24, scale: 0.75, tone: "green" },
  { id: "logistics", routeId: "logistics-manager", label: "Logistics", meta: "movement", x: 41, y: 72, z: 18, scale: 0.75, tone: "teal" },
  { id: "law", routeId: "attorney", label: "Law", meta: "public", x: 15, y: 43, z: 20, scale: 0.78, tone: "pink" },
  { id: "business", routeId: "chief-executive-officer", label: "Business", meta: "growth", x: 85, y: 43, z: 20, scale: 0.78, tone: "amber" },
  { id: "maths", routeId: "mathematics-teacher", label: "Maths", meta: "subject", x: 51, y: 90, z: 10, scale: 0.74, tone: "green" },
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
  const [activeWordNodeId, setActiveWordNodeId] = useState("data");
  const [entryMode, setEntryMode] = useState("existing");
  const directSearchRef = useRef(null);
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
  const searchEntryResults = useMemo(() => {
    const search = routeSearch.trim().toLowerCase();
    const source = search ? CAREER_ROUTES : starterRoutes;
    return source
      .filter((route) => {
        if (!search) return true;
        const searchable = [route.title, route.stream, route.summary, ...(route.subjects ?? [])]
          .join(" ")
          .toLowerCase();
        return searchable.includes(search);
      })
      .slice(0, 4);
  }, [routeSearch, starterRoutes]);
  const activeRoute = ranked.find((route) => route.id === activePathwayId) ?? visibleRoutes[0] ?? ranked[0];
  const pathwayRecord = activeRoute ? getAcademicPathwayForCareer(activeRoute.id) : null;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);
  const currentQuestion = DISCOVERY_QUESTIONS[questionStep];
  const activeWordNode = WORD_MAP_NODES.find((node) => node.id === activeWordNodeId) ?? WORD_MAP_NODES[0];
  const activeWordRoute = CAREER_ROUTES.find((route) => route.id === activeWordNode.routeId) ?? ranked[0];
  const hasWordMapInput = entryMode === "word-map";

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
    setEntryMode("discovery");
    setActivePathwayId(null);
  }

  function toggleInterest(signal) {
    setSelectedSignals((current) => toggleSignal(current, signal));
    setEntryMode("discovery");
    setActivePathwayId(null);
  }

  function updateLifestylePreference(id, value) {
    setLifestylePreferences((current) => ({ ...current, [id]: Number(value) }));
    setEntryMode("discovery");
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
    setEntryMode("existing");
  }

  function advanceDiscovery() {
    if (questionStep < DISCOVERY_QUESTIONS.length - 1) {
      setQuestionStep((step) => step + 1);
      return;
    }
    document.querySelector("#matches")?.scrollIntoView({ behavior: "smooth" });
  }

  function jumpToSection(sectionId) {
    document.querySelector(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleRouteSearchSubmit(event) {
    event.preventDefault();
    setEntryMode("existing");
    jumpToSection("#matches");
  }

  function handleCareerSearchSubmit(event) {
    event.preventDefault();
    setEntryMode("existing");
    const firstMatch = searchEntryResults[0];
    if (firstMatch) openPathway(firstMatch.id);
    else jumpToSection("#matches");
  }

  function handleWordMapSelect(node) {
    setActiveWordNodeId(node.id);
    const route = CAREER_ROUTES.find((item) => item.id === node.routeId);
    if (route) {
      setRouteSearch(route.title);
      setStreamFilter(route.stream);
    }
    setEntryMode("word-map");
    setActivePathwayId(null);
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-sage-200 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5">
          <a href="#top" className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="#career-search">Career search</a>
            <a href="#word-graph">Word graph</a>
            <a href="#matches">Routes</a>
            <a href="#pathway-detail">Pathway guide</a>
          </nav>
          <a href="#career-search" className="primary-button hidden md:inline-flex">Search careers</a>
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
          <nav id="mobile-navigation" className="grid gap-4 border-t border-sage-200 bg-cream-100 px-5 py-5 text-sm font-semibold md:hidden" aria-label="Mobile navigation">
            <a href="#career-search" onClick={() => setMobileNavOpen(false)}>Career search</a>
            <a href="#word-graph" onClick={() => setMobileNavOpen(false)}>Word graph</a>
            <a href="#matches" onClick={() => setMobileNavOpen(false)}>Routes</a>
            <a href="#pathway-detail" onClick={() => setMobileNavOpen(false)}>Pathway guide</a>
          </nav>
        ) : null}
      </header>

      <main id="main-content">
        <section id="top" className="home-entry mx-auto max-w-[1240px] px-5 py-10 lg:py-14">
          <div className="home-entry-heading">
            <p className="text-sm font-bold uppercase text-forest-700">Careerize route entry</p>
            <h1 className="mt-4 max-w-[820px] text-[42px] font-extrabold leading-[1.02] sm:text-6xl">
              Search a career, or explore the word graph.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-forest-800/80">
              Pick one path in. Search opens the career profile flow. The graph helps you compare real-world career signals before opening a full profile.
            </p>
          </div>

          <div className="home-entry-grid mt-8">
            <CareerSearchEntry
              query={routeSearch}
              results={searchEntryResults}
              inputRef={directSearchRef}
              onQueryChange={(value) => {
                setRouteSearch(value);
                setEntryMode("existing");
              }}
              onSubmit={handleCareerSearchSubmit}
              onOpen={openPathway}
            />
            <WordGraph
              nodes={WORD_MAP_NODES}
              activeNode={activeWordNode}
              activeRoute={activeWordRoute}
              coverage={CAREER_COVERAGE_SUMMARY.totalRoutes}
              onPreview={setActiveWordNodeId}
              onSelect={handleWordMapSelect}
              onOpen={openPathway}
            />
          </div>
        </section>

        <section id="discover" className="section-border bg-sage-50/80">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Refine matches" text="Optional prompts help compare routes after you enter through search or the word graph. They do not determine eligibility or readiness." />
            <div>
              <div className="discovery-ribbon mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4 text-sm text-forest-900">
                <p className="max-w-2xl leading-6"><strong>Optional layer:</strong> answer a few prompts, add interest signals if you want, then compare routes that seem worth investigating further.</p>
                <span className="rounded-full border border-forest-300 bg-white/70 px-3 py-1 font-semibold">Refinement</span>
              </div>
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
                      data-testid="discovery-option"
                      data-question-id={currentQuestion.id}
                      data-option-value={option.value}
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
              <p className="mt-5 text-sm text-forest-700">Refinement answers complete: {progress}%</p>
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
            <SectionIntro title="Signals to refine" text="Choose any signals that feel useful. The address updates so you can revisit or share this exploration state." />
            <div>
              <div className="flex flex-wrap gap-3">
                {INTEREST_SIGNALS.map((signal) => {
                  const selected = selectedSignals.includes(signal.value);
                  return (
                    <button
                      type="button"
                      key={signal.value}
                      data-testid="interest-signal"
                      data-signal-value={signal.value}
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
                <button type="button" onClick={resetDiscovery} className="text-sm font-semibold text-forest-700 underline">Clear refinements</button>
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
              <SectionIntro title="Route explorer" text="This area serves both entry points. Use ranked matches after guided discovery, or use direct search and cluster browsing when you already have an idea." />
              <div>
                <div className="route-mode-banner mb-5 grid gap-3 rounded-2xl border border-sage-300 bg-cream-50 p-4 sm:grid-cols-2">
                  <RouteModeBadge
                    title="Word graph or refinement"
                    active={hasDiscoveryInput || hasWordMapInput}
                    text="Ranking is using your prompt answers, selected word terms, interest signals or career-reality sliders."
                  />
                  <RouteModeBadge
                    title="Existing path"
                    active={!hasDiscoveryInput && !hasWordMapInput}
                    text="Search and cluster filters let you inspect routes directly without implying personal fit."
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                  <label className="text-sm font-semibold text-forest-800">
                    Search routes directly
                    <span className="relative mt-2 block">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-600/60" size={18} aria-hidden="true" />
                      <input
                        type="search"
                        value={routeSearch}
                        onChange={(event) => {
                          setRouteSearch(event.target.value);
                          setEntryMode("existing");
                        }}
                        className="w-full rounded-xl border border-sage-300 bg-cream-50 py-3 pl-11 pr-4 font-normal text-forest-900 placeholder:text-forest-600/50"
                        placeholder="Try data, nursing, plumbing or tourism"
                      />
                    </span>
                  </label>
                  <label className="text-sm font-semibold text-forest-800">
                    Filter by career cluster
                    <select
                      value={streamFilter}
                      onChange={(event) => {
                        setStreamFilter(event.target.value);
                        setEntryMode("existing");
                      }}
                      className="mt-2 w-full rounded-xl border border-sage-300 bg-cream-50 px-4 py-3 font-normal text-forest-900"
                    >
                      <option value="all">All career clusters</option>
                      {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
                    </select>
                  </label>
                </div>
                <p className="mt-5 rounded-xl border border-sage-300 bg-sage-100 p-4 text-sm leading-6 text-forest-800" aria-live="polite">
                  {hasDiscoveryInput
                    ? `${visibleRoutes.length} exploration matches shown. Ranking uses your selected answers, interest signals and career reality sliders.`
                    : hasWordMapInput
                      ? `${visibleRoutes.length} starter routes shown from the word graph term "${activeWordNode.label}". No personal fit is inferred.`
                    : hasRouteFilters
                      ? `${visibleRoutes.length} starter routes shown from your search or career-cluster filter. No personal fit is inferred.`
                    : "Use guided discovery to rank routes, or search directly if you already have a direction. These three routes are starter examples."}
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

function CareerSearchEntry({ query, results, inputRef, onQueryChange, onSubmit, onOpen }) {
  return (
    <section id="career-search" className="entry-panel entry-panel-primary" aria-labelledby="career-search-title">
      <div className="entry-panel-heading">
        <span>Entry 1</span>
        <h2 id="career-search-title">Search a career</h2>
        <p>Type a career, field or subject. Open a result to see the profile, subject signals, route options and next checks.</p>
      </div>
      <form className="career-search-form" onSubmit={onSubmit}>
        <label htmlFor="direct-route-search">Career search</label>
        <div className="career-search-control">
          <Search className="career-search-icon" size={18} aria-hidden="true" />
          <input
            id="direct-route-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try Data Analyst, Nurse, Electrician or Design"
          />
          <button type="submit">Open first match <CornerDownRight size={17} aria-hidden="true" /></button>
        </div>
      </form>
      <div className="career-search-results" aria-live="polite">
        <p className="career-search-results-label">{query.trim() ? `${results.length} matching careers` : "Suggested careers"}</p>
        {results.length ? (
          <div className="career-result-list">
            {results.map((route) => (
              <button key={route.id} type="button" className="career-result" onClick={() => onOpen(route.id)}>
                <span>
                  <strong>{route.title}</strong>
                  <small>{route.stream}</small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <p className="career-no-results">No direct match yet. Try a broader field such as data, care, business, trades or tourism.</p>
        )}
      </div>
    </section>
  );
}

function WordGraph({ nodes, activeNode, activeRoute, coverage, onPreview, onSelect, onOpen }) {
  const edges = nodes.filter((node) => node.id !== activeNode.id).slice(0, 8);
  const compactSignal = (value, limit = 92) => {
    if (!value) return "Check the full profile.";
    if (value.length <= limit) return value;
    const clipped = value.slice(0, limit).replace(/\s+\S*$/, "");
    return `${clipped}...`;
  };
  const usefulSubjects = activeRoute.subjects?.slice(0, 2).join(", ") || "Check provider requirements";
  return (
    <section id="word-graph" className="entry-panel word-map-shell" aria-labelledby="word-map-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-forest-700">Entry 2</p>
          <h2 id="word-map-title" className="mt-2 text-2xl font-extrabold text-forest-950">Word graph</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-forest-800/75">Tap a word to preview what the work is really like, then open the full profile.</p>
        </div>
        <span className="word-map-count"><MapIcon size={16} aria-hidden="true" /> {coverage}+ routes</span>
      </div>
      <div className="word-map-stage" role="list" aria-label="Career word graph">
        <svg className="word-graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((node) => (
            <line
              key={`${activeNode.id}-${node.id}`}
              x1={activeNode.x}
              y1={activeNode.y}
              x2={node.x}
              y2={node.y}
              className={node.tone === activeNode.tone ? "word-graph-edge word-graph-edge-strong" : "word-graph-edge"}
            />
          ))}
        </svg>
        <div className="word-map-core" aria-hidden="true" />
        {nodes.map((node) => {
          const active = activeNode.id === node.id;
          return (
            <div
              key={node.id}
              role="listitem"
              className="word-map-point"
              style={{
                "--x": `${node.x}%`,
                "--y": `${node.y}%`,
                "--z": `${node.z}px`,
                "--scale": node.scale,
              }}
            >
              <button
                type="button"
                className={`word-map-node word-map-node-${node.tone} ${active ? "word-map-node-active" : ""}`}
                onMouseEnter={() => onPreview(node.id)}
                onFocus={() => onPreview(node.id)}
                onClick={() => onSelect(node)}
                aria-pressed={active}
                aria-label={`${node.label}: ${node.meta}`}
              >
                <span>{node.label}</span>
                <small>{node.meta}</small>
              </button>
            </div>
          );
        })}
      </div>
      <div className="real-world-panel" aria-live="polite">
        <div>
          <p className="text-xs font-bold uppercase text-forest-700">Real-world signal to confirm</p>
          <h3>{activeRoute.title}</h3>
          <p>{compactSignal(activeRoute.day, 96)}</p>
        </div>
        <dl>
          <div>
            <dt>Work setting</dt>
            <dd>{compactSignal(activeRoute.environment, 72)}</dd>
          </div>
          <div>
            <dt>Pressure signal</dt>
            <dd>{compactSignal(activeRoute.stress, 72)}</dd>
          </div>
          <div>
            <dt>Useful subjects</dt>
            <dd>{usefulSubjects}</dd>
          </div>
        </dl>
        <button type="button" className="secondary-button w-full justify-between" onClick={() => onOpen(activeRoute.id)}>
          Open full profile <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function SectionIntro({ title, text }) {
  return <div><h2 className="text-3xl font-extrabold tracking-normal text-forest-950">{title}</h2><div className="accent-stroke mt-3 w-24" /><p className="mt-5 max-w-[260px] leading-7 text-forest-800/80">{text}</p></div>;
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
        data-testid="preference-slider"
        data-preference-id={preference.id}
        onChange={(event) => onChange(preference.id, event.target.value)}
        className="mt-4 w-full accent-forest-700"
        aria-label={preference.label}
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

function RouteModeBadge({ title, text, active }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-forest-700 bg-sage-100" : "border-sage-200 bg-white"}`}>
      <p className="text-xs font-bold uppercase tracking-normal text-forest-700">{title}</p>
      <p className="mt-2 text-sm leading-6 text-forest-800/80">{text}</p>
    </div>
  );
}

function ExplorationCard({ route, active, hasInput, onOpen }) {
  const matched = matchedSignalLabels(route);
  return (
    <article data-testid="route-card" data-route-id={route.id} className={`flex min-h-[330px] flex-col rounded-xl border bg-cream-50 p-5 ${active ? "border-2 border-forest-700 shadow-[4px_4px_0_#a9c59f]" : "border-sage-300"}`}>
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
      <button type="button" data-testid="route-open" data-route-id={route.id} onClick={() => onOpen(route.id)} className="mt-auto flex items-center justify-between pt-6 text-left text-sm font-bold text-forest-700">
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
          <p className="text-sm font-bold uppercase tracking-normal text-forest-700">Pathway detail</p>
          <h2 ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-normal outline-none sm:text-5xl">{route.title}</h2>
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
                  <button type="button" key={subject} data-testid="subject-toggle" data-subject={subject} onClick={() => onToggleSubject(subject)} aria-pressed={selected} className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold ${selected ? "border-forest-700 bg-sage-100 text-forest-800" : "border-sage-300 bg-cream-50 text-forest-800"}`}>
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
                  <p className="text-xs font-bold uppercase tracking-normal text-forest-700">{option.type.replaceAll("_", " ")}</p>
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
  return <div className="rounded-xl bg-sage-50 p-4"><p className="text-xs font-bold uppercase tracking-normal text-forest-700">{label}</p><p className="mt-2 text-sm leading-6 text-forest-800">{text || "No template note available."}</p></div>;
}

function TrustPoint({ icon: Icon, title, text }) {
  return <div className="rounded-xl border border-sage-200 bg-cream-50 p-5"><span className="grid h-11 w-11 place-items-center rounded-full bg-forest-700 text-white"><Icon size={20} aria-hidden="true" /></span><h3 className="mt-4 font-bold text-forest-950">{title}</h3><p className="mt-2 text-sm leading-6 text-forest-800/80">{text}</p></div>;
}
