# Signal Deck Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current front-page wordmap with the approved Signal Deck Studio decision guidance product and move search/pathway/explainer content into separate navigable views.

**Architecture:** Keep the existing Vite/React/Tailwind stack and avoid adding a router dependency. Add a small pathname-based view switch in `src/App.jsx`, reuse the existing catalog, scoring and pathway helpers, and replace the current `InterestWordMap` UI with a deck/remix/results experience.

**Tech Stack:** React 18, Vite, Tailwind CSS, lucide-react, Vitest, Testing Library, existing Careerize data/scoring modules.

---

## File Structure

- Modify `src/App.jsx`: add lightweight route state, replace the current homepage/wordmap composition with Signal Deck Studio, add route-equivalent views for `/careers`, `/careers/:careerId`, `/for-parents-teachers` and `/for-partners`, and reuse existing pathway/search/detail components where practical.
- Modify `src/index.css`: replace old word-map styling with Signal Deck Studio, career search page, pathway page and explainer page styles; keep global focus, skip link, nav and route-card styles.
- Modify `src/App.test.jsx`: update tests from "focused homepage and wordmap" to Signal Deck Studio and route split behavior.
- Modify `tailwind.config.js`: add Signal Deck accent colors if the implementation uses Tailwind utilities for lime, teal, coral, sky, violet or ink.
- Do not modify catalog facts in `src/data/*` or scoring logic in `src/lib/scoring.js` unless a test proves the UI cannot be built from existing data.
- Do not commit `.codex-temp/` or `.superpowers/` preview files.

## Task 1: Add Route-Aware Tests For The New Product Shape

**Files:**
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Replace the first homepage test with a failing Signal Deck Studio test**

Replace the current test named `"shows two clear homepage entry paths and removes repeated refinement sections"` with:

```jsx
  it("shows Signal Deck Studio as the focused front-page product", async () => {
    await renderApp();

    expect(screen.getByRole("heading", { level: 1, name: /signal deck studio/i })).toBeInTheDocument();
    expect(screen.getByText(/react to interest cards/i)).toBeInTheDocument();
    expect(screen.getByText(/tune your signal mix/i)).toBeInTheDocument();
    expect(screen.getByText(/starter signal overlap/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /career search/i })).toHaveAttribute("href", "/careers");
    expect(screen.getByRole("link", { name: /parents and teachers/i })).toHaveAttribute("href", "/for-parents-teachers");

    expect(screen.queryByRole("heading", { level: 2, name: /interest word map/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: /explore career paths/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: /pathway guide/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Careerize helps young people connect raw interests/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run the focused test and verify it fails for the expected reason**

Run: `npm run test:ui -- --run src/App.test.jsx -t "Signal Deck Studio"`

Expected: FAIL because the heading "Signal Deck Studio" is not rendered and the old word map still exists.

- [ ] **Step 3: Add failing route split tests**

Add these tests after the homepage test:

```jsx
  it("keeps career search on a separate route-equivalent page", async () => {
    window.history.pushState({}, "", "/careers");
    await renderApp();

    expect(screen.getByRole("heading", { level: 1, name: /career search/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/career search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by career cluster/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: /signal deck studio/i })).not.toBeInTheDocument();
  });

  it("opens a dedicated pathway detail route from a Signal Deck result", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(interestSignal("technology"));
    const firstCard = routeCards()[0];
    const routeId = firstCard.dataset.routeId;
    const route = CAREER_ROUTES.find((item) => item.id === routeId);

    await user.click(byDataset("route-open", "routeId", routeId));

    await waitFor(() => expect(window.location.pathname).toBe(`/careers/${routeId}`));
    expect(screen.getByRole("heading", { level: 1, name: route.title })).toBeInTheDocument();
    expect(screen.getByText(/starter pathway guide, not an admissions decision/i)).toBeInTheDocument();
  });

  it("renders separate explainer pages without front-page decision controls", async () => {
    window.history.pushState({}, "", "/for-parents-teachers");
    await renderApp();

    expect(screen.getByRole("heading", { level: 1, name: /for parents and teachers/i })).toBeInTheDocument();
    expect(screen.getByText(/what Careerize can and cannot claim/i)).toBeInTheDocument();
    expect(screen.queryByTestId("interest-signal")).not.toBeInTheDocument();

    window.history.pushState({}, "", "/for-partners");
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: /for partners/i })).toBeInTheDocument();
  });
