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
const ROUTE_COUNT_LABEL = new Intl.NumberFormat("en-US").format(CAREER_COVERAGE_SUMMARY.totalRoutes);
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
  const routeId = getCareerIdFromPath(window.location.pathname || "/");
  const pathwayId = routeId && isValidCareerRouteId(routeId) ? routeId : getValidPathwayParam(params);
  return { signals, pathwayId };
}

function getInitialPath() {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname || "/";
  const routeId = getCareerIdFromPath(pathname);
  if (routeId && isValidCareerRouteId(routeId)) return pathname;
  const legacyPathwayId = getValidPathwayParam(new URLSearchParams(window.location.search));
  return legacyPathwayId ? `/careers/${encodeURIComponent(legacyPathwayId)}` : pathname;
}

function getCareerIdFromPath(pathname) {
  const match = String(pathname).match(/^\/careers\/([^/?#]+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function isValidCareerRouteId(routeId) {
  return CAREER_ROUTES.some((route) => route.id === routeId);
}

function getValidPathwayParam(params) {
  const pathwayId = params.get("pathway");
  return pathwayId && isValidCareerRouteId(pathwayId) ? pathwayId : null;
}

function getPageFromPath(pathname) {
  if (pathname === "/careers") return "career-search";
  if (getCareerIdFromPath(pathname)) return "career-detail";
  if (pathname === "/for-parents-teachers") return "parents-teachers";
  if (pathname === "/for-partners") return "partners";
  return "home";
}

export default function App() {
  const initial = useMemo(initialRouteState, []);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [selectedSignals, setSelectedSignals] = useState(initial.signals);
  const [activePathwayId, setActivePathwayId] = useState(initial.pathwayId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [lifestylePreferences, setLifestylePreferences] = useState(DEFAULT_LIFESTYLE_PREFERENCES);
  const [interestSearch, setInterestSearch] = useState("");
  const [activeInterestCategory, setActiveInterestCategory] = useState("all");
  const [interestLimitMessage, setInterestLimitMessage] = useState("");
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
  const activeRoute = ranked.find((route) => route.id === activePathwayId) ?? visibleRoutes[0] ?? ranked[0];
  const interestRecommendations = useMemo(() => {
    if (!hasInterestInput && !hasPreferenceInput) return [];
    const source = hasInterestInput ? ranked.filter((route) => route.signalScore > 0) : ranked;
    return source.slice(0, 4);
  }, [hasInterestInput, hasPreferenceInput, ranked]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const routeId = getCareerIdFromPath(currentPath);
    const validRouteId = routeId && isValidCareerRouteId(routeId) ? routeId : null;
    url.pathname = currentPath;
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (validRouteId) url.searchParams.set("pathway", validRouteId);
    else url.searchParams.delete("pathway");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [currentPath, selectedSignals]);

  useEffect(() => {
    function handlePopState() {
      const nextPath = window.location.pathname || "/";
      setCurrentPath(nextPath);
      const routeId = getCareerIdFromPath(nextPath);
      if (routeId && isValidCareerRouteId(routeId)) {
        setActivePathwayId(routeId);
      } else {
        setActivePathwayId(null);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  function navigateTo(path, { routeId = null } = {}) {
    const url = new URL(window.location.href);
    const pathRouteId = getCareerIdFromPath(path);
    const validRouteId = routeId && isValidCareerRouteId(routeId)
      ? routeId
      : pathRouteId && isValidCareerRouteId(pathRouteId)
        ? pathRouteId
        : null;
    url.pathname = path;
    url.hash = "";
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (validRouteId) url.searchParams.set("pathway", validRouteId);
    else url.searchParams.delete("pathway");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setCurrentPath(path);
    setActivePathwayId(validRouteId);
  }

  function openPathway(routeId) {
    navigateTo(`/careers/${routeId}`, { routeId });
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
  }

  function handleCareerSearchSubmit(event) {
    event.preventDefault();
    const firstMatch = visibleRoutes[0];
    if (firstMatch) openPathway(firstMatch.id);
  }

  const page = getPageFromPath(currentPath);
  const routedCareerId = getCareerIdFromPath(currentPath);
  const detailRoute = routedCareerId
    ? ranked.find((route) => route.id === routedCareerId) ?? CAREER_ROUTES.find((route) => route.id === routedCareerId)
    : activeRoute;
  const detailPathwayRecord = detailRoute ? getAcademicPathwayForCareer(detailRoute.id) : null;

  useEffect(() => {
    if (page === "career-detail") pathwayHeadingRef.current?.focus();
  }, [page, routedCareerId]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-sage-200 bg-cream-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5">
          <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }} className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }}>Signal Deck</a>
            <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }}>Career search</a>
            <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); navigateTo("/for-parents-teachers"); }}>Parents and teachers</a>
          </nav>
          <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }} className="primary-button hidden md:inline-flex">Browse careers</a>
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
            <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); setMobileNavOpen(false); }}>Signal Deck</a>
            <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); setMobileNavOpen(false); }}>Career search</a>
            <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); navigateTo("/for-parents-teachers"); setMobileNavOpen(false); }}>Parents and teachers</a>
          </nav>
        ) : null}
      </header>

      <main id="main-content" data-page={page}>
        {page === "home" ? (
          <SignalDeckStudio
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
            onNavigate={navigateTo}
            starterRoutes={starterRoutes}
          />
        ) : null}

        {page === "career-search" ? (
          <CareerSearchPage
            visibleRoutes={visibleRoutes}
            routeStreams={routeStreams}
            routeSearch={routeSearch}
            streamFilter={streamFilter}
            hasDiscoveryInput={hasDiscoveryInput}
            hasRouteFilters={hasRouteFilters}
            activePathwayId={activePathwayId}
            onSearchChange={setRouteSearch}
            onStreamFilterChange={setStreamFilter}
            onSearchSubmit={handleCareerSearchSubmit}
            onOpen={openPathway}
          />
        ) : null}

        {page === "career-detail" ? (
          <PathwayPage
            detailRoute={detailRoute}
            detailPathwayRecord={detailPathwayRecord}
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            headingRef={pathwayHeadingRef}
          />
        ) : null}

        {page === "parents-teachers" ? <SimpleInfoPage audience="parents-teachers" /> : null}
        {page === "partners" ? <SimpleInfoPage audience="partners" /> : null}

      </main>

      <footer className="border-t border-sage-200 bg-cream-200/60">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 text-sm text-forest-800 md:flex-row md:items-center md:justify-between">
          <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }} className="brand-wordmark">Careerize</a>
          <p>Explore possible routes. Verify the details.</p>
          <p>(c) 2026 Careerize - South Africa</p>
        </div>
      </footer>
    </>
  );
}

