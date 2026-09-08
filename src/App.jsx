import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CornerDownRight,
  ExternalLink,
  Menu,
  Network,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { CAREER_COVERAGE_SUMMARY, CAREER_DIRECTIONS, CAREER_ROUTES, INTEREST_CATEGORIES, INTEREST_SELECTION_LIMIT, INTEREST_SIGNALS, PATHWAY_TYPES, SOURCE_REGISTRY } from "./data/careerCatalog.js";
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
const CATEGORY_COLORS = new Map([
  ["digital-technology", "sky"],
  ["creative-building", "coral"],
  ["academic-systems", "violet"],
  ["health-impact", "teal"],
  ["business-enterprise", "amber"],
  ["communication-influence", "lime"],
  ["work-style", "ink"],
]);
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

function parseUrlState() {
  if (typeof window === "undefined") return { signals: [], pathwayId: null, subjects: [] };
  const params = new URLSearchParams(window.location.search);
  const validSignals = new Set(INTEREST_SIGNALS.map((signal) => signal.value));
  const validSubjects = new Set(SUBJECT_OPTIONS);
  const signals = (params.get("signals") ?? "")
    .split(",")
    .filter((signal) => validSignals.has(signal));
  const subjects = (params.get("subjects") ?? "")
    .split(",")
    .filter((subject) => validSubjects.has(subject));
  const routeId = getCareerIdFromPath(window.location.pathname || "/");
  const pathwayId = routeId && isValidCareerRouteId(routeId) ? routeId : getValidPathwayParam(params);
  return { signals, pathwayId, subjects };
}