```

- [ ] **Step 4: Run the new route tests and verify they fail**

Run: `npm run test:ui -- --run src/App.test.jsx -t "route|explainer|pathway detail"`

Expected: FAIL because `App` does not switch on `window.location.pathname`, `openPathway` still scrolls in-page, and explainer pages do not exist.

- [ ] **Step 5: Commit the failing tests**

Run:

```bash
git add src/App.test.jsx
git commit -m "test: define signal deck routing behavior"
```

Expected: commit succeeds with only `src/App.test.jsx` staged.

## Task 2: Add Lightweight SPA Routing And View Shell

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add route helper functions above `App`**

Add this code after `initialRouteState()`:

```jsx
function getInitialPath() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

function getCareerIdFromPath(pathname) {
  const match = String(pathname).match(/^\/careers\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getPageFromPath(pathname) {
  if (pathname === "/careers") return "career-search";
  if (getCareerIdFromPath(pathname)) return "career-detail";
  if (pathname === "/for-parents-teachers") return "parents-teachers";
  if (pathname === "/for-partners") return "partners";
  return "home";
}
```

- [ ] **Step 2: Add route state and popstate handling inside `App`**

Add this state next to the existing state declarations:

```jsx
  const [currentPath, setCurrentPath] = useState(getInitialPath);
```

Add this effect after the existing URL synchronization effect:

```jsx
  useEffect(() => {
    function handlePopState() {
      const nextPath = window.location.pathname || "/";
      setCurrentPath(nextPath);
      const routeId = getCareerIdFromPath(nextPath);
      if (routeId && CAREER_ROUTES.some((route) => route.id === routeId)) {
        setActivePathwayId(routeId);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
```

- [ ] **Step 3: Add a `navigateTo` helper inside `App`**

Add this function before `openPathway`:

```jsx
  function navigateTo(path, { routeId = null } = {}) {
    const url = new URL(window.location.href);
    url.pathname = path;
    if (selectedSignals.length) url.searchParams.set("signals", selectedSignals.join(","));
    else url.searchParams.delete("signals");
    if (routeId) url.searchParams.set("pathway", routeId);
    else if (!getCareerIdFromPath(path)) url.searchParams.delete("pathway");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setCurrentPath(path);
    if (routeId) setActivePathwayId(routeId);
  }
```

- [ ] **Step 4: Replace `openPathway` scroll behavior**

Replace the current `openPathway` function with:

```jsx
  function openPathway(routeId) {
    setActivePathwayId(routeId);
    navigateTo(`/careers/${routeId}`, { routeId });
  }
```

- [ ] **Step 5: Add top-level page variables**

Add these constants before `return`:

```jsx
  const page = getPageFromPath(currentPath);
  const routedCareerId = getCareerIdFromPath(currentPath);
  const detailRoute = routedCareerId
    ? ranked.find((route) => route.id === routedCareerId) ?? CAREER_ROUTES.find((route) => route.id === routedCareerId)
    : activeRoute;
  const detailPathwayRecord = detailRoute ? getAcademicPathwayForCareer(detailRoute.id) : null;
```

- [ ] **Step 6: Update navigation links to use path routes**

In header and mobile nav, replace the old hash links with:

```jsx
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="/" onClick={(event) => { event.preventDefault(); navigateTo("/"); }}>Signal Deck</a>
            <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }}>Career search</a>
            <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); navigateTo("/for-parents-teachers"); }}>Parents and teachers</a>
          </nav>
          <a href="/careers" onClick={(event) => { event.preventDefault(); navigateTo("/careers"); }} className="primary-button hidden md:inline-flex">Career search</a>
```

Use the same destinations in mobile navigation and close the mobile menu after navigation.

- [ ] **Step 7: Run route tests**

Run: `npm run test:ui -- --run src/App.test.jsx -t "route|pathway detail|explainer"`

Expected: route tests still fail because the view components are not rendered yet, but `window.location.pathname` should update to `/careers/:routeId` when `openPathway` is used.

- [ ] **Step 8: Commit route state**

Run:

```bash
git add src/App.jsx
git commit -m "feat: add route-aware app shell"
```

Expected: commit contains only `src/App.jsx`.

## Task 3: Replace The Front Page With Signal Deck Studio

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Replace the homepage branch in `App`**

Inside `<main id="main-content">`, render the homepage only when `page === "home"`:

```jsx
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
          />
        ) : null}