function CareerSearchPage({
  visibleRoutes,
  routeStreams,
  routeSearch,
  streamFilter,
  hasDiscoveryInput,
  hasRouteFilters,
  activePathwayId,
  onSearchChange,
  onStreamFilterChange,
  onSearchSubmit,
  onOpen,
}) {
  return (
    <section className="route-page career-search-page">
      <div className="route-page-shell">
        <div className="route-page-heading">
          <p className="route-page-kicker">Browse mapped routes</p>
          <h1 id="career-search-title">Career search</h1>
          <p>
            Search directly or browse by career cluster. Results use existing route data and starter ranking only; they do not imply personal fit, admission readiness or likelihood of success.
          </p>
        </div>

        <div className="route-page-grid">
          <aside className="route-page-sidebar" aria-label="Search mode">
            <RouteModeBadge
              title="Exploration matches"
              active={hasDiscoveryInput}
              text="When interests or sliders are selected, ranking reflects those starter signals."
            />
            <RouteModeBadge
              title="Direct search"
              active={!hasDiscoveryInput}
              text="Search and cluster filters inspect the route list without making a fit claim."
            />
          </aside>

          <div className="route-page-results">
            <div className="route-filter-panel">
              <form className="career-search-form mt-0" onSubmit={onSearchSubmit}>
                <label htmlFor="direct-route-search">Career search</label>
                <div className="career-search-control">
                  <Search className="career-search-icon" size={18} aria-hidden="true" />
                  <input
                    id="direct-route-search"
                    type="search"
                    value={routeSearch}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Try Data Analyst, Nurse, Electrician or Design"
                  />
                  <button type="submit">Open first match <CornerDownRight size={17} aria-hidden="true" /></button>
                </div>
              </form>
              <label htmlFor="stream-filter" className="route-select-label">
                Filter by career cluster
                <select
                  id="stream-filter"
                  name="streamFilter"
                  value={streamFilter}
                  onChange={(event) => onStreamFilterChange(event.target.value)}
                >
                  <option value="all">All career clusters</option>
                  {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
                </select>
              </label>
            </div>

            <p className="route-status" aria-live="polite">
              {hasDiscoveryInput
                ? `${visibleRoutes.length} exploration routes shown from selected interests and career reality sliders.`
                : hasRouteFilters
                  ? `${visibleRoutes.length} routes shown from your search or career-cluster filter. No personal fit is inferred.`
                  : "Three starter routes are shown before you search or filter. Use this page to inspect routes directly, not to measure fit."}
            </p>

            {visibleRoutes.length ? (
              <div className="route-card-grid">
                {visibleRoutes.map((route) => (
                  <ExplorationCard
                    key={route.id}
                    route={route}
                    active={activePathwayId === route.id}
                    hasInput={hasDiscoveryInput}
                    onOpen={onOpen}
                  />
                ))}
              </div>
            ) : (
              <div className="route-empty-state" role="status">
                No routes match those filters. Try a broader title, subject or career cluster.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PathwayPage({ detailRoute, detailPathwayRecord, selectedSubjects, onToggleSubject, headingRef }) {
  return (
    <section className="route-page pathway-page" aria-labelledby={detailRoute && detailPathwayRecord ? undefined : "pathway-unavailable-title"}>
      <div className="route-page-shell">
        {detailRoute && detailPathwayRecord ? (
          <PathwayDetail
            route={detailRoute}
            pathwayRecord={detailPathwayRecord}
            selectedSubjects={selectedSubjects}
            onToggleSubject={onToggleSubject}
            headingRef={headingRef}
            headingLevel={1}
          />
        ) : (
          <div className="pathway-unavailable">
            <p className="route-page-kicker">Pathway detail</p>
            <h1 id="pathway-unavailable-title" ref={headingRef} tabIndex="-1">Pathway unavailable</h1>
            <p>No starter pathway is available for this route. Return to career search and choose one of the mapped routes.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function SimpleInfoPage({ audience }) {
  const isParentsTeachers = audience === "parents-teachers";
  return (
    <section className="route-page info-page" aria-labelledby="info-page-title">
      <div className="route-page-shell info-page-shell">
        <div className="route-page-heading">
          <p className="route-page-kicker">{isParentsTeachers ? "Guidance context" : "Collaboration context"}</p>
          <h1 id="info-page-title">{isParentsTeachers ? "For parents and teachers" : "For partners"}</h1>
          {isParentsTeachers ? (
            <p>
              Careerize is an exploration tool for discussing possible study and work routes. This page explains what Careerize can and cannot claim, so adults can use it as a conversation aid rather than a decision tool.
            </p>
          ) : (
            <p>
              Careerize can help partners present broad, verifiable route information and starter exploration prompts. It should not be used to publish unsupported labour-market claims, provider requirements or personal outcomes.
            </p>
          )}
        </div>
        <div className="info-page-panels">
          <article>
            <h2>{isParentsTeachers ? "Use it for questions" : "Use it for route exploration"}</h2>
            <p>
              The current experience connects interest signals, route summaries and pathway templates so people can compare options and identify what still needs verification.
            </p>
          </article>
          <article>
            <h2>{isParentsTeachers ? "Check claims before acting" : "Keep claims evidence-bound"}</h2>
            <p>
              Subjects, marks, APS, accreditation, programme availability, costs, dates and labour-market details must be checked with the relevant provider or source before decisions are made.
            </p>
          </article>
        </div>
      </div>
    </section>
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

function getDeckInterest(interests, index) {
  if (!interests.length) return null;
  const safeIndex = ((index % interests.length) + interests.length) % interests.length;
  return interests[safeIndex];
}

function SignalDeckStudio({
  categories,
  interests,
  selectedSignals,
  selectedCount,
  selectionLimit,
  search,
  activeCategory,
  preferences,
  recommendations,
  starterRoutes,
  limitMessage,
  hasPreferenceInput,
  onSearchChange,
  onCategoryChange,
  onToggleInterest,
  onPreferenceChange,
  onReset,
  onOpen,
  onNavigate,
}) {
  const [deckIndex, setDeckIndex] = useState(0);
  const deferredSearch = useDeferredValue(search);
  const categoryIndex = useMemo(() => new Map(categories.map((category) => [category.id, category.label])), [categories]);
  const selectedSet = useMemo(() => new Set(selectedSignals), [selectedSignals]);
  const selectedInterests = useMemo(
    () => interests.filter((interest) => selectedSet.has(interest.value)),
    [interests, selectedSet]
  );
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredInterests = useMemo(() => interests.filter((interest) => {
    const matchesCategory = activeCategory === "all" || interest.category === activeCategory;
    const searchable = [interest.label, categoryIndex.get(interest.category), interest.why, ...(interest.skills ?? [])].join(" ").toLowerCase();
    return matchesCategory && (!normalizedSearch || searchable.includes(normalizedSearch));
  }), [activeCategory, categoryIndex, interests, normalizedSearch]);
  const activeInterest = getDeckInterest(filteredInterests, deckIndex);
  const limitReached = selectedCount >= selectionLimit;
  const hasRecommendationInput = selectedCount > 0 || hasPreferenceInput;
  const resultRoutes = hasRecommendationInput ? recommendations : starterRoutes;
  const gridInterests = activeInterest
    ? filteredInterests.filter((interest) => interest.value !== activeInterest.value)
    : filteredInterests;
  const remixSignals = selectedInterests.length ? selectedInterests : interests.slice(0, 4);

  useEffect(() => {
    setDeckIndex(0);
  }, [activeCategory, deferredSearch]);

  function moveDeck(step) {
    setDeckIndex((current) => {
      if (!filteredInterests.length) return 0;
      return (current + step + filteredInterests.length) % filteredInterests.length;
    });
  }

  function skipCurrent() {
    moveDeck(1);
  }

  return (
    <section className="signal-deck-page" aria-labelledby="signal-deck-title">
      <div className="signal-deck-shell">
        <div className="signal-deck-hero">
          <div>
            <p className="signal-deck-kicker">Careerize decision studio</p>
            <p className="signal-deck-route-count">{ROUTE_COUNT_LABEL} mapped routes</p>
            <h1 id="signal-deck-title">Signal Deck Studio</h1>
            <p className="signal-deck-lede">
              React to interest cards, tune your signal mix, then compare starter signal overlap across mapped career routes. Exploratory matches are not admissions or success predictions.
            </p>
            <div className="signal-deck-actions" aria-label="Signal Deck navigation">
              <a href="/careers" onClick={(event) => { event.preventDefault(); onNavigate("/careers"); }}>
                Browse careers <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); onNavigate("/for-parents-teachers"); }}>
                Adult guide <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <SelectedSignalStack
            selectedInterests={selectedInterests}
            selectedCount={selectedCount}
            selectionLimit={selectionLimit}
            limitMessage={limitMessage}
            limitReached={limitReached}
            onToggleInterest={onToggleInterest}
            onReset={onReset}
          />
        </div>

        <div className="signal-deck-layout">
          <div className="signal-deck-left">
            <section className="signal-deck-panel" aria-labelledby="deck-controls-title">
              <div className="signal-deck-panel-heading">
                <div>
                  <p className="signal-deck-eyebrow">Interest deck</p>
                  <h2 id="deck-controls-title">Choose signals</h2>
                </div>
                <span aria-live="polite">{filteredInterests.length} cards</span>
              </div>

              <div className="signal-deck-controls">
                <label htmlFor="signal-deck-search">
                  Search interests
                  <span>
                    <Search size={17} aria-hidden="true" />
                    <input
                      id="signal-deck-search"
                      type="search"
                      value={search}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="Try tools, care, data, business or science"
                    />
                  </span>
                </label>
                <div className="signal-deck-categories" aria-label="Interest categories">
                  <button type="button" aria-pressed={activeCategory === "all"} onClick={() => onCategoryChange("all")}>
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      aria-pressed={activeCategory === category.id}
                      onClick={() => onCategoryChange(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeInterest ? (
                <div className="signal-deck-feature">
                  <InterestDeckCard
                    interest={activeInterest}
                    categoryLabel={categoryIndex.get(activeInterest.category)}
                    selected={selectedSet.has(activeInterest.value)}
                    disabled={!selectedSet.has(activeInterest.value) && limitReached}
                    featured
                    onToggleInterest={onToggleInterest}
                  />
                  <div className="signal-deck-nav" aria-label="Interest card navigation">
                    <button type="button" onClick={() => moveDeck(-1)}>Back</button>
                    <button type="button" onClick={skipCurrent}>Skip</button>
                    <button type="button" onClick={() => moveDeck(1)}>Next</button>
                  </div>
                </div>
              ) : (
                <p className="signal-deck-empty" role="status">No interest cards match that search or category.</p>
              )}

              <section className="signal-deck-preferences" aria-labelledby="signal-preferences-title">
                <div className="signal-deck-panel-heading">
                  <div>
                    <p className="signal-deck-eyebrow">Decision sliders</p>
                    <h2 id="signal-preferences-title">Adjust decision sliders</h2>
                  </div>
                  <SlidersHorizontal size={20} aria-hidden="true" />
                </div>
                <div className="signal-slider-grid">
                  {PREFERENCE_DEFINITIONS.map((preference) => (
                    <PreferenceSlider
                      key={preference.id}
                      preference={preference}
                      value={preferences[preference.id]}
                      onChange={onPreferenceChange}
                    />
                  ))}
                </div>
              </section>

              <div className="signal-deck-card-grid" role="list" aria-label="Mapped interest keywords">
                {gridInterests.map((interest) => (
                  <InterestDeckCard
                    key={interest.value}
                    interest={interest}
                    categoryLabel={categoryIndex.get(interest.category)}
                    selected={selectedSet.has(interest.value)}
                    disabled={!selectedSet.has(interest.value) && limitReached}
                    onToggleInterest={onToggleInterest}
                  />
                ))}
              </div>
            </section>

            <section className="signal-deck-panel" aria-labelledby="remix-board-title">
              <div className="signal-deck-panel-heading">
                <div>
                  <p className="signal-deck-eyebrow">Signal remix board</p>
                  <h2 id="remix-board-title">{selectedInterests.length ? "Your selected signals" : "Starter signal cards"}</h2>
                </div>
              </div>
              <div className="signal-remix-grid">
                {remixSignals.map((interest) => (
                  <article key={interest.value} className="signal-remix-card">
                    <p>{categoryIndex.get(interest.category)}</p>
                    <h3>{interest.label}</h3>
                    <span>{interest.skills.slice(0, 3).join(" · ")}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="signal-deck-right" aria-label="Signal mix and route results">
            <section className="signal-deck-panel" aria-labelledby="signal-results-title">
              <div className="signal-deck-panel-heading">
                <div>
                  <p className="signal-deck-eyebrow">{hasRecommendationInput ? "Ranked overlap" : "Starter route overlap"}</p>
                  <h2 id="signal-results-title">{hasRecommendationInput ? "Routes shaped by your signals" : "Starter route cards"}</h2>
                </div>
                <Network size={20} aria-hidden="true" />
              </div>
              {hasRecommendationInput && !resultRoutes.length ? (
                <p className="signal-results-note" role="status" aria-live="polite">
                  No ranked overlap yet for this mix. Try adding another signal or resetting filters.
                </p>
              ) : (
                <>
                  <p className="signal-results-note" aria-live="polite">
                    {hasRecommendationInput
                      ? `Showing ${resultRoutes.length} exploratory matches from selected signals${hasPreferenceInput ? " and slider choices" : ""}.`
                      : "No path is suggested yet. Starter route overlap appears before you add inputs, so no personal fit is inferred yet."}
                  </p>
                  <div className="signal-result-list">
                    {resultRoutes.map((route) => (
                      <ExplorationCard
                        key={route.id}
                        route={route}
                        active={false}
                        hasInput={hasRecommendationInput}
                        recommendationDetails={hasRecommendationInput ? getInterestRecommendationDetails(route, selectedSignals, preferences, interests, PREFERENCE_DEFINITIONS) : null}
                        onOpen={onOpen}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InterestDeckCard({ interest, categoryLabel, selected, disabled, featured = false, onToggleInterest }) {
  return (
    <article role={featured ? undefined : "listitem"} className={`interest-deck-card ${featured ? "interest-deck-card-featured" : ""}`}>
      <div>
        <p>{categoryLabel}</p>
        <h3>{interest.label}</h3>
        <span>{interest.why}</span>
      </div>
      <div className="interest-deck-skills" aria-label={`Related skills for ${interest.label}`}>
        {interest.skills.slice(0, featured ? 5 : 3).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <button
        type="button"
        data-testid="interest-signal"
        data-signal-value={interest.value}
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => onToggleInterest(interest.value)}
      >
        {selected ? "Remove" : "Add"} signal: {interest.label}
      </button>
    </article>
  );
}

function SelectedSignalStack({
  selectedInterests,
  selectedCount,
  selectionLimit,
  limitMessage,
  limitReached,
  onToggleInterest,
  onReset,
}) {
  return (
    <aside className="selected-signal-stack" aria-label="Selected signal stack">
      <div className="selected-signal-stack-header">
        <p>Selected signal stack</p>
        <strong data-testid="selected-interest-count" aria-live="polite">{selectedCount} / {selectionLimit} selected</strong>
      </div>
      {selectedInterests.length ? (
        <div className="selected-signal-chips">
          {selectedInterests.map((interest) => (
            <button key={interest.value} type="button" onClick={() => onToggleInterest(interest.value)} aria-label={`Remove ${interest.label}`}>
              {interest.label} <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <p className="selected-signal-empty">Add interest cards to build a signal mix.</p>
      )}
      <p className="selected-signal-limit" aria-live="polite">
        {limitMessage || (limitReached ? "Limit reached: remove one interest before adding another." : `${selectionLimit - selectedCount} selections left.`)}
      </p>
      <button type="button" className="reset-deck-button" onClick={onReset}>
        <RotateCcw size={16} aria-hidden="true" /> Reset deck
      </button>
    </aside>
  );
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
    <article data-testid="route-card" data-route-id={route.id} className={`flex min-h-[330px] flex-col rounded-xl border bg-cream-50 p-5 transition duration-200 ${active ? "border-2 border-forest-700 shadow-elevation-selected" : "border-sage-300 hover:-translate-y-0.5 hover:border-sage-400"}`}>
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

function PathwayDetail({ route, pathwayRecord, selectedSubjects, onToggleSubject, headingRef, headingLevel = 2 }) {
  const pathway = pathwayRecord.academicPathway;
  const verified = pathwayRecord.verificationStatus === "verified_provider_specific";
  const subjectRisk = assessSubjectRisk(pathway, { currentSubjects: selectedSubjects });
  const matched = matchedSignalLabels(route);
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";
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
          <HeadingTag ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-normal outline-none sm:text-5xl">{route.title}</HeadingTag>
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