function getInitialPath() {
  if (typeof window === "undefined") return "/";
  const pathname = window.location.pathname || "/";
  const params = new URLSearchParams(window.location.search);
  const routeId = getCareerIdFromPath(pathname);
  if (routeId && isValidCareerRouteId(routeId)) return pathname;
  const legacyPathwayId = getValidPathwayParam(params);
  if (legacyPathwayId) return `/careers/${encodeURIComponent(legacyPathwayId)}`;
  // Validate known paths; fall back to not-found if unknown
  if (isKnownPath(pathname)) return pathname;
  return pathname;
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

function isKnownPath(pathname) {
  return pathname === "/"
    || pathname === "/careers"
    || pathname === "/for-parents-teachers"
    || pathname === "/for-partners"
    || pathname === "/trust";
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
  if (pathname === "/trust") return "trust";
  if (isKnownPath(pathname)) return "home";
  return "not-found";
}

export default function App() {
  const initial = useMemo(parseUrlState, []);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [selectedSignals, setSelectedSignals] = useState(initial.signals);
  const [activePathwayId, setActivePathwayId] = useState(initial.pathwayId);
  const [selectedSubjects, setSelectedSubjects] = useState(initial.subjects);
  const [routeSearch, setRouteSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");
  const [activeDirectionId, setActiveDirectionId] = useState(null);
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
  const defaultResults = hasDiscoveryInput ? ranked : starterRoutes;
  const routeStreams = useMemo(
    () => [...new Set(CAREER_ROUTES.map((route) => route.stream))].sort(),
    []
  );
  const directionsByStream = useMemo(() => {
    const index = new Map();
    for (const d of CAREER_DIRECTIONS) {
      if (!index.has(d.stream)) index.set(d.stream, []);
      index.get(d.stream).push(d);
    }
    for (const arr of index.values()) arr.sort((a, b) => b.routeIds.length - a.routeIds.length);
    return index;
  }, []);
  const activeDirection = useMemo(
    () => (activeDirectionId ? CAREER_DIRECTIONS.find((d) => d.id === activeDirectionId) : null),
    [activeDirectionId]
  );
  // If the selected direction's stream no longer matches the stream filter, clear it
  // so the user never sees an empty "0 roles" state after switching streams.
  useEffect(() => {
    if (activeDirection && streamFilter !== "all" && activeDirection.stream !== streamFilter) {
      setActiveDirectionId(null);
    }
  }, [activeDirection, streamFilter]);
  const hasRouteFilters = routeSearch.trim().length > 0 || streamFilter !== "all" || !!activeDirectionId;
  const visibleRoutes = useMemo(() => {
    const search = routeSearch.trim().toLowerCase();
    return defaultResults
      .filter((route) => {
        const searchable = [route.title, route.stream, route.summary, ...(route.subjects ?? [])]
          .join(" ")
          .toLowerCase();
        const matchesDirection = !activeDirection || activeDirection.routeIds.includes(route.id);
        return (!search || searchable.includes(search)) &&
          (streamFilter === "all" || route.stream === streamFilter) &&
          matchesDirection;
      })
      .slice(0, hasDiscoveryInput || hasRouteFilters ? (activeDirection ? 200 : 60) : 3);
  }, [defaultResults, hasDiscoveryInput, hasRouteFilters, routeSearch, streamFilter, activeDirection]);
  const activeRoute = ranked.find((route) => route.id === activePathwayId) ?? visibleRoutes[0] ?? ranked[0];
  const interestRecommendations = useMemo(() => {
    if (!hasInterestInput && !hasPreferenceInput) return [];
    const source = hasInterestInput ? ranked.filter((route) => route.signalScore > 0) : ranked;
    return source.slice(0, 6);
  }, [hasInterestInput, hasPreferenceInput, ranked]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const routeId = getCareerIdFromPath(currentPath);
    const validRouteId = routeId && isValidCareerRouteId(routeId) ? routeId : null;
    url.pathname = currentPath;
    url.hash = "";
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (selectedSubjects.length) url.searchParams.set("subjects", selectedSubjects.join(","));
    else url.searchParams.delete("subjects");
    if (validRouteId) url.searchParams.set("pathway", validRouteId);
    else url.searchParams.delete("pathway");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [currentPath, selectedSignals, selectedSubjects]);

  useEffect(() => {
    function handlePopState() {
      const next = parseUrlState();
      const nextPath = window.location.pathname || "/";
      setCurrentPath(nextPath);
      setSelectedSignals(next.signals);
      setSelectedSubjects(next.subjects);
      const routeId = getCareerIdFromPath(nextPath);
      if (routeId && isValidCareerRouteId(routeId)) {
        setActivePathwayId(routeId);
      } else {
        setActivePathwayId(next.pathwayId);
      }
      setMobileNavOpen(false);
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
    if (selectedSubjects.length) url.searchParams.set("subjects", selectedSubjects.join(","));
    else url.searchParams.delete("subjects");
    if (validRouteId) url.searchParams.set("pathway", validRouteId);
    else url.searchParams.delete("pathway");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setCurrentPath(path);
    setActivePathwayId(validRouteId);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function openPathway(routeId) {
    navigateTo(`/careers/${routeId}`, { routeId });
  }

  function resetDiscovery() {
    setSelectedSignals([]);
    setSelectedSubjects([]);
    setActivePathwayId(null);
    setInterestSearch("");
    setActiveInterestCategory("all");
    setInterestLimitMessage("");
    setRouteSearch("");
    setStreamFilter("all");
    setActiveDirectionId(null);
    setLifestylePreferences(DEFAULT_LIFESTYLE_PREFERENCES);
  }

  function resetRouteFilters() {
    setRouteSearch("");
    setStreamFilter("all");
    setActiveDirectionId(null);
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
  const relatedRoutes = useMemo(() => {
    if (!detailRoute) return [];
    return (detailRoute.similarCareerIds || [])
      .map((id) => CAREER_ROUTES.find((r) => r.id === id))
      .filter(Boolean)
      .slice(0, 3);
  }, [detailRoute]);

  useEffect(() => {
    if (page === "career-detail") pathwayHeadingRef.current?.focus();
  }, [page, routedCareerId]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-4">
          <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }} className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-800 md:flex" aria-label="Primary navigation">
            <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }} className="nav-link">Signal Deck</a>
            <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }} className="nav-link">Career search</a>
            <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); navigateTo("/for-parents-teachers"); }} className="nav-link">Parents &amp; teachers</a>
            <a href="/for-partners" onClick={(event) => { event.preventDefault(); navigateTo("/for-partners"); }} className="nav-link">Partners</a>
            <a href="/trust" onClick={(event) => { event.preventDefault(); navigateTo("/trust"); }} className="nav-link">Trust</a>
          </nav>
          <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }} className="primary-button hidden md:inline-flex">
            <Search size={16} aria-hidden="true" /> Browse {ROUTE_COUNT_LABEL} careers
          </a>
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
          <nav id="mobile-navigation" className="grid gap-1 border-t border-ink-100 bg-cream-50 px-5 py-4 text-sm font-semibold text-ink-900 md:hidden" aria-label="Mobile navigation">
            <MobileNavLink href="/" label="Signal Deck" onClick={() => navigateTo("/")} />
            <MobileNavLink href="/careers" label="Career search" onClick={() => navigateTo("/careers")} />
            <MobileNavLink href="/for-parents-teachers" label="Parents &amp; teachers" onClick={() => navigateTo("/for-parents-teachers")} />
            <MobileNavLink href="/for-partners" label="Partners" onClick={() => navigateTo("/for-partners")} />
            <MobileNavLink href="/trust" label="Trust &amp; principles" onClick={() => navigateTo("/trust")} />
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
            totalRoutes={CAREER_ROUTES.length}
            visibleRoutes={visibleRoutes}
            routeStreams={routeStreams}
            routeSearch={routeSearch}
            streamFilter={streamFilter}
            directionsByStream={directionsByStream}
            activeDirection={activeDirection}
            hasDiscoveryInput={hasDiscoveryInput}
            hasRouteFilters={hasRouteFilters}
            activePathwayId={activePathwayId}
            onSearchChange={setRouteSearch}
            onStreamFilterChange={setStreamFilter}
            onDirectionChange={setActiveDirectionId}
            onResetFilters={resetRouteFilters}
            onSearchSubmit={handleCareerSearchSubmit}
            onOpen={openPathway}
          />
        ) : null}

        {page === "career-detail" ? (
          <PathwayPage
            detailRoute={detailRoute}
            detailPathwayRecord={detailPathwayRecord}
            selectedSubjects={selectedSubjects}
            relatedRoutes={relatedRoutes}
            onToggleSubject={toggleSubject}
            onBack={() => {
              if (document.referrer && window.location.pathname.startsWith("/careers/") && document.referrer.includes("/careers")) {
                window.history.back();
              } else {
                navigateTo("/careers");
              }
            }}
            onOpen={openPathway}
            headingRef={pathwayHeadingRef}
          />
        ) : null}

        {page === "parents-teachers" ? <SimpleInfoPage audience="parents-teachers" onNavigate={navigateTo} /> : null}
        {page === "partners" ? <SimpleInfoPage audience="partners" onNavigate={navigateTo} /> : null}
        {page === "trust" ? <TrustPage onNavigate={navigateTo} /> : null}
        {page === "not-found" ? <NotFoundPage onNavigate={navigateTo} /> : null}
      </main>

      <footer className="border-t border-ink-100 bg-ink-950 text-cream-100">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="brand-wordmark !text-cream-50">Careerize</p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-cream-100/70">
              Free, independent career-intelligence for South African learners. Explore routes. Verify details. Keep the learner in control.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-lime-300">
              {ROUTE_COUNT_LABEL} mapped starter routes
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cream-100/50">Explore</p>
            <ul className="mt-4 grid gap-2 text-sm">
              <li><FooterLink onClick={() => navigateTo("/")}>Signal Deck Studio</FooterLink></li>
              <li><FooterLink onClick={() => navigateTo("/careers")}>Career search</FooterLink></li>
              <li><FooterLink onClick={() => navigateTo("/for-parents-teachers")}>For parents &amp; teachers</FooterLink></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cream-100/50">Principles</p>
            <ul className="mt-4 grid gap-2 text-sm">
              <li><FooterLink onClick={() => navigateTo("/trust")}>Independence &amp; trust</FooterLink></li>
              <li><FooterLink onClick={() => navigateTo("/for-partners")}>For partners</FooterLink></li>
              <li><span className="text-cream-100/50">South Africa · 2026</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream-100/10">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-5 text-xs text-cream-100/50 md:flex-row md:items-center md:justify-between">
            <p>Starter guidance only. Verify subject, APS, accreditation and entry details with each provider before decisions.</p>
            <p>© 2026 Careerize</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <a
      href={href}
      onClick={(event) => { event.preventDefault(); onClick(); }}
      className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 transition hover:bg-ink-50"
    >
      <span>{label}</span>
      <ChevronRight size={16} className="text-ink-400" aria-hidden="true" />
    </a>
  );
}

function FooterLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="text-left text-cream-100/80 transition hover:text-lime-300">
      {children}
    </button>
  );
}

function GuidanceLabels({ compact = false }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : ""}`} aria-label="Current guidance status">
      <StatusBadge tone="teal">Starter guidance</StatusBadge>
      <StatusBadge tone="sky">Template pathways</StatusBadge>
      <StatusBadge tone="amber">Needs provider verification</StatusBadge>
    </div>
  );
}

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    leaf: "border-sage-300 bg-sage-100 text-forest-800",
    cream: "border-cream-300 bg-cream-50 text-forest-800",
    amber: "border-amber-400 bg-amber-100 text-amber-900",
    green: "border-forest-300 bg-forest-50 text-forest-900",
    teal: "border-teal-300 bg-teal-50 text-teal-900",
    sky: "border-sky-300 bg-sky-50 text-sky-900",
    coral: "border-coral-300 bg-coral-50 text-coral-800",
    violet: "border-violet-300 bg-violet-50 text-violet-900",
    lime: "border-lime-400 bg-lime-100 text-ink-900",
    ink: "border-ink-300 bg-ink-50 text-ink-800",
    red: "border-red-300 bg-red-50 text-red-800",
  };
  return <span className={`inline-flex min-h-[28px] items-center rounded-full border px-3 py-1 text-[11px] sm:text-xs font-bold tracking-wide uppercase ${tones[tone]}`}>{children}</span>;
}

function getDeckInterest(interests, index) {
  if (!interests.length) return null;
  const safeIndex = ((index % interests.length) + interests.length) % interests.length;
  return interests[safeIndex];
}

function categoryTone(categoryId) {
  return CATEGORY_COLORS.get(categoryId) ?? "ink";
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
            <p className="signal-deck-route-count"><Sparkles size={12} className="mr-1 inline" aria-hidden="true" /> {ROUTE_COUNT_LABEL} mapped routes across SA</p>
            <h1 id="signal-deck-title">Signal Deck Studio</h1>
            <p className="signal-deck-lede">
              Pick interest cards, tune your signal mix, then compare starter pathway overlaps across mapped South African career routes. Exploratory matches are conversation starters — not admissions decisions, eligibility verdicts or success predictions.
            </p>
            <GuidanceLabels />
            <div className="signal-deck-actions" aria-label="Signal Deck navigation">
              <button type="button" onClick={() => onNavigate("/careers")} className="primary-cta">
                <Search size={16} aria-hidden="true" /> Browse all careers
              </button>
              <button type="button" onClick={() => onNavigate("/for-parents-teachers")} className="secondary-cta">
                Adult guide <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onNavigate("/trust")} className="secondary-cta">
                <Shield size={16} aria-hidden="true" /> How we stay independent
              </button>
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
                  <p className="mt-1 text-sm text-ink-600">React to one card at a time, or browse categories. Each signal shapes the starter overlap — never a verdict.</p>
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
                      data-category-tone={categoryTone(category.id)}
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
                    tone={categoryTone(activeInterest.category)}
                    selected={selectedSet.has(activeInterest.value)}
                    disabled={!selectedSet.has(activeInterest.value) && limitReached}
                    featured
                    onToggleInterest={onToggleInterest}
                  />
                  <div className="signal-deck-nav" aria-label="Interest card navigation">
                    <button type="button" onClick={() => moveDeck(-1)}>← Back</button>
                    <button type="button" onClick={skipCurrent}>Skip</button>
                    <button type="button" onClick={() => moveDeck(1)}>Next →</button>
                  </div>
                </div>
              ) : (
                <p className="signal-deck-empty" role="status">No interest cards match that search or category.</p>
              )}

              <section className="signal-deck-preferences" aria-labelledby="signal-preferences-title">
                <div className="signal-deck-panel-heading">
                  <div>
                    <p className="signal-deck-eyebrow">Decision sliders</p>
                    <h2 id="signal-preferences-title">Tune your mix</h2>
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
                    tone={categoryTone(interest.category)}
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
              <p className="mt-2 text-sm text-ink-600">These are the themes shaping your exploration. Remove signals anytime to see how the match list shifts.</p>
              <div className="signal-remix-grid">
                {remixSignals.map((interest) => (
                  <article key={interest.value} className={`signal-remix-card signal-remix-card-${categoryTone(interest.category)}`}>
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
                      ? `Showing ${resultRoutes.length} exploratory matches from selected signals${hasPreferenceInput ? " and slider choices" : ""}. These are signal overlaps, not recommendations.`
                      : "No path is suggested yet. Starter route examples appear before you add inputs, so no personal fit is inferred."}
                  </p>
                  <div className="admissions-warning" role="note">
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>Signal overlap does not measure admission readiness, suitability or likelihood of success. Always verify requirements with providers.</span>
                  </div>
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
                  <button type="button" onClick={() => onNavigate("/careers")} className="browse-all-link">
                    Browse all {ROUTE_COUNT_LABEL} careers <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </>
              )}
            </section>

            <section className="signal-deck-panel pathway-types-quickref" aria-labelledby="pathway-types-title">
              <div className="signal-deck-panel-heading">
                <div>
                  <p className="signal-deck-eyebrow">South African pathways</p>
                  <h2 id="pathway-types-title" className="text-lg">Route types Careerize maps</h2>
                </div>
              </div>
              <div className="pathway-type-tags">
                {PATHWAY_TYPES.map((pt) => (
                  <span key={pt.id} className="pathway-type-tag">{pt.label.replace(" route", "")}</span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InterestDeckCard({ interest, categoryLabel, tone, selected, disabled, featured = false, onToggleInterest }) {
  return (
    <article role={featured ? undefined : "listitem"} className={`interest-deck-card interest-deck-card-${tone} ${featured ? "interest-deck-card-featured" : ""}`}>
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
        {selected ? <><Check size={16} aria-hidden="true" /> Remove signal</> : <>Add signal: {interest.label}</>}
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
        <strong data-testid="selected-interest-count" aria-live="polite">{selectedCount} / {selectionLimit}</strong>
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
        <p className="selected-signal-empty">Add interest cards to build a signal mix. Start with what genuinely pulls you — there are no wrong answers at this exploration stage.</p>
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
    <label className="rounded-xl border border-ink-200 bg-cream-50 p-5">
      <span className="font-bold text-ink-950">{preference.label}</span>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        data-testid="preference-slider"
        data-preference-id={preference.id}
        onChange={(event) => onChange(preference.id, event.target.value)}
        className="mt-4 w-full accent-teal-600"
        aria-label={preference.label}
        aria-describedby={`${preference.id}-helper`}
      />
      <span className="mt-2 flex justify-between gap-3 text-xs font-semibold text-ink-600">
        <span>{preference.lowLabel}</span>
        <span>{preference.highLabel}</span>
      </span>
      <span id={`${preference.id}-helper`} className="mt-3 block text-sm leading-6 text-ink-700/80">{preference.helper}</span>
    </label>
  );
}

function ExplorationCard({ route, active, hasInput, recommendationDetails, onOpen }) {
  const matched = matchedSignalLabels(route);
  const confidence = route.dataConfidence ?? 50;
  const confidenceTone = confidence >= 70 ? "lime" : confidence >= 45 ? "amber" : "coral";
  const confidenceLabel = confidence >= 70 ? `Source-backed (${confidence}%)` : `Starter template (${confidence}%)`;
  return (
    <article data-testid="route-card" data-route-id={route.id} className={`route-result-card ${active ? "route-result-card-active" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="teal">Exploration match</StatusBadge>
          <StatusBadge tone={confidenceTone}>{confidenceLabel}</StatusBadge>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-500">{route.stream}</span>
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-ink-950">{route.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-700/80">{route.summary}</p>
      <p className="mt-3 text-xs font-semibold text-ink-600">Reality signal: {route.preferenceFit.strongestPreference}</p>
      <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-900">
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
      <button type="button" data-testid="route-open" data-route-id={route.id} onClick={() => onOpen(route.id)} className="route-open-button">
        <span>View pathway: {route.title}</span><ChevronRight size={18} aria-hidden="true" />
      </button>
    </article>
  );
}