```

Remove the old `home-entry` and `word-graph` sections from the home branch. Keep old search/pathway sections until Task 4 moves them behind route branches.

- [ ] **Step 2: Add `getDeckInterest` helper below `layoutInterestNodes`**

```jsx
function getDeckInterest(filteredInterests, selectedSet) {
  return filteredInterests.find((interest) => !selectedSet.has(interest.value)) ?? filteredInterests[0] ?? null;
}
```

- [ ] **Step 3: Add `SignalDeckStudio` component**

Place this component where `InterestWordMap` currently lives. Leave `InterestWordMap` in place until Task 7 removes unused code, or replace it directly if no references remain.

```jsx
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
  const activeCard = getDeckInterest(filteredInterests, selectedSet);
  const limitReached = selectedCount >= selectionLimit;
  const hasRecommendationInput = selectedCount > 0 || hasPreferenceInput;
  const signalTiles = selectedInterests.length ? selectedInterests : filteredInterests.slice(0, 4);

  return (
    <section className="signal-deck-page" aria-labelledby="signal-deck-title">
      <div className="signal-deck-hero">
        <div className="signal-deck-copy">
          <p className="signal-eyebrow">Decision guidance product</p>
          <h1 id="signal-deck-title">Signal Deck Studio</h1>
          <p>React to interest cards, tune your signal mix, then compare starter career paths without turning the front page into an explainer.</p>
          <div className="signal-deck-actions">
            <a href="/careers" onClick={(event) => { event.preventDefault(); onNavigate("/careers"); }}>Career search</a>
            <a href="/for-parents-teachers" onClick={(event) => { event.preventDefault(); onNavigate("/for-parents-teachers"); }}>Parents and teachers</a>
          </div>
        </div>

        <div className="signal-studio-grid">
          <section className="signal-panel signal-deck-panel" aria-labelledby="interest-card-title">
            <div className="signal-panel-heading">
              <span>Step 1</span>
              <h2 id="interest-card-title">React to interest cards</h2>
            </div>
            <div className="signal-card-filter">
              <label htmlFor="interest-search">
                Search interests
                <span>
                  <Search size={17} aria-hidden="true" />
                  <input
                    id="interest-search"
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Try tech, care, design or business"
                  />
                </span>
              </label>
              <div className="signal-category-row" aria-label="Interest categories">
                <button type="button" className={activeCategory === "all" ? "signal-category-active" : ""} onClick={() => onCategoryChange("all")}>All</button>
                {categories.slice(0, 5).map((category) => (
                  <button type="button" key={category.id} className={activeCategory === category.id ? "signal-category-active" : ""} onClick={() => onCategoryChange(category.id)}>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            <InterestDeckCard
              interest={activeCard}
              categoryLabel={activeCard ? categoryIndex.get(activeCard.category) : ""}
              selected={activeCard ? selectedSet.has(activeCard.value) : false}
              disabled={Boolean(activeCard) && !selectedSet.has(activeCard.value) && limitReached}
              onToggle={onToggleInterest}
            />
            <SelectedSignalStack
              selectedInterests={selectedInterests}
              selectedCount={selectedCount}
              selectionLimit={selectionLimit}
              limitMessage={limitMessage}
              limitReached={limitReached}
              onToggleInterest={onToggleInterest}
              onReset={onReset}
            />
          </section>

          <section className="signal-panel signal-remix-panel" aria-labelledby="signal-mix-title">
            <div className="signal-panel-heading">
              <span>Step 2</span>
              <h2 id="signal-mix-title">Tune your signal mix</h2>
            </div>
            <div className="signal-remix-board" role="list" aria-label="Selected signal mix">
              {signalTiles.map((interest, index) => (
                <article key={interest.value} role="listitem" className={`signal-remix-tile signal-remix-tile-${(index % 4) + 1}`}>
                  <strong>{interest.label}</strong>
                  <span>{interest.skills?.slice(0, 2).join(" + ") || categoryIndex.get(interest.category)}</span>
                </article>
              ))}
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

          <aside className="signal-panel signal-results-panel" aria-label="Career path suggestions">
            <div className="signal-score-card">
              <span>Your mix</span>
              <strong>{selectedCount ? `${Math.min(95, selectedCount * 12)}%` : "0%"}</strong>
              <p>starter signal overlap</p>
            </div>
            <p className="signal-guidance-note">Selected cards and slider choices shape the order. They do not predict success, eligibility or admissions readiness.</p>
            {hasRecommendationInput && recommendations.length ? (
              <div className="signal-result-list">
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
            ) : (
              <p className="signal-empty-state">Add at least one interest card or tune a slider to compare starter paths.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add deck subcomponents**

Add these components below `SignalDeckStudio`:

```jsx
function InterestDeckCard({ interest, categoryLabel, selected, disabled, onToggle }) {
  if (!interest) {
    return <div className="signal-deck-empty" role="status">No interest card matches that search or category.</div>;
  }

  return (
    <article className="signal-interest-card" data-testid="interest-card" data-signal-value={interest.value}>
      <span>Interest card</span>
      <h3>{interest.label}</h3>
      <p>{interest.why}</p>
      <small>{categoryLabel}</small>
      <div className="signal-card-actions">
        <button type="button" className="signal-skip-button" disabled>Skip</button>
        <button
          type="button"
          data-testid="interest-signal"
          data-signal-value={interest.value}
          aria-pressed={selected}
          disabled={disabled}
          onClick={() => onToggle(interest.value)}
        >
          {selected ? "Remove signal" : "Add signal"}
        </button>
      </div>
    </article>
  );
}

function SelectedSignalStack({ selectedInterests, selectedCount, selectionLimit, limitMessage, limitReached, onToggleInterest, onReset }) {
  return (
    <div className="signal-stack" aria-label="Selected interests">
      <div className="signal-stack-heading">
        <strong data-testid="selected-interest-count">{selectedCount} / {selectionLimit} selected</strong>
        <button type="button" onClick={onReset}><RotateCcw size={15} aria-hidden="true" /> Reset</button>
      </div>
      {selectedInterests.length ? (
        <div className="signal-stack-chips">
          {selectedInterests.map((interest) => (
            <button key={interest.value} type="button" onClick={() => onToggleInterest(interest.value)} aria-label={`Remove ${interest.label}`}>
              {interest.label} <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <p>Selected cards will appear here as your signal stack.</p>
      )}
      <p aria-live="polite">{limitMessage || (limitReached ? "Limit reached: remove one signal before adding another." : `${selectionLimit - selectedCount} selections left.`)}</p>
    </div>
  );
}
```

- [ ] **Step 5: Add Signal Deck CSS**

Add a new block in `src/index.css` inside `@layer components`:

```css
  .signal-deck-page {
    min-height: calc(100svh - 88px);
    background:
      radial-gradient(circle at 78% 8%, rgba(251, 113, 133, 0.16), transparent 28%),
      radial-gradient(circle at 12% 84%, rgba(125, 211, 252, 0.18), transparent 30%),
      linear-gradient(180deg, #fffdf7 0%, #f5efe5 100%);
  }

  .signal-deck-hero {
    @apply mx-auto grid max-w-[1340px] gap-8 px-5 py-10 lg:grid-cols-[0.48fr_1.52fr] lg:py-14;
  }

  .signal-deck-copy h1 {
    @apply mt-4 text-[44px] font-extrabold leading-[0.94] text-forest-950 sm:text-6xl;
  }

  .signal-deck-copy p {
    @apply mt-5 max-w-xl text-base leading-7 text-forest-800/75;
  }

  .signal-eyebrow {
    @apply inline-flex rounded-full bg-forest-950 px-4 py-2 text-xs font-extrabold uppercase text-white;
  }

  .signal-deck-actions {
    @apply mt-6 flex flex-wrap gap-3;
  }

  .signal-deck-actions a {
    @apply inline-flex min-h-11 items-center rounded-full border border-forest-950 bg-white px-5 py-2 text-sm font-extrabold text-forest-950 transition hover:-translate-y-0.5;
  }

  .signal-studio-grid {
    @apply grid gap-4 xl:grid-cols-[0.92fr_1.16fr_0.92fr];
  }

  .signal-panel {
    @apply rounded-[24px] border border-black/10 bg-white p-4 shadow-elevation-2;
  }

  .signal-deck-panel {
    @apply grid gap-4 bg-forest-950 text-white;
  }

  .signal-panel-heading span {
    @apply text-xs font-extrabold uppercase tracking-normal text-clay-400;
  }

  .signal-deck-panel .signal-panel-heading span {
    color: #c8ff4d;
  }

  .signal-panel-heading h2 {
    @apply mt-2 text-3xl font-extrabold leading-none;
  }

  .signal-card-filter label {
    @apply text-sm font-bold;
  }

  .signal-card-filter label > span {
    @apply mt-2 grid min-h-11 grid-cols-[36px_1fr] items-center rounded-2xl border border-white/15 bg-white/10;
  }

  .signal-card-filter input {
    @apply min-w-0 bg-transparent py-3 pr-3 text-sm font-semibold text-white outline-none placeholder:text-white/50;
  }

  .signal-category-row {
    @apply mt-3 flex flex-wrap gap-2;
  }

  .signal-category-row button {
    @apply rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/20;
  }

  .signal-category-row .signal-category-active {
    background: #c8ff4d;
    color: #101820;
  }

  .signal-interest-card {
    @apply relative grid min-h-[310px] grid-rows-[auto_1fr_auto_auto] overflow-hidden rounded-[28px] bg-cream-50 p-6 text-forest-950 shadow-elevation-3;
  }

  .signal-interest-card::before,
  .signal-interest-card::after {
    content: "";
    @apply pointer-events-none absolute inset-x-8 top-5 h-full rounded-[28px];
    z-index: -1;
  }

  .signal-interest-card span {
    @apply text-xs font-extrabold uppercase text-violet-700;
  }

  .signal-interest-card h3 {
    @apply self-center text-4xl font-extrabold leading-none;
  }

  .signal-interest-card p {
    @apply text-sm leading-6 text-forest-800/75;
  }

  .signal-interest-card small {
    @apply mt-3 text-xs font-extrabold uppercase text-forest-700;
  }

  .signal-card-actions {
    @apply mt-5 grid grid-cols-[80px_1fr] gap-3;
  }

  .signal-card-actions button {
    @apply min-h-12 rounded-2xl border-0 bg-forest-950 px-4 text-sm font-extrabold text-white disabled:opacity-40;
  }

  .signal-card-actions button:last-child {
    background: #c8ff4d;
    color: #101820;
  }

  .signal-stack {
    @apply rounded-2xl bg-white/10 p-4 text-sm text-white/80;
  }

  .signal-stack-heading {
    @apply flex items-center justify-between gap-3;
  }

  .signal-stack-heading strong,
  .signal-stack-heading button {
    @apply inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-extrabold text-white;
  }

  .signal-stack-chips {
    @apply mt-3 flex flex-wrap gap-2;
  }

  .signal-stack-chips button {
    @apply inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-forest-950;
  }

  .signal-remix-panel {
    @apply grid gap-4 bg-slate-50;
  }

  .signal-remix-board {
    @apply relative min-h-[360px] overflow-hidden rounded-[26px];
    background:
      radial-gradient(circle at 18% 20%, rgba(200, 255, 77, 0.18), transparent 23%),
      radial-gradient(circle at 80% 78%, rgba(251, 113, 133, 0.18), transparent 28%),
      linear-gradient(140deg, #111827, #164e63);
  }

  .signal-remix-tile {
    @apply absolute grid min-h-[96px] w-[42%] content-start rounded-[22px] p-4 font-extrabold text-forest-950 shadow-elevation-3;
  }

  .signal-remix-tile span {
    @apply mt-2 text-xs leading-5 text-forest-950/65;
  }

  .signal-remix-tile-1 { left: 8%; top: 12%; background: #a7f3d0; }
  .signal-remix-tile-2 { right: 8%; top: 18%; background: #fda4af; }
  .signal-remix-tile-3 { left: 23%; bottom: 16%; background: #fde68a; }
  .signal-remix-tile-4 { right: 14%; bottom: 12%; background: #93c5fd; }

  .signal-slider-grid {
    @apply grid gap-3 md:grid-cols-2;
  }

  .signal-results-panel {
    @apply grid content-start gap-4;
  }

  .signal-score-card {
    @apply rounded-[22px] bg-forest-950 p-5 text-white;
  }

  .signal-score-card span {
    @apply text-xs font-extrabold uppercase text-green-200;
  }

  .signal-score-card strong {
    @apply mt-2 block text-5xl font-extrabold leading-none;
  }

  .signal-guidance-note {
    @apply rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950;
  }

  .signal-result-list {
    @apply grid gap-4;
  }

  .signal-empty-state,
  .signal-deck-empty {
    @apply rounded-2xl border border-sage-200 bg-white p-5 text-sm font-semibold leading-6 text-forest-800;
  }
```

- [ ] **Step 6: Run homepage tests**

Run: `npm run test:ui -- --run src/App.test.jsx -t "Signal Deck Studio|selects and deselects|maximum|slider"`

Expected: homepage test passes after old section removal; selection/limit/slider tests may need selector updates in Task 5.

- [ ] **Step 7: Commit front page implementation**

Run:

```bash
git add src/App.jsx src/index.css
git commit -m "feat: replace wordmap with signal deck studio"
```

Expected: commit contains `src/App.jsx` and `src/index.css`.

## Task 4: Move Career Search, Pathway Detail And Explainers Into Separate Views

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add `CareerSearchPage` component**

Move the existing `#matches` section content into a component with this signature:

```jsx
function CareerSearchPage({
  routeSearch,
  streamFilter,
  routeStreams,
  visibleRoutes,
  hasDiscoveryInput,
  hasWordMapInput,
  hasRouteFilters,
  activePathwayId,
  onSearchChange,
  onStreamFilterChange,
  onSearchSubmit,
  onOpen,
}) {
  return (
    <section className="route-page" aria-labelledby="career-search-title">
      <div className="route-page-heading">
        <p className="signal-eyebrow">Separate career search</p>
        <h1 id="career-search-title">Career search</h1>
        <p>Search directly or browse by career cluster when you already have a job, subject or industry in mind.</p>
      </div>
      <div className="route-search-layout">
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
        <label htmlFor="stream-filter" className="route-filter-label">
          Filter by career cluster
          <select id="stream-filter" name="streamFilter" value={streamFilter} onChange={(event) => onStreamFilterChange(event.target.value)}>
            <option value="all">All career clusters</option>
            {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
          </select>
        </label>
      </div>
      <p className="route-status" aria-live="polite">
        {hasDiscoveryInput
          ? `${visibleRoutes.length} exploration paths shown. Ranking uses selected interests and career reality sliders.`
          : hasWordMapInput
            ? `${visibleRoutes.length} starter routes shown from the Signal Deck. No personal fit is inferred.`
            : hasRouteFilters
              ? `${visibleRoutes.length} starter routes shown from search or cluster filters. No personal fit is inferred.`
              : "Search directly or filter by cluster. These are starter examples until a learner adds signals."}
      </p>
      {visibleRoutes.length ? (
        <div className="route-page-grid">
          {visibleRoutes.map((route) => (
            <ExplorationCard key={route.id} route={route} active={activePathwayId === route.id} hasInput={hasDiscoveryInput} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <div className="route-empty-state">No routes match those filters. Try a broader title, subject or career cluster.</div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Render career search only for `/careers`**

Inside `<main id="main-content">`, add:

```jsx
        {page === "career-search" ? (
          <CareerSearchPage
            routeSearch={routeSearch}
            streamFilter={streamFilter}
            routeStreams={routeStreams}
            visibleRoutes={visibleRoutes}
            hasDiscoveryInput={hasDiscoveryInput}
            hasWordMapInput={hasWordMapInput}
            hasRouteFilters={hasRouteFilters}
            activePathwayId={activePathwayId}
            onSearchChange={(value) => { setRouteSearch(value); setEntryMode("existing"); }}
            onStreamFilterChange={(value) => { setStreamFilter(value); setEntryMode("existing"); }}
            onSearchSubmit={handleCareerSearchSubmit}
            onOpen={openPathway}
          />
        ) : null}
```

- [ ] **Step 3: Add `PathwayPage` component**

Add:

```jsx
function PathwayPage({ route, pathwayRecord, selectedSubjects, onToggleSubject, headingRef }) {
  return (
    <section className="pathway-page" aria-labelledby="pathway-page-title">
      {route && pathwayRecord ? (
        <PathwayDetail
          route={route}
          pathwayRecord={pathwayRecord}
          selectedSubjects={selectedSubjects}
          onToggleSubject={onToggleSubject}
          headingRef={headingRef}
          headingLevel={1}
        />
      ) : (
        <div className="route-empty-state">
          <h1 id="pathway-page-title">Pathway unavailable</h1>
          <p>No starter pathway is available for this route.</p>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Allow `PathwayDetail` to use an `h1` on route pages**

Change the `PathwayDetail` signature to:

```jsx
function PathwayDetail({ route, pathwayRecord, selectedSubjects, onToggleSubject, headingRef, headingLevel = 2 }) {
```

Replace the heading block with:

```jsx
          {headingLevel === 1 ? (
            <h1 id="pathway-page-title" ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-normal outline-none sm:text-5xl">{route.title}</h1>
          ) : (
            <h2 ref={headingRef} tabIndex="-1" className="mt-3 text-4xl font-extrabold tracking-normal outline-none sm:text-5xl">{route.title}</h2>
          )}
```

- [ ] **Step 5: Render pathway detail only for `/careers/:careerId`**

Add to `<main id="main-content">`:

```jsx
        {page === "career-detail" ? (
          <PathwayPage
            route={detailRoute}
            pathwayRecord={detailPathwayRecord}
            selectedSubjects={selectedSubjects}
            onToggleSubject={toggleSubject}
            headingRef={pathwayHeadingRef}
          />
        ) : null}
```

- [ ] **Step 6: Add explainer page components**

Add:

```jsx
function SimpleInfoPage({ audience }) {
  const content = audience === "partners"
    ? {
        eyebrow: "Partner page",
        title: "For partners",
        body: "Careerize can help industry partners, providers and collaborators understand learner decision points without turning unverified claims into facts.",
        points: ["Support real-world pathway clarity.", "Keep provider and labour-market claims source-verified.", "Help learners compare practical next steps."],
      }
    : {
        eyebrow: "Guidance page",
        title: "For parents and teachers",
        body: "Careerize helps adults guide learner conversations while keeping clear boundaries around what Careerize can and cannot claim.",
        points: ["Use the Signal Deck as a conversation starter.", "Compare options instead of forcing a single answer.", "Verify subjects, APS, providers and dates before decisions."],
      };

  return (
    <section className="info-page" aria-labelledby="info-page-title">
      <p className="signal-eyebrow">{content.eyebrow}</p>
      <h1 id="info-page-title">{content.title}</h1>
      <p>{content.body}</p>
      <div className="info-page-points">
        {content.points.map((point) => <article key={point}>{point}</article>)}
      </div>
    </section>
  );
}
```

Render:

```jsx
        {page === "parents-teachers" ? <SimpleInfoPage audience="parents-teachers" /> : null}
        {page === "partners" ? <SimpleInfoPage audience="partners" /> : null}
```

- [ ] **Step 7: Add page CSS**

Add to `src/index.css`:

```css
  .route-page,
  .pathway-page,
  .info-page {
    @apply mx-auto max-w-[1240px] px-5 py-12 lg:py-16;
  }

  .route-page-heading h1,
  .info-page h1 {
    @apply mt-4 text-5xl font-extrabold leading-none text-forest-950 sm:text-6xl;
  }

  .route-page-heading p,
  .info-page > p {
    @apply mt-5 max-w-3xl text-base leading-7 text-forest-800/75;
  }

  .route-search-layout {
    @apply mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr];
  }

  .route-filter-label {
    @apply text-sm font-bold text-forest-900;
  }

  .route-filter-label select {
    @apply mt-2 w-full rounded-xl border border-sage-300 bg-cream-50 px-4 py-3 font-normal text-forest-900 transition duration-150 focus:border-forest-400;
  }

  .route-status {
    @apply mt-5 rounded-xl border border-sage-300 bg-sage-100 p-4 text-sm leading-6 text-forest-800;
  }

  .route-page-grid {
    @apply mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3;
  }

  .route-empty-state {
    @apply mt-6 rounded-xl border border-sage-300 bg-cream-50 p-6 text-forest-800/80;
  }

  .info-page-points {
    @apply mt-8 grid gap-4 md:grid-cols-3;
  }

  .info-page-points article {
    @apply rounded-2xl border border-sage-200 bg-white p-5 text-sm font-semibold leading-6 text-forest-800 shadow-elevation-1;
  }
```

- [ ] **Step 8: Run route tests**

Run: `npm run test:ui -- --run src/App.test.jsx -t "career search|pathway detail|explainer"`

Expected: route split tests pass after test selector adjustments in Task 5.

- [ ] **Step 9: Commit route views**

Run:

```bash
git add src/App.jsx src/index.css
git commit -m "feat: split career search and pathway views"
```

Expected: commit contains `src/App.jsx` and `src/index.css`.

## Task 5: Update Existing Interaction Tests To The New UI

**Files:**
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Update `renderApp`**

Replace:

```jsx
async function renderApp() {
  render(<App />);
  await screen.findByRole("heading", { name: /turn interests into career paths/i });
}
```

With:

```jsx
async function renderApp() {
  render(<App />);
  await screen.findByRole("heading", { name: /signal deck studio/i });
}
```

- [ ] **Step 2: Rename test suite**

Replace:

```jsx
describe("Careerize focused homepage and wordmap", () => {
```

With:

```jsx
describe("Careerize Signal Deck Studio and routed pathway pages", () => {
```

- [ ] **Step 3: Update taxonomy/rendering test expectations**

Rename `"renders only mapped interest words, categories, sliders and subject-risk options"` to `"renders mapped interest cards, categories, sliders and subject-risk options"`.

Replace the section that references the old list role:

```jsx
    const wordMap = screen.getByRole("list", { name: /mapped interest keywords/i });
    for (const preference of PREFERENCE_DEFINITIONS) {
      const slider = preferenceSlider(preference.id);
      expect(slider).toHaveAccessibleName(preference.label);
      expect(slider).toHaveValue(String(DEFAULT_LIFESTYLE_PREFERENCES[preference.id]));
      expect(slider.compareDocumentPosition(wordMap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
```

With:

```jsx
    expect(screen.getByTestId("interest-card")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: /selected signal mix/i })).toBeInTheDocument();
    for (const preference of PREFERENCE_DEFINITIONS) {
      const slider = preferenceSlider(preference.id);
      expect(slider).toHaveAccessibleName(preference.label);
      expect(slider).toHaveValue(String(DEFAULT_LIFESTYLE_PREFERENCES[preference.id]));
    }
```

- [ ] **Step 4: Update selection test text**

In `"selects and deselects wordmap interests and explains path suggestions"`, rename the test to `"selects and deselects Signal Deck interests and explains path suggestions"`.

Replace:

```jsx
    expect(screen.getByText(/No path is suggested yet/i)).toBeInTheDocument();
```

With:

```jsx
    expect(screen.getByText(/Add at least one interest card/i)).toBeInTheDocument();
```

- [ ] **Step 5: Update reset button query**

Replace:

```jsx
    await user.click(screen.getByRole("button", { name: /reset word map/i }));
```

With:

```jsx
    await user.click(screen.getByRole("button", { name: /^reset$/i }));
```

- [ ] **Step 6: Update pathway URL hydration test**

Replace the hydration test with:

```jsx
  it("hydrates linkable Signal Deck state from URL signals and pathway route", async () => {
    window.history.pushState({}, "", "/careers/data-analyst?signals=technology,care");
    await renderApp();

    expect(window.location.pathname).toBe("/careers/data-analyst");
    expect(window.location.search).toContain("signals=technology%2Ccare");
    expect(screen.getByRole("heading", { level: 1, name: "Data Analyst" })).toBeInTheDocument();
  });
```

- [ ] **Step 7: Run full UI test file**

Run: `npm run test:ui -- --run src/App.test.jsx`

Expected: PASS.

- [ ] **Step 8: Commit updated tests**

Run:

```bash
git add src/App.test.jsx
git commit -m "test: update signal deck interactions"
```

Expected: commit contains only `src/App.test.jsx`.

## Task 6: Final Visual Polish And Guardrail Cleanup

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Remove unused old word-map helpers if no references remain**

Search:

```bash
rg -n "InterestWordMap|layoutInterestNodes|word-map|word-graph|NODE_TONE_CLASS|CATEGORY_TONES" src/App.jsx src/index.css
```

If `InterestWordMap`, `layoutInterestNodes`, `NODE_TONE_CLASS` and old `.word-map-*` styles are unused after Task 3 and Task 4, remove them. Keep `CATEGORY_TONES` only if the new Signal Deck uses it.

- [ ] **Step 2: Add missing Tailwind colors if utility classes require them**

If `text-violet-700`, `bg-slate-50` and similar default Tailwind colors are already available, no Tailwind config change is required. If custom named utilities are used, add these to `tailwind.config.js`:

```js
        signal: {
          ink: "#101820",
          lime: "#C8FF4D",
          teal: "#14B8A6",
          coral: "#FB7185",
          sky: "#7DD3FC",
          violet: "#9F7AEA",
        },
```

Place under `theme.extend.colors`.

- [ ] **Step 3: Check responsive behavior manually in browser after implementation**

Run the dev server:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

Manual checks:

- `/` shows only Signal Deck Studio, no old two-entry homepage.
- `/careers` shows search/filter/results only.
- `/careers/data-analyst` shows a pathway detail page with an `h1`.
- `/for-parents-teachers` and `/for-partners` show short explainer pages without decision controls.
- At mobile width, the page stacks as deck, mix, results.
- Text does not overlap buttons, cards, sliders or route cards.

- [ ] **Step 4: Run CSS and copy scan**

Run:

```bash
rg -n "Interest word map|word map|word graph|Start with what you like|Entry path A|Entry path B|Careerize helps young people connect raw interests" src
```

Expected: no matches in rendered UI code. If matches remain in tests or removed legacy comments, delete or update them.

- [ ] **Step 5: Commit cleanup**

Run:

```bash
git add src/App.jsx src/index.css tailwind.config.js
git commit -m "style: polish signal deck studio"
```

Expected: commit includes only files changed during cleanup.

## Task 7: Verification

**Files:**
- No file changes unless verification reveals a defect.

- [ ] **Step 1: Run focused UI tests**

Run: `npm run test:ui -- --run src/App.test.jsx`

Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS and Vite emits production assets in `dist`.

- [ ] **Step 3: Run browser smoke if build passes**

Run: `npm run smoke:browser`

Expected: PASS. If Chromium or browser setup is unavailable, capture the exact error and do not claim smoke coverage.

- [ ] **Step 4: Run the full test command**

Run: `npm test`

Expected: PASS. If long-running catalog exports or validations fail, report the exact script and error.

- [ ] **Step 5: Final status check**

Run:

```bash
git status --short
```

Expected: only intended implementation files are modified or staged. `.codex-temp/` remains ignored. `.superpowers/` preview files are not staged.

## Spec Coverage Self-Review

- Front page as decision guidance product: Task 3.
- A+C hybrid interaction: Task 3.
- Remove unnecessary front-page explanation: Task 3 and Task 4.
- Separate direct career search: Task 4.
- Separate full pathway detail route: Task 4.
- Separate parent/teacher and partner explanation pages: Task 4.
- Preserve existing data/scoring and verification boundaries: Task 3, Task 4 and Task 7.
- Empty, limit and reset states: Task 3 and Task 5.
- Accessibility and responsive behavior: Task 3, Task 5 and Task 6.
- Tests and build verification: Task 1, Task 5 and Task 7.

No spec requirement is intentionally left out of this implementation plan.
