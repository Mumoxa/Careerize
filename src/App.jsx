import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CornerDownRight,
  Menu,
  Network,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { CAREER_COVERAGE_SUMMARY, CAREER_ROUTES, INTEREST_CATEGORIES, INTEREST_SELECTION_LIMIT, INTEREST_SIGNALS } from "./data/careerCatalog.js";
import { getAcademicPathwayForCareer } from "./data/careerPathwayGraph.js";
import { assessSubjectRisk } from "./lib/subjectRisk.js";
import {
  DEFAULT_LIFESTYLE_PREFERENCES,
  PREFERENCE_DEFINITIONS,
  getInterestRecommendationDetails,
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
  const [selectedSignals, setSelectedSignals] = useState(initial.signals);
  const [activePathwayId, setActivePathwayId] = useState(initial.pathwayId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [lifestylePreferences, setLifestylePreferences] = useState(DEFAULT_LIFESTYLE_PREFERENCES);
  const [interestSearch, setInterestSearch] = useState("");
  const [activeInterestCategory, setActiveInterestCategory] = useState("all");
  const [interestLimitMessage, setInterestLimitMessage] = useState("");
  const [entryMode, setEntryMode] = useState("existing");
  const pathwayHeadingRef = useRef(null);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, {}, selectedSignals, lifestylePreferences),
    [selectedSignals, lifestylePreferences]
  );
  const hasPreferenceInput = Object.entries(lifestylePreferences).some(([key, value]) => value !== DEFAULT_LIFESTYLE_PREFERENCES[key]);
  const hasInterestInput = selectedSignals.length > 0;
  const hasDiscoveryInput = hasInterestInput || hasPreferenceInput;
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
  const hasWordMapInput = entryMode === "word-map";
  const interestRecommendations = useMemo(() => {
    if (!hasInterestInput && !hasPreferenceInput) return [];
    const source = hasInterestInput ? ranked.filter((route) => route.signalScore > 0) : ranked;
    return source.slice(0, 4);
  }, [hasInterestInput, hasPreferenceInput, ranked]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (activePathwayId) url.searchParams.set("pathway", activePathwayId);
    else url.searchParams.delete("pathway");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activePathwayId, selectedSignals]);

  function toggleInterest(signal) {
    setSelectedSignals((current) => {
      const alreadySelected = current.includes(signal);
      if (!alreadySelected && current.length >= INTEREST_SELECTION_LIMIT) {
        setInterestLimitMessage(`You can select up to ${INTEREST_SELECTION_LIMIT} interests. Remove one before adding another.`);
        return current;
      }
      setInterestLimitMessage("");
      return toggleSignal(current, signal);
    });
    setEntryMode("word-map");
    setActivePathwayId(null);
  }

  function updateLifestylePreference(id, value) {
    setLifestylePreferences((current) => ({ ...current, [id]: Number(value) }));
    setEntryMode("word-map");
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
    setSelectedSignals([]);
    setActivePathwayId(null);
    setInterestSearch("");
    setActiveInterestCategory("all");
    setInterestLimitMessage("");
    setRouteSearch("");
    setStreamFilter("all");
    setLifestylePreferences(DEFAULT_LIFESTYLE_PREFERENCES);
    setEntryMode("existing");
  }

  function jumpToSection(sectionId) {
    document.querySelector(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCareerSearchSubmit(event) {
    event.preventDefault();
    setEntryMode("existing");
    const firstMatch = searchEntryResults[0];
    if (firstMatch) openPathway(firstMatch.id);
    else jumpToSection("#matches");
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-sage-200 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5">
          <a href="#top" className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="#word-graph">Start with interests</a>
            <a href="#matches">Explore paths</a>
            <a href="#pathway-detail">Pathway guide</a>
          </nav>
          <a href="#word-graph" className="primary-button hidden md:inline-flex">Start with what you like</a>
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
            <a href="#word-graph" onClick={() => setMobileNavOpen(false)}>Start with interests</a>
            <a href="#matches" onClick={() => setMobileNavOpen(false)}>Explore paths</a>
            <a href="#pathway-detail" onClick={() => setMobileNavOpen(false)}>Pathway guide</a>
          </nav>
        ) : null}
      </header>

      <main id="main-content">
        <section id="top" className="home-entry mx-auto max-w-[1240px] px-5 py-10 lg:py-14">
          <div className="home-entry-heading">
            <p className="text-sm font-bold uppercase text-forest-700">Careerize career exploration</p>
            <h1 className="mt-4 max-w-[840px] text-[42px] font-extrabold leading-[1.02] sm:text-6xl">
              Turn interests into career paths you can explore.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-forest-800/80">
              Careerize helps young people connect raw interests, personal decision preferences and career-impact factors to realistic route options, skills, clusters, trade-offs and learning steps.
            </p>
          </div>

          <div className="home-entry-grid mt-8" aria-label="Choose how to begin">
            <a href="#word-graph" className="entry-choice entry-choice-primary">
              <span className="entry-choice-kicker">Entry path A</span>
              <strong>Start with what you like</strong>
              <span>Pick interest words, tune the decision sliders, then see which career paths may be worth exploring.</span>
              <span className="entry-choice-action">Open the word map <ArrowRight size={17} aria-hidden="true" /></span>
            </a>
            <a href="#matches" className="entry-choice">
              <span className="entry-choice-kicker">Entry path B</span>
              <strong>Explore career paths</strong>
              <span>Search or filter starter profiles directly when you already have a career, subject or cluster in mind.</span>
              <span className="entry-choice-action">Browse career paths <ArrowRight size={17} aria-hidden="true" /></span>
            </a>
          </div>
        </section>

        <section id="word-graph" className="section-border bg-sage-50/80">
          <div className="mx-auto max-w-[1240px] px-5 py-16">
            <InterestWordMap
              categories={INTEREST_CATEGORIES}
              interests={INTEREST_SIGNALS}
              selectedSignals={selectedSignals}
              selectedCount={selectedSignals.length}
              selectionLimit={INTEREST_SELECTION_LIMIT}
              search={interestSearch}
              activeCategory={activeInterestCategory}
              preferences={lifestylePreferences}
              recommendations={interestRecommendations}
              limitMessage={interestLimitMessage}
              hasPreferenceInput={hasPreferenceInput}
              onSearchChange={setInterestSearch}
              onCategoryChange={setActiveInterestCategory}
              onToggleInterest={toggleInterest}
              onPreferenceChange={updateLifestylePreference}
              onReset={resetDiscovery}
              onOpen={openPathway}
            />
          </div>
        </section>

        <section id="matches" className="section-border bg-sage-50/80">
          <div className="mx-auto max-w-[1240px] px-5 py-16">
            <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
              <SectionIntro title="Explore career paths" text="Search directly or browse by cluster. Interest and slider choices from the word map can still shape the order shown here." />
              <div>
                <div className="route-mode-banner mb-5 grid gap-3 rounded-2xl border border-sage-300 bg-cream-50 p-4 sm:grid-cols-2">
                  <RouteModeBadge
                    title="Exploration matches"
                    active={hasDiscoveryInput || hasWordMapInput}
                    text="Ranking is using selected interest words and career-reality sliders."
                  />
                  <RouteModeBadge
                    title="Direct career search"
                    active={!hasDiscoveryInput && !hasWordMapInput}
                    text="Search and cluster filters let you inspect routes directly without implying personal fit."
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-[1.35fr_0.85fr]">
                  <form className="career-search-form mt-0" onSubmit={handleCareerSearchSubmit}>
                    <label htmlFor="direct-route-search">Career search</label>
                    <div className="career-search-control">
                      <Search className="career-search-icon" size={18} aria-hidden="true" />
                      <input
                        id="direct-route-search"
                        type="search"
                        value={routeSearch}
                        onChange={(event) => {
                          setRouteSearch(event.target.value);
                          setEntryMode("existing");
                        }}
                        placeholder="Try Data Analyst, Nurse, Electrician or Design"
                      />
                      <button type="submit">Open first match <CornerDownRight size={17} aria-hidden="true" /></button>
                    </div>
                  </form>
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
                    ? `${visibleRoutes.length} exploration paths shown. Ranking uses your selected interests and career reality sliders.`
                    : hasWordMapInput
                      ? `${visibleRoutes.length} starter routes shown from the word map. No personal fit is inferred.`
                    : hasRouteFilters
                      ? `${visibleRoutes.length} starter routes shown from your search or career-cluster filter. No personal fit is inferred.`
                    : "Start with interests to rank paths, or search directly if you already have a direction. These three routes are starter examples."}
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