function CareerSearchPage({
  totalRoutes,
  visibleRoutes,
  routeStreams,
  routeSearch,
  streamFilter,
  directionsByStream,
  activeDirection,
  hasDiscoveryInput,
  hasRouteFilters,
  activePathwayId,
  onSearchChange,
  onStreamFilterChange,
  onDirectionChange,
  onResetFilters,
  onSearchSubmit,
  onOpen,
}) {
  const visibleDirections = useMemo(() => {
    const filtered = streamFilter === "all"
      ? Array.from(directionsByStream.values()).flat()
      : directionsByStream.get(streamFilter) ?? [];
    return filtered.sort((a, b) => b.routeIds.length - a.routeIds.length);
  }, [directionsByStream, streamFilter]);
  return (
    <section className="route-page career-search-page">
      <div className="route-page-shell">
        <div className="route-page-heading">
          <p className="route-page-kicker">Browse mapped routes</p>
          <h1 id="career-search-title">Career search</h1>
          <p>
            Search {totalRoutes} starter routes directly or browse by career cluster. Results use existing route data and starter ranking only; they do not imply personal fit, admission readiness or likelihood of success.
          </p>
          <div className="mt-5"><GuidanceLabels /></div>
        </div>

        <div className="route-page-grid">
          <aside className="route-page-sidebar" aria-label="Search mode">
            <RouteModeBadge
              title="Exploration matches"
              active={hasDiscoveryInput}
              tone="teal"
              text="When interests or sliders are selected on the Signal Deck, ranking reflects those starter signals."
            />
            <RouteModeBadge
              title="Direct search"
              active={!hasDiscoveryInput}
              tone="sky"
              text="Search and cluster filters inspect the route list without making a fit claim."
            />
            <div className="admissions-warning" role="note">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>Check entry requirements with each provider before making subject or application decisions.</span>
            </div>
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
                    aria-label="Search careers by title, cluster or subject"
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
                  <option value="all">All {totalRoutes} career clusters</option>
                  {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
                </select>
              </label>
            </div>

            <section className="direction-drilldown" aria-labelledby="directions-title">
              <div className="direction-drilldown-header">
                <div>
                  <p className="signal-deck-eyebrow">Career directions</p>
                  <h2 id="directions-title" className="text-lg font-extrabold text-ink-950">
                    {activeDirection ? activeDirection.label : "Drill into a direction"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">
                    {activeDirection
                      ? `${activeDirection.routeIds.length} roles in this direction. Click any card to view its starter pathway.`
                      : `Pick a direction (high-level work cluster) to narrow the list before you search for a specific role. ${visibleDirections.length} directions shown${streamFilter !== "all" ? ` for ${streamFilter}` : ""}.`}
                  </p>
                </div>
                {activeDirection ? (
                  <button type="button" className="secondary-button" onClick={() => onDirectionChange(null)}>
                    <X size={14} aria-hidden="true" /> Clear direction
                  </button>
                ) : null}
              </div>

              <div className="direction-chip-grid">
                {(activeDirection ? [activeDirection] : visibleDirections.slice(0, 48)).map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    className={`direction-chip ${activeDirection?.id === dir.id ? "direction-chip-active" : ""}`}
                    aria-pressed={activeDirection?.id === dir.id}
                    onClick={() => onDirectionChange(activeDirection?.id === dir.id ? null : dir.id)}
                  >
                    <span className="direction-chip-label">{dir.label}</span>
                    <span className="direction-chip-count">{dir.routeIds.length} roles</span>
                  </button>
                ))}
              </div>

              {activeDirection ? (
                <p className="mt-3 text-sm leading-6 text-ink-700/80">{activeDirection.description}</p>
              ) : null}
            </section>

            <div className="route-status" role="status" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  <strong className="font-extrabold">{visibleRoutes.length}</strong>
                  {" "}
                  {hasDiscoveryInput
                    ? <>exploration routes from your selected signals{activeDirection ? <> in <strong>{activeDirection.label}</strong></> : ""}.</>
                    : hasRouteFilters
                      ? <>routes match{routeSearch.trim() ? <> "<strong>{routeSearch.trim()}</strong>"</> : ""}{activeDirection ? <> in <strong>{activeDirection.label}</strong></> : ""}{streamFilter !== "all" ? <> within <strong>{streamFilter}</strong></> : ""}. No personal fit is inferred.</>
                      : <>starter routes are shown before you search or filter. Use this page to inspect routes directly, not to measure fit.</>}
                </p>
                {hasRouteFilters ? (
                  <button type="button" className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-coral-700 transition hover:bg-coral-50" onClick={onResetFilters}>
                    <X size={13} aria-hidden="true" /> Clear all filters
                  </button>
                ) : null}
              </div>
              {hasRouteFilters && !hasDiscoveryInput ? (
                <p className="mt-2 text-xs opacity-80">
                  Signal-Deck selections and reality sliders stay live on the home page and will rank these routes when you return.
                </p>
              ) : null}
            </div>

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
                <Search size={24} className="mx-auto mb-3 text-ink-400" aria-hidden="true" />
                <p className="font-semibold">No routes match those filters yet.</p>
                <p className="mt-2 text-sm text-ink-600">Try a broader title or keyword, clear the career-cluster filter, or pick a different direction. Remember — Careerize lists starter profiles; real provider entry requirements still need to be checked directly.</p>
                <button type="button" className="secondary-button mt-4" onClick={onResetFilters}>
                  <RotateCcw size={14} aria-hidden="true" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteModeBadge({ title, text, active, tone = "teal" }) {
  return (
    <div className={`rounded-xl border p-4 transition ${active ? `border-${tone}-500 bg-${tone}-50` : "border-ink-200 bg-white"}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${active ? `text-${tone}-800` : "text-ink-500"}`}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink-700/80">{text}</p>
    </div>
  );
}

function PathwayPage({ detailRoute, detailPathwayRecord, selectedSubjects, relatedRoutes, onToggleSubject, onBack, onOpen, headingRef }) {
  return (
    <section className="route-page pathway-page" aria-labelledby={detailRoute && detailPathwayRecord ? undefined : "pathway-unavailable-title"}>
      <div className="route-page-shell">
        <nav aria-label="Breadcrumb" className="mb-5">
          <button type="button" onClick={onBack} className="breadcrumb-link">
            <ArrowLeft size={16} aria-hidden="true" /> Back to career search
          </button>
        </nav>
        {detailRoute && detailPathwayRecord ? (
          <PathwayDetail
            route={detailRoute}
            pathwayRecord={detailPathwayRecord}
            selectedSubjects={selectedSubjects}
            relatedRoutes={relatedRoutes}
            onToggleSubject={onToggleSubject}
            onOpen={onOpen}
            headingRef={headingRef}
            headingLevel={1}
          />
        ) : (
          <div className="pathway-unavailable">
            <p className="route-page-kicker">Pathway detail</p>
            <h1 id="pathway-unavailable-title" ref={headingRef} tabIndex="-1">Pathway unavailable</h1>
            <p>No starter pathway is available for this route. Return to career search and choose one of the mapped routes.</p>
            <button type="button" onClick={onBack} className="primary-button mt-5"><ArrowLeft size={16} aria-hidden="true" /> Back to search</button>
          </div>
        )}
      </div>
    </section>
  );
}

function PathwayDetail({ route, pathwayRecord, selectedSubjects, relatedRoutes, onToggleSubject, onOpen, headingRef, headingLevel = 2 }) {
  const pathway = pathwayRecord.academicPathway;
  const verified = pathwayRecord.verificationStatus === "verified_provider_specific";
  const subjectRisk = assessSubjectRisk(pathway, { currentSubjects: selectedSubjects });
  const matched = matchedSignalLabels(route);
  const HeadingTag = headingLevel === 1 ? "h1" : "h2";
  const detailConfidence = route.dataConfidence ?? 50;
  const detailConfidenceTone = detailConfidence >= 70 ? "lime" : detailConfidence >= 45 ? "amber" : "coral";
  const detailConfidenceLabel = detailConfidence >= 70
    ? `Source-backed profile (${detailConfidence}%)`
    : detailConfidence >= 45
      ? `Partly verified starter (${detailConfidence}%)`
      : `Starter template — verify with providers (${detailConfidence}%)`;
  const riskTone = {
    green: { card: "border-teal-400 bg-teal-50", text: "text-teal-900", badge: "teal" },
    amber: { card: "border-amber-400 bg-amber-50", text: "text-amber-950", badge: "amber" },
    red: { card: "border-red-400 bg-red-50", text: "text-red-900", badge: "coral" },
    unknown: { card: "border-ink-200 bg-cream-50", text: "text-ink-800", badge: "ink" },
  }[subjectRisk.level] ?? { card: "border-ink-200 bg-cream-50", text: "text-ink-800", badge: "ink" };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {verified ? <StatusBadge tone="lime">Verified pathway</StatusBadge> : <GuidanceLabels />}
        <StatusBadge tone={detailConfidenceTone}>{detailConfidenceLabel}</StatusBadge>
        {route.ofoCode
          ? <StatusBadge tone="ink">OFO {route.ofoCode}</StatusBadge>
          : <StatusBadge tone="amber">OFO mapping in progress</StatusBadge>
        }
      </div>
      <div className="mt-6 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Pathway detail</p>
          <HeadingTag ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-tight text-ink-950 outline-none sm:text-5xl">{route.title}</HeadingTag>
          <p className="mt-3 font-semibold text-ink-600">Career cluster: {route.stream}</p>
          <p className="mt-6 leading-7 text-ink-800">{route.summary}</p>

          <div className="mt-6 rounded-xl border border-teal-300 bg-teal-50 p-5 text-sm leading-6 text-teal-900">
            <strong>Why this route matched:</strong>{" "}
            {matched.length ? `Your selected signals overlap with ${matched.join(", ")}.` : "This is a starter route shown before enough signals have been selected."}
            {" "}Signal overlap does not measure admission readiness, suitability or likelihood of success.
          </div>
          <div className="mt-4 rounded-xl border border-amber-400 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <strong><AlertTriangle size={16} className="mr-1 -mt-1 inline" aria-hidden="true" />This is a starter pathway guide, not an admissions decision.</strong> Requirements vary by provider. Verify subjects, marks, APS, accreditation, availability and dates with the institution or provider before making subject or application choices.
          </div>

          <div className="mt-6 grid gap-3">
            <InfoPill label="Day-in-life" tone="teal" items={route.dayInLife?.slice(0, 3) ?? []} />
            <InfoPill label="Key tasks" tone="sky" items={route.keyTasks?.slice(0, 4) ?? []} />
            <InfoPill label="Tools you might use" tone="violet" items={route.toolExamples?.slice(0, 5) ?? []} />
          </div>
        </div>

        <div className="grid gap-5">
          <DetailSection title="Subject relevance" icon="📚">
            <div className="grid gap-3 sm:grid-cols-3">
              <SubjectNote label="Keep open" tone="teal" text={pathway.grade10Subjects.requiredOrStronglyRecommended.join(", ")} />
              <SubjectNote label="May be helpful" tone="sky" text={pathway.grade10Subjects.recommended.join(", ")} />
              <SubjectNote label="Check before dropping" tone="coral" text={pathway.grade10Subjects.avoidDropping.join(", ")} />
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-700/80"><strong>Maths gate:</strong> {pathway.grade10Subjects.mathsGate}</p>
            <p className="mt-2 text-sm leading-6 text-ink-700/80"><strong>Science gate:</strong> {pathway.grade10Subjects.scienceGate}</p>
          </DetailSection>

          <DetailSection title="Optional subject-risk check" icon="🎯">
            <p className="text-sm leading-6 text-ink-700/80">Select current or planned subjects. This compares them with a broad template and cannot confirm provider entry.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const selected = selectedSubjects.includes(subject);
                return (
                  <button type="button" key={subject} data-testid="subject-toggle" data-subject={subject} onClick={() => onToggleSubject(subject)} aria-pressed={selected} className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${selected ? "border-teal-600 bg-teal-100 text-teal-900" : "border-ink-200 bg-cream-50 text-ink-800 hover:border-ink-400"}`}>
                    <span>{subject}</span>{selected ? <Check size={13} aria-hidden="true" /> : null}
                  </button>
                );
              })}
            </div>
            <div className={`mt-5 rounded-xl border p-4 ${riskTone.card}`} aria-live="polite">
              <div className="flex items-center gap-2">
                <StatusBadge tone={riskTone.badge}>{subjectRisk.level.toUpperCase()}</StatusBadge>
                <p className={`font-bold ${riskTone.text}`}>{subjectRisk.label}</p>
              </div>
              <p className={`mt-2 text-sm leading-6 ${riskTone.text}`}>{subjectRisk.summary}</p>
              <p className="mt-2 text-sm leading-6 text-ink-700/80">{subjectRisk.nextStep}</p>
              {subjectRisk.missing?.length ? (
                <p className="mt-3 text-xs font-semibold text-ink-600">Missing template signals: {subjectRisk.missing.join(", ")}</p>
              ) : null}
            </div>
          </DetailSection>

          <DetailSection title="Career reality trade-offs" icon="⚖️">
            <div className="grid gap-3 sm:grid-cols-2">
              <SubjectNote label="Earning potential" tone="lime" text={route.earningPotential.label} />
              <SubjectNote label="Stress" tone="coral" text={route.stress} />
              <SubjectNote label="Travel or place" tone="sky" text={route.remote} />
              <SubjectNote label="Environment and safety" tone="amber" text={route.environment} />
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-700/80">{route.preferenceFit.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-lime-300 bg-lime-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-lime-800">Best parts</p>
                <p className="mt-2 text-sm leading-6 text-ink-800">{route.best}</p>
              </div>
              <div className="rounded-xl border border-coral-300 bg-coral-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-coral-800">Worst parts</p>
                <p className="mt-2 text-sm leading-6 text-ink-800">{route.worst}</p>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Possible qualification routes" icon="🎓">
            <div className="grid gap-3 sm:grid-cols-2">
              {pathway.qualificationRoutes.map((option) => (
                <article key={`${option.type}-${option.qualification}`} className="rounded-xl border border-ink-200 bg-cream-50 p-4 transition hover:border-teal-400">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">{option.type.replaceAll("_", " ")}</p>
                  <h4 className="mt-2 font-bold text-ink-950">{option.qualification}</h4>
                  <p className="mt-2 text-sm leading-6 text-ink-700/80"><strong>Entry:</strong> {option.gate}</p>
                  <p className="mt-1 text-sm text-ink-600"><strong>Duration:</strong> {option.duration}</p>
                  <p className="mt-2 text-xs font-semibold text-amber-800">Template guidance · provider check required</p>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-lg bg-ink-50 p-3 text-xs leading-5 text-ink-700">
              <strong>Growth path:</strong> {route.growth}
            </p>
          </DetailSection>

          <DetailSection title="Common misconceptions" icon="💡">
            <ul className="grid gap-3">
              {(route.misconceptions ?? []).map((m, i) => (
                <li key={i} className="rounded-xl bg-violet-50 p-4 text-sm leading-6 text-violet-900">
                  <strong>Myth {i + 1}:</strong> {m}
                </li>
              ))}
            </ul>
          </DetailSection>

          {relatedRoutes.length > 0 ? (
            <DetailSection title="Related routes to compare" icon="🔗">
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedRoutes.map((rel) => (
                  <button key={rel.id} type="button" onClick={() => onOpen(rel.id)} className="related-route-card">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">{rel.stream}</p>
                    <p className="mt-1 font-bold text-ink-950">{rel.title}</p>
                    <ChevronRight size={16} className="mt-2 text-ink-400" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </DetailSection>
          ) : null}

          <DetailSection title="Sources and evidence for this route" icon="📑">
            <p className="text-sm leading-6 text-ink-700/80">
              Every claim below is tied to an entry in the source registry. Starter-template routes show their editorial foundations; upgraded provider-verified routes will carry the official sources that back them.
            </p>
            <div className="mt-4 grid gap-2">
              {(route.sourceIds ?? []).map((sid) => {
                const src = SOURCE_REGISTRY.find((s) => s.id === sid);
                if (!src) return null;
                return (
                  <div key={sid} className="flex items-start justify-between gap-3 rounded-lg border border-ink-100 bg-white p-3 text-sm">
                    <div>
                      <p className="font-semibold text-ink-900">{src.title}</p>
                      <p className="text-xs text-ink-500">{src.type} · confidence {src.confidence} · accessed {src.accessedAt}</p>
                      {src.note ? <p className="mt-1 text-xs leading-5 text-ink-600">{src.note}</p> : null}
                    </div>
                    <StatusBadge tone={src.confidence >= 75 ? "lime" : src.confidence >= 60 ? "amber" : "coral"}>{src.confidence}%</StatusBadge>
                  </div>
                );
              })}
              {!(route.sourceIds ?? []).length ? (
                <p className="text-xs text-ink-500">No source records attached to this starter profile yet.</p>
              ) : null}
            </div>
            <p className="mt-4 rounded-lg bg-ink-50 p-3 text-xs leading-5 text-ink-700">
              <strong>Source-of-truth rule:</strong> APS scores, subject requirements, accreditation status, fees, availability, salary and employer demand must come from an official or provider record (SAQA, DHET, QCTO, CHE, SETA, university, TVET, employer). Where none is attached here, treat the field as unverified.
            </p>
          </DetailSection>

          <DetailSection title="Next exploration steps" icon="→">
            <ol className="grid gap-3">
              {[
                "Compare this route with at least two alternatives.",
                `Ask a provider which subjects, marks, APS and additional selection steps apply to its ${route.title.toLowerCase()} route.`,
                `Speak to someone doing related work and test the route through a project, visit, shadowing opportunity or introductory course.`,
              ].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-700 font-bold text-white">{index + 1}</span>{step}</li>
              ))}
            </ol>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, tone, items }) {
  const toneStyles = {
    teal: "border-teal-300 bg-teal-50 text-teal-900",
    sky: "border-sky-300 bg-sky-50 text-sky-900",
    violet: "border-violet-300 bg-violet-50 text-violet-900",
    lime: "border-lime-400 bg-lime-50 text-ink-900",
    coral: "border-coral-300 bg-coral-50 text-coral-800",
  };
  return (
    <div className={`rounded-xl border p-4 ${toneStyles[tone] ?? toneStyles.teal}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <ul className="mt-2 grid gap-1 text-sm leading-6">
        {items.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
    </div>
  );
}

function DetailSection({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-ink-200 bg-cream-50 p-5 shadow-elevation-1 sm:p-6">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-ink-950">
        {icon ? <span aria-hidden="true">{icon}</span> : null}{title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SubjectNote({ label, text, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-900",
    sky: "bg-sky-50 text-sky-900",
    coral: "bg-coral-50 text-coral-800",
    lime: "bg-lime-50 text-ink-900",
    amber: "bg-amber-50 text-amber-900",
    violet: "bg-violet-50 text-violet-900",
  };
  return <div className={`rounded-xl p-4 ${tones[tone]}`}><p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p><p className="mt-2 text-sm leading-6">{text || "No template note available."}</p></div>;
}

function SimpleInfoPage({ audience, onNavigate }) {
  const isParentsTeachers = audience === "parents-teachers";
  return (
    <section className="route-page info-page" aria-labelledby="info-page-title">
      <div className="route-page-shell info-page-shell">
        <nav aria-label="Breadcrumb" className="mb-5">
          <button type="button" onClick={() => onNavigate("/")} className="breadcrumb-link">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Signal Deck
          </button>
        </nav>
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
            <h2>{isParentsTeachers ? "Use it for better questions" : "Use it for route exploration"}</h2>
            <p>
              The current experience connects interest signals, route summaries and pathway templates so people can compare options and identify what still needs verification.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-ink-700/80">
              <li>• Ask learners what surprised them in the route list.</li>
              <li>• Compare at least three routes before subject decisions.</li>
              <li>• Use subject-risk checks as prompts for teacher conversations.</li>
            </ul>
          </article>
          <article>
            <h2>{isParentsTeachers ? "Check claims before acting" : "Keep claims evidence-bound"}</h2>
            <p>
              Subjects, marks, APS, accreditation, programme availability, costs, dates and labour-market details must be checked with the relevant provider or source before decisions are made.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge tone="teal">No admissions verdicts</StatusBadge>
              <StatusBadge tone="amber">Verify with providers</StatusBadge>
              <StatusBadge tone="violet">Independent editorial</StatusBadge>
            </div>
          </article>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => onNavigate("/careers")} className="primary-button">Browse careers <ArrowRight size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => onNavigate("/trust")} className="secondary-button">Read our principles</button>
        </div>
      </div>
    </section>
  );
}

function TrustPage({ onNavigate }) {
  return (
    <section className="route-page trust-page" aria-labelledby="trust-title">
      <div className="route-page-shell">
        <nav aria-label="Breadcrumb" className="mb-5">
          <button type="button" onClick={() => onNavigate("/")} className="breadcrumb-link">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Signal Deck
          </button>
        </nav>
        <div className="route-page-heading">
          <p className="route-page-kicker">Trust, independence and principles</p>
          <h1 id="trust-title">How Careerize stays honest</h1>
          <p>
            Careerize is a free, independent career-intelligence platform for South African learners. These principles govern what we build, how we label guidance and how we treat learner data.
          </p>
          <div className="mt-5"><GuidanceLabels /></div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <TrustPrinciple title="The learner is never the product" tone="teal">
            Saved user records exist only to help the learner return, reflect and receive better guidance. We do not sell learner data, recruiter access or CV databases.
          </TrustPrinciple>
          <TrustPrinciple title="Editorial independence" tone="violet">
            No employer, course provider, university, sponsor or commercial partner may pay to influence what a career profile says. Funding must never change route rankings or recommendations.
          </TrustPrinciple>
          <TrustPrinciple title="No black-box verdicts" tone="coral">
            Signals are transparent. Guidance is a conversation starter, not a psychometric decision, admissions verdict or eligibility claim.
          </TrustPrinciple>
          <TrustPrinciple title="Honest uncertainty" tone="amber">
            If data is not source-verified, we say so. We don't invent APS scores, salary numbers, accreditation status, provider availability or demand claims.
          </TrustPrinciple>
          <TrustPrinciple title="Show the worst parts too" tone="sky">
            Every route should show stress, safety, lifestyle trade-offs and barriers — not only the appealing parts.
          </TrustPrinciple>
          <TrustPrinciple title="South African context first" tone="lime">
            Pathways map NSC, university, TVET, learnership, apprenticeship, short-course, work and pivot routes that make sense in South Africa.
          </TrustPrinciple>
        </div>

        <div className="mt-8 rounded-2xl border border-ink-200 bg-cream-50 p-6">
          <h2 className="text-xl font-extrabold text-ink-950">Source registry snapshot</h2>
          <p className="mt-2 text-sm leading-6 text-ink-700/80">Careerize tracks source records with confidence scores. Starter routes use editorial foundations and must be upgraded to provider-verified records before they carry "Verified pathway" status.</p>
          <div className="mt-4 grid gap-2">
            {SOURCE_REGISTRY.slice(0, 5).map((src) => (
              <div key={src.id} className="flex items-start justify-between gap-3 rounded-lg border border-ink-100 bg-white p-3 text-sm">
                <div>
                  <p className="font-semibold text-ink-900">{src.title}</p>
                  <p className="text-xs text-ink-500">{src.type} · confidence {src.confidence}</p>
                </div>
                <StatusBadge tone="sky">{src.note?.slice(0, 40) ?? "Registered source"}…</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => onNavigate("/")} className="primary-button">Try the Signal Deck <ArrowRight size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => onNavigate("/careers")} className="secondary-button">Browse careers</button>
        </div>
      </div>
    </section>
  );
}

function TrustPrinciple({ title, tone, children }) {
  const tones = {
    teal: "border-teal-300",
    violet: "border-violet-300",
    coral: "border-coral-300",
    amber: "border-amber-400",
    sky: "border-sky-300",
    lime: "border-lime-400",
  };
  return (
    <article className={`rounded-2xl border ${tones[tone] ?? tones.teal} bg-cream-50 p-6`}>
      <h3 className="text-lg font-extrabold text-ink-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-ink-700/80">{children}</p>
    </article>
  );
}

function NotFoundPage({ onNavigate }) {
  return (
    <section className="route-page not-found-page" aria-labelledby="not-found-title">
      <div className="route-page-shell">
        <p className="route-page-kicker">404</p>
        <h1 id="not-found-title" className="mt-3 text-5xl font-extrabold text-ink-950">Page not found</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-ink-700/80">
          The page you were looking for doesn't exist here. You can head back to the Signal Deck or browse all mapped careers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => onNavigate("/")} className="primary-button">
            <ArrowLeft size={16} aria-hidden="true" /> Back to Signal Deck
          </button>
          <button type="button" onClick={() => onNavigate("/careers")} className="secondary-button">Browse careers</button>
        </div>
      </div>
    </section>
  );
}