const CATEGORY_TONES = {
  "digital-technology": "teal",
  "creative-building": "amber",
  "academic-systems": "blue",
  "health-impact": "green",
  "business-enterprise": "violet",
  "communication-influence": "pink",
  "work-style": "slate",
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function layoutInterestNodes(interests) {
  const count = Math.max(1, interests.length);
  const radii = [18, 29, 40];
  return interests.map((interest, index) => {
    const ring = index % radii.length;
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2 + ring * 0.34;
    const radius = radii[ring];
    return {
      ...interest,
      x: clamp(50 + Math.cos(angle) * radius, 8, 92),
      y: clamp(52 + Math.sin(angle) * radius * 0.72, 12, 88),
      z: 22 + ring * 30 + (index % 5) * 4,
      scale: ring === 0 ? 0.98 : ring === 1 ? 0.88 : 0.78,
      tone: CATEGORY_TONES[interest.category] ?? "green",
    };
  });
}

function InterestWordMap({
  categories,
  interests,
  selectedSignals,
  selectedCount,
  selectionLimit,
  search,
  activeCategory,
  preferences,
  recommendations,
  limitMessage,
  hasPreferenceInput,
  onSearchChange,
  onCategoryChange,
  onToggleInterest,
  onPreferenceChange,
  onReset,
  onOpen,
}) {
  const deferredSearch = useDeferredValue(search);
  const categoryIndex = useMemo(() => new Map(categories.map((category) => [category.id, category.label])), [categories]);
  const selectedSet = useMemo(() => new Set(selectedSignals), [selectedSignals]);
  const selectedInterests = interests.filter((interest) => selectedSet.has(interest.value));
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredInterests = interests.filter((interest) => {
    const matchesCategory = activeCategory === "all" || interest.category === activeCategory;
    const searchable = [interest.label, categoryIndex.get(interest.category), interest.why, ...(interest.skills ?? [])].join(" ").toLowerCase();
    return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
  const graphNodes = layoutInterestNodes(filteredInterests);
  const limitReached = selectedCount >= selectionLimit;
  const hasRecommendationInput = selectedCount > 0 || hasPreferenceInput;

  return (
    <section className="word-map-experience" aria-labelledby="word-map-title">
      <div className="word-map-heading">
        <div>
          <p className="text-sm font-bold uppercase text-forest-700">Entry path A</p>
          <h2 id="word-map-title">Interest word map</h2>
          <p>
            Select up to {selectionLimit} mapped interests, tune the sliders, then compare career paths that may connect to those signals.
          </p>
        </div>
        <div className="word-map-status">
          <span><Network size={17} aria-hidden="true" /> {CAREER_COVERAGE_SUMMARY.totalRoutes} mapped routes</span>
          <strong data-testid="selected-interest-count">{selectedCount} / {selectionLimit} selected</strong>
        </div>
      </div>

      <div className="decision-panel" aria-labelledby="decision-sliders-title">
        <div className="decision-panel-heading">
          <SlidersHorizontal size={22} aria-hidden="true" />
          <div>
            <h3 id="decision-sliders-title">Decision-driving sliders</h3>
            <p>These sliders affect ranking through the existing qualitative scorer. They compare trade-offs; they do not decide eligibility or success.</p>
          </div>
        </div>
        <div className="decision-slider-grid">
          {PREFERENCE_DEFINITIONS.map((preference) => (
            <PreferenceSlider
              key={preference.id}
              preference={preference}
              value={preferences[preference.id]}
              onChange={onPreferenceChange}
            />
          ))}
        </div>
        <p className="decision-note">
          Careerize uses qualitative starter signals for earning potential, travel, pressure and physical risk. Salary bands, injury rates and demand claims still need source-verified labour-market records before being shown as facts.
        </p>
      </div>

      <div className="word-map-controls">
        <label htmlFor="interest-search">
          Search interests
          <span className="relative mt-2 block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-600/60" size={18} aria-hidden="true" />
            <input
              id="interest-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Try tools, care, data, business or science"
            />
          </span>
        </label>
        <div className="interest-category-list" aria-label="Interest categories">
          <button
            type="button"
            className={activeCategory === "all" ? "interest-category-active" : ""}
            onClick={() => onCategoryChange("all")}
          >
            All mapped interests
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={activeCategory === category.id ? "interest-category-active" : ""}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="word-map-workspace">
        <div className="word-map-stage" role="list" aria-label="Mapped interest keywords">
          <svg className="word-graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {graphNodes.map((node) => (
              <line
                key={`edge-${node.value}`}
                x1="50"
                y1="52"
                x2={node.x}
                y2={node.y}
                className={selectedSet.has(node.value) ? "word-graph-edge word-graph-edge-strong" : "word-graph-edge"}
              />
            ))}
          </svg>
          <div className="word-map-core" aria-hidden="true">
            <span>interest</span>
            <strong>signals</strong>
          </div>
          {graphNodes.length ? graphNodes.map((node) => {
            const selected = selectedSet.has(node.value);
            const disabled = !selected && limitReached;
            return (
              <div
                key={node.value}
                role="listitem"
                className="word-map-point"
                style={{
                  "--x": `${node.x}%`,
                  "--y": `${node.y}%`,
                  "--z": `${node.z}px`,
                  "--scale": selected ? node.scale + 0.08 : node.scale,
                }}
              >
                <button
                  type="button"
                  data-testid="interest-signal"
                  data-signal-value={node.value}
                  className={`word-map-node word-map-node-${node.tone} ${selected ? "word-map-node-active" : ""}`}
                  onClick={() => onToggleInterest(node.value)}
                  aria-pressed={selected}
                  disabled={disabled}
                  aria-label={`${node.label}. ${categoryIndex.get(node.category)}. ${node.why}`}
                >
                  <span>{node.label}</span>
                  <small>{categoryIndex.get(node.category)}</small>
                  {selected ? <Check size={14} aria-hidden="true" /> : null}
                </button>
              </div>
            );
          }) : (
            <div className="word-map-empty" role="status">No mapped interest matches that search or category.</div>
          )}
        </div>

        <aside className="word-map-side" aria-label="Selected interests and career path suggestions">
          <div className="selected-interest-panel">
            <div className="flex items-center justify-between gap-3">
              <h3>Selected interests</h3>
              <button type="button" className="reset-map-button" onClick={onReset}>
                <RotateCcw size={16} aria-hidden="true" /> Reset word map
              </button>
            </div>
            {selectedInterests.length ? (
              <div className="selected-interest-list">
                {selectedInterests.map((interest) => (
                  <button key={interest.value} type="button" onClick={() => onToggleInterest(interest.value)} aria-label={`Remove ${interest.label}`}>
                    {interest.label} <X size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="empty-state-copy">Choose interest words in the map to see how they connect to skills, clusters and career paths.</p>
            )}
            <p className="limit-message" aria-live="polite">
              {limitMessage || (limitReached ? `Limit reached: remove one interest before adding another.` : `${selectionLimit - selectedCount} selections left.`)}
            </p>
          </div>

          <div className="recommendation-panel">
            <h3>Career paths to explore</h3>
            {hasRecommendationInput && recommendations.length ? (
              <>
                <p className="recommendation-summary" aria-live="polite">
                  Showing {recommendations.length} paths shaped by selected interests{hasPreferenceInput ? " and slider choices" : ""}.
                </p>
                <div className="recommendation-list">
                  {recommendations.map((route) => (
                    <ExplorationCard
                      key={route.id}
                      route={route}
                      active={false}
                      hasInput={hasRecommendationInput}
                      recommendationDetails={getInterestRecommendationDetails(route, selectedSignals, preferences, interests, PREFERENCE_DEFINITIONS)}
                      onOpen={onOpen}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-state-copy">No path is suggested yet. Select at least one mapped interest or adjust a slider to start comparing routes.</p>
            )}
          </div>
        </aside>
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

function ExplorationCard({ route, active, hasInput, recommendationDetails, onOpen }) {
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
      {recommendationDetails ? (
        <div className="recommendation-detail-block">
          <p><strong>Why this path may fit:</strong> {recommendationDetails.why}</p>
          {recommendationDetails.contributingInterests.length ? (
            <p><strong>Selected interests:</strong> {recommendationDetails.contributingInterests.join(", ")}</p>
          ) : null}
          {recommendationDetails.relatedSkills.length ? (
            <p><strong>Related skills:</strong> {recommendationDetails.relatedSkills.join(", ")}</p>
          ) : null}
          <p><strong>Often involves:</strong> {route.day}</p>
          <p><strong>Possible learning route:</strong> {recommendationDetails.learningRoute}</p>
          {recommendationDetails.sliderInfluences.length ? (
            <div>
              <strong>Slider influence:</strong>
              <ul>
                {recommendationDetails.sliderInfluences.map((influence) => (
                  <li key={influence.id}>{influence.label}: {influence.learnerChoice}; route signal is {influence.routeSignal.toLowerCase()} ({influence.fitLabel}).</li>
                ))}
              </ul>
            </div>
          ) : null}
          {recommendationDetails.tradeOffs.length ? (
            <p><strong>Things to consider:</strong> {recommendationDetails.tradeOffs.join(" ")}</p>
          ) : null}
        </div>
      ) : null}
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
