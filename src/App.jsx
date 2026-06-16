import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  Flag,
  Gauge,
  GraduationCap,
  Heart,
  Lock,
  LogIn,
  LogOut,
  Map,
  Menu,
  NotebookPen,
  Play,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog";
import {
  getCurrentSession,
  hasSupabaseConfig,
  loadSavedDiscovery,
  saveDiscovery,
  signInOrCreateLearner,
  signOutLearner,
} from "./lib/savedDiscovery";
import { getProfileProgress, rankCareerRoutes, toggleSignal } from "./lib/scoring";

const ICONS = {
  Brain,
  Briefcase,
  Check,
  Gauge,
  Heart,
  Users,
  Wrench,
  Zap,
  ShieldCheck,
  Sparkles,
};

const QUESTS = [
  { title: "Start your map", text: "Answer the 4 starter prompts", xp: 40, icon: Compass },
  { title: "Save a path", text: "Pick one career to keep in your record", xp: 25, icon: Star },
  { title: "Reality check", text: "Read the best and hardest parts", xp: 20, icon: Eye },
  { title: "Compare options", text: "Open two paths before choosing", xp: 30, icon: Target },
];

const CATEGORY_FILTERS = [
  { label: "All worlds", value: "all", hint: "Modern, emerging and established" },
  { label: "Digital & AI", value: "technology", hint: "Software, data, cyber, automation" },
  { label: "Health & care", value: "health", hint: "People, science, service" },
  { label: "Hands-on systems", value: "technical", hint: "Energy, trades, machines" },
  { label: "Business & growth", value: "business", hint: "Money, logistics, customers" },
];

const EXAMPLE_CAREERS = ["robotic-surgery-operator", "cybersecurity-analyst", "solar-pv-installer"];

function routeCategory(route) {
  const text = `${route.id} ${route.title} ${route.stream}`.toLowerCase();
  if (text.includes("health") || text.includes("medical") || text.includes("care")) return "health";
  if (text.includes("software") || text.includes("data") || text.includes("cyber") || text.includes("digital") || text.includes("robot")) return "technology";
  if (text.includes("artisan") || text.includes("solar") || text.includes("technical") || text.includes("energy")) return "technical";
  if (text.includes("business") || text.includes("finance") || text.includes("logistics") || text.includes("marketing") || text.includes("supply")) return "business";
  return "all";
}

function shortStream(stream = "") {
  return stream.split(" and ")[0];
}

const DEFAULT_PERSONAL_RECORD = { savedCareerIds: [], exploredCareerIds: [], notes: {} };

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("public");
  const [authMode, setAuthMode] = useState("register");
  const [demoActive, setDemoActive] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSignals, setSelectedSignals] = useState([]);
  const [manualActiveId, setManualActiveId] = useState(null);
  const [category, setCategory] = useState("all");
  const [session, setSession] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [authNotice, setAuthNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [personalRecord, setPersonalRecord] = useState(DEFAULT_PERSONAL_RECORD);
  const [compareIds, setCompareIds] = useState([]);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals),
    [answers, selectedSignals]
  );

  const active = ranked.find((route) => route.id === manualActiveId) || ranked[0];
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);
  const hasStartedDiscovery = progress > 0 || selectedSignals.length > 0 || demoActive;
  const isSignedIn = Boolean(session);
  const isPersonalWorkspace = isSignedIn || demoActive;
  const savedRoutes = personalRecord.savedCareerIds
    .map((id) => CAREER_ROUTES.find((route) => route.id === id))
    .filter(Boolean);
  const exploredRoutes = personalRecord.exploredCareerIds
    .map((id) => CAREER_ROUTES.find((route) => route.id === id))
    .filter(Boolean);
  const filteredRoutes = ranked.filter((route) => category === "all" || routeCategory(route) === category);
  const visibleRecommendations = (hasStartedDiscovery ? filteredRoutes : CAREER_ROUTES.filter((route) => EXAMPLE_CAREERS.includes(route.id))).slice(0, 6);
  const xp = Math.min(240, progress * 2 + personalRecord.savedCareerIds.length * 25 + personalRecord.exploredCareerIds.length * 12 + selectedSignals.length * 4);
  const level = Math.max(1, Math.floor(xp / 60) + 1);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const currentSession = await getCurrentSession();
        if (cancelled) return;
        setSession(currentSession);

        if (currentSession) {
          const saved = await loadSavedDiscovery(currentSession);
          if (cancelled) return;
          if (saved) {
            setAnswers(saved.answers ?? {});
            setSelectedSignals(saved.selected_signals ?? []);
            setManualActiveId(saved.best_match ?? null);
            setPersonalRecord({ ...DEFAULT_PERSONAL_RECORD, ...(saved.personal_record ?? {}) });
            setSavedAt(saved.updated_at ?? null);
            setView("app");
            setAuthNotice("Welcome back. Your Careerize map has been restored.");
          }
        }
      } catch (error) {
        if (!cancelled) setAuthError(error.message || "We could not restore your saved Careerize map.");
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  function choose(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setManualActiveId(null);
    setView("app");
  }

  function toggleInterestSignal(signal) {
    setSelectedSignals((prev) => toggleSignal(prev, signal));
    setManualActiveId(null);
    setView("app");
  }

  function resetDiscovery() {
    setAnswers({});
    setSelectedSignals([]);
    setManualActiveId(null);
    setCategory("all");
  }

  function startDemo() {
    setDemoActive(true);
    setView("app");
    setAuthMode("register");
    setAuthNotice("Demo profile started. You can explore instantly, but demo progress is not saved long term.");
    setAuthError("");
  }

  function openAuth(mode = "register") {
    setAuthMode(mode);
    setView("auth");
    setAuthError("");
    setAuthNotice("");
  }

  async function handleSignIn(credentials) {
    setAuthError("");
    setAuthNotice("");
    setIsAuthLoading(true);

    try {
      const nextSession = await signInOrCreateLearner(credentials);
      setSession(nextSession);
      setDemoActive(false);
      const saved = await loadSavedDiscovery(nextSession);
      if (saved) {
        setAnswers(saved.answers ?? {});
        setSelectedSignals(saved.selected_signals ?? []);
        setManualActiveId(saved.best_match ?? null);
        setPersonalRecord({ ...DEFAULT_PERSONAL_RECORD, ...(saved.personal_record ?? {}) });
        setSavedAt(saved.updated_at ?? null);
        setAuthNotice("Your saved career map has been restored.");
      } else {
        setAuthNotice("Profile ready. Save your map when you want to keep progress.");
      }
      setView("app");
    } catch (error) {
      setAuthError(error.message || "Sign in failed. Check your details and try again.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSave() {
    if (demoActive && !session) {
      setAuthMode("register");
      setView("auth");
      setAuthError("Create a profile to save progress. Demo mode does not store personal records long term.");
      return;
    }

    setAuthError("");
    setAuthNotice("");
    setIsSaving(true);

    try {
      const record = await saveDiscovery(session, {
        answers,
        selectedSignals,
        rankedResults: ranked,
        bestMatch: active.id,
        matchPercent: active.matchPercent,
        progress,
        personalRecord,
      });
      setSavedAt(record.updated_at);
      setAuthNotice("Saved. You can log out and return to this Careerize map later.");
    } catch (error) {
      setAuthError(error.message || "We could not save your Careerize map.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setAuthError("");
    setAuthNotice("");
    setIsAuthLoading(true);

    try {
      await signOutLearner();
      setSession(null);
      setSavedAt(null);
      setDemoActive(false);
      setView("public");
      setAuthNotice("Logged out. This device no longer has an active Careerize session.");
    } catch (error) {
      setAuthError(error.message || "Logout failed.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  function markExplored(routeId) {
    setPersonalRecord((current) => ({
      ...current,
      exploredCareerIds: current.exploredCareerIds.includes(routeId)
        ? current.exploredCareerIds
        : [...current.exploredCareerIds, routeId],
    }));
  }

  function toggleSaved(routeId) {
    if (demoActive && !session) {
      setAuthMode("register");
      setView("auth");
      setAuthError("Demo users can explore, but saving a personal record needs a Careerize profile.");
      return;
    }

    setPersonalRecord((current) => ({
      ...current,
      savedCareerIds: current.savedCareerIds.includes(routeId)
        ? current.savedCareerIds.filter((id) => id !== routeId)
        : [...current.savedCareerIds, routeId],
    }));
  }

  function updateNote(routeId, note) {
    if (demoActive && !session) {
      setAuthMode("register");
      setView("auth");
      setAuthError("Create a profile before saving private notes. Demo mode does not store personal information.");
      return;
    }

    setPersonalRecord((current) => ({
      ...current,
      notes: { ...current.notes, [routeId]: note },
    }));
  }

  function toggleCompare(routeId) {
    setCompareIds((current) => {
      if (current.includes(routeId)) return current.filter((id) => id !== routeId);
      return [...current.slice(-1), routeId];
    });
  }

  return (
    <main id="top" className="relative min-h-screen overflow-x-clip bg-[#fbf8f2] text-slate-950">
      <SoftBackground />
      <SiteHeader
        open={open}
        setOpen={setOpen}
        isPersonalWorkspace={isPersonalWorkspace}
        onLogo={() => setView("public")}
        onRegister={() => openAuth("register")}
        onLogin={() => openAuth("login")}
        onDemo={startDemo}
      />

      <AnimatePresence mode="wait">
        {view === "public" && (
          <motion.div key="public" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <LandingPage onRegister={() => openAuth("register")} onLogin={() => openAuth("login")} onDemo={startDemo} />
          </motion.div>
        )}

        {view === "auth" && (
          <motion.div key="auth" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <AuthPage
              mode={authMode}
              setMode={setAuthMode}
              onSubmit={handleSignIn}
              onDemo={startDemo}
              isAuthLoading={isAuthLoading}
              authError={authError}
              authNotice={authNotice}
            />
          </motion.div>
        )}

        {view === "app" && (
          <motion.div key="app" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <CareerWorkspace
              session={session}
              demoActive={demoActive}
              savedAt={savedAt}
              authNotice={authNotice}
              authError={authError}
              isSaving={isSaving}
              isAuthLoading={isAuthLoading}
              progress={progress}
              xp={xp}
              level={level}
              answers={answers}
              selectedSignals={selectedSignals}
              active={active}
              ranked={ranked}
              visibleRecommendations={visibleRecommendations}
              savedRoutes={savedRoutes}
              exploredRoutes={exploredRoutes}
              personalRecord={personalRecord}
              compareIds={compareIds}
              category={category}
              onChoose={choose}
              onToggleSignal={toggleInterestSignal}
              onReset={resetDiscovery}
              onSave={handleSave}
              onSignOut={handleSignOut}
              onRegister={() => openAuth("register")}
              onSelectRoute={(routeId) => {
                setManualActiveId(routeId);
                markExplored(routeId);
              }}
              onToggleSaved={toggleSaved}
              onToggleCompare={toggleCompare}
              onUpdateNote={updateNote}
              onCategory={setCategory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-10 pt-14 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3"><LogoMark small /> <span>© 2026 Careerize · Career exploration can change as you grow.</span></div>
        <div className="flex flex-wrap gap-5"><button onClick={() => setView("public")} className="hover:text-slate-900">Home</button><button onClick={() => openAuth("register")} className="hover:text-slate-900">Create profile</button><a href="mailto:hello@careerize.co.za" className="hover:text-slate-900">Partner with us</a></div>
      </footer>
    </main>
  );
}

function SiteHeader({ open, setOpen, isPersonalWorkspace, onLogo, onRegister, onLogin, onDemo }) {
  const links = isPersonalWorkspace
    ? [{ label: "Dashboard", href: "#dashboard" }, { label: "Quests", href: "#quests" }, { label: "Explore", href: "#explore" }, { label: "Record", href: "#record" }]
    : [{ label: "How it works", href: "#how" }, { label: "Examples", href: "#examples" }, { label: "Why", href: "#why" }];

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[#fbf8f2]/82 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button type="button" onClick={onLogo} className="flex items-center gap-3 text-left" aria-label="Careerize home">
          <LogoMark />
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-950">Careerize</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Build your career map</div>
          </div>
        </button>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Primary navigation">
          {links.map((item) => <a key={item.href} href={item.href} className="hover:text-indigo-700">{item.label}</a>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={onLogin} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Log in</button>
          <button type="button" onClick={onDemo} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-indigo-200">Try demo</button>
          <button type="button" onClick={onRegister} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/70 hover:bg-indigo-700">Create profile</button>
        </div>

        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} className="rounded-2xl border border-slate-200 bg-white p-2 md:hidden">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-slate-700" aria-label="Mobile navigation">
            {links.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
            <button type="button" onClick={onRegister} className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Create profile</button>
            <button type="button" onClick={onLogin} className="rounded-full border border-slate-200 px-5 py-3 font-semibold">Log in</button>
            <button type="button" onClick={onDemo} className="rounded-full border border-indigo-100 bg-indigo-50 px-5 py-3 font-semibold text-indigo-800">Try demo profile</button>
          </nav>
        </div>
      )}
    </header>
  );
}

function LandingPage({ onRegister, onLogin, onDemo }) {
  const examples = EXAMPLE_CAREERS.map((id) => CAREER_ROUTES.find((route) => route.id === id)).filter(Boolean);

  return (
    <>
      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 md:grid-cols-[1.02fr_0.98fr] md:pb-24 md:pt-20">
        <div className="flex flex-col justify-center">
          <Pill><Sparkles size={14} /> Career intelligence for curious humans, ages 15+</Pill>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.055em] text-slate-950 md:text-7xl">
            Explore careers like a map, not a wall of job titles.
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Careerize helps you discover modern, emerging and established paths, understand the real day-to-day work, and save a personal record as your interests change.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={onRegister} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 text-base font-bold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700">
              Create your Careerize profile <ArrowRight size={18} />
            </button>
            <button type="button" onClick={onLogin} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-800">
              Log in <LogIn size={18} />
            </button>
          </div>
          <button type="button" onClick={onDemo} className="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-1 text-sm font-semibold text-indigo-700 hover:text-indigo-950">
            <Play size={16} /> Try a demo profile — explore instantly, no long-term progress saved
          </button>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <MiniStat value="10 sec" label="to understand the product" />
            <MiniStat value="3 steps" label="from curiosity to map" />
            <MiniStat value="0" label="career labels locked in" />
          </div>
        </div>
        <LandingPreview examples={examples} />
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <SectionHeading eyebrow="How it works" title="Start simple. Reveal depth only when it helps." text="The home page stays light. The detailed career intelligence appears after you choose what feels relevant." />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <StepCard number="01" icon={Compass} title="Explore career paths" text="Choose a few interests or answer starter prompts. Careerize turns curiosity into a small set of paths." />
          <StepCard number="02" icon={Eye} title="Understand the real work" text="Open cards that explain the day-to-day, tools, skills, tradeoffs, entry routes and growth options." />
          <StepCard number="03" icon={NotebookPen} title="Build your career map" text="Create a profile to save paths, notes, comparisons and progress so your record grows with you." />
        </div>
      </section>

      <section id="examples" className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <SectionHeading eyebrow="Swift examples" title="A few paths to spark possibilities." text="Careerize mixes known jobs with newer and less obvious careers so users can discover options they may not have thought about." />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {examples.map((route) => <PublicCareerExample key={route.id} route={route} onDemo={onDemo} />)}
        </div>
      </section>

      <section id="why" className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <SoftCard className="bg-slate-950 text-white">
            <Pill dark><ShieldCheck size={14} /> Designed for trust</Pill>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-[-0.045em] md:text-5xl">Career exploration should create confidence, not pressure.</h2>
            <p className="mt-5 text-white/70">Careerize does not tell users what they must become. It gives clear, explainable guidance, shows tradeoffs, and reminds people that paths can change over time.</p>
          </SoftCard>
          <div className="grid gap-5 sm:grid-cols-2">
            <Benefit icon={Brain} title="Reduce career confusion" text="Turn vague interests into structured paths without overwhelming users." />
            <Benefit icon={Map} title="Compare routes" text="See day-to-day work, skills, preparation and tradeoffs side by side." />
            <Benefit icon={Save} title="Keep personal records" text="Profiles preserve saved paths, notes and exploration history when auth is configured." />
            <Benefit icon={Heart} title="Stay flexible" text="Users can change answers any time; no quiz result becomes their identity." />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12">
        <SoftCard className="overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
          <div className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <Pill><Lock size={14} /> Demo and privacy</Pill>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-[-0.045em] md:text-6xl">Start building your career map.</h2>
              <p className="mt-5 max-w-2xl text-slate-600">Try the demo for instant exploration. Create a profile when you want saved progress, private notes and a record you can return to later.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={onRegister} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-4 font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700">Create your profile <ArrowRight size={18} /></button>
              <button type="button" onClick={onDemo} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 hover:border-indigo-200">Try demo profile <Play size={18} /></button>
            </div>
          </div>
        </SoftCard>
      </section>
    </>
  );
}

function LandingPreview({ examples }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-200/60 via-sky-100 to-emerald-100 blur-3xl" />
      <SoftCard className="relative overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <Pill><Trophy size={14} /> Career quest preview</Pill>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Level 2 explorer</span>
        </div>
        <div className="mt-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500"><span>Exploration progress</span><span>38%</span></div>
          <div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 w-[38%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" /></div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Next quest: open one career and write what surprised you.</p>
        </div>
        <div className="mt-5 space-y-3">
          {examples.map((route, index) => (
            <div key={route.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{route.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{shortStream(route.stream)}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Quest {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </SoftCard>
    </motion.div>
  );
}

function AuthPage({ mode, setMode, onSubmit, onDemo, isAuthLoading, authError, authNotice }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isRegister = mode === "register";

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-20">
      <div className="flex flex-col justify-center">
        <Pill><Lock size={14} /> Personal recordkeeping</Pill>
        <h1 className="mt-5 font-display text-5xl font-bold leading-tight tracking-[-0.05em] text-slate-950 md:text-6xl">
          {isRegister ? "Create a profile to keep your career map." : "Log back in to continue exploring."}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Your profile can keep answers, saved paths, notes and exploration history. If Supabase is not configured, Careerize clearly uses browser-local fallback storage.
        </p>
        <button type="button" onClick={onDemo} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white px-5 py-3 text-sm font-bold text-indigo-800 shadow-sm">
          <Play size={16} /> Use demo instead — no long-term saving
        </button>
      </div>
      <SoftCard>
        <div className="mb-5 inline-flex rounded-full bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("register")} className={`rounded-full px-4 py-2 text-sm font-bold ${isRegister ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Register</button>
          <button type="button" onClick={() => setMode("login")} className={`rounded-full px-4 py-2 text-sm font-bold ${!isRegister ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Log in</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <label className="block text-sm font-semibold text-slate-700" htmlFor="learner-name">
              Name or nickname
              <input id="learner-name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="What should Careerize call you?" />
            </label>
          )}
          <label className="block text-sm font-semibold text-slate-700" htmlFor="learner-email">
            Email
            <input id="learner-email" required type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" />
          </label>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="learner-password">
            Password
            <input id="learner-password" required type="password" minLength={6} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 6 characters" />
          </label>
          <button type="submit" disabled={isAuthLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 font-bold text-white shadow-xl shadow-indigo-100 disabled:cursor-not-allowed disabled:opacity-60">
            {isAuthLoading ? "Please wait..." : isRegister ? "Create my Careerize profile" : "Log in and restore my map"} <ArrowRight size={18} />
          </button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          {hasSupabaseConfig ? "Supabase auth is configured for cross-device records." : "Local fallback mode is active in this environment. Configure Supabase for production records."}
        </p>
        {(authError || authNotice) && <Notice tone={authError ? "error" : "success"}>{authError || authNotice}</Notice>}
      </SoftCard>
    </section>
  );
}

function CareerWorkspace(props) {
  const {
    session,
    demoActive,
    savedAt,
    authNotice,
    authError,
    isSaving,
    isAuthLoading,
    progress,
    xp,
    level,
    answers,
    selectedSignals,
    active,
    ranked,
    visibleRecommendations,
    savedRoutes,
    exploredRoutes,
    personalRecord,
    compareIds,
    category,
    onChoose,
    onToggleSignal,
    onReset,
    onSave,
    onSignOut,
    onRegister,
    onSelectRoute,
    onToggleSaved,
    onToggleCompare,
    onUpdateNote,
    onCategory,
  } = props;

  const comparedRoutes = compareIds.map((id) => CAREER_ROUTES.find((route) => route.id === id)).filter(Boolean);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10">
      <section id="dashboard" className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <SoftCard className="bg-gradient-to-br from-white via-indigo-50 to-emerald-50">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <Pill><Compass size={14} /> {demoActive ? "Demo workspace" : session ? "Saved workspace" : "Career workspace"}</Pill>
              <h1 className="mt-5 font-display text-4xl font-bold tracking-[-0.045em] text-slate-950 md:text-6xl">
                {session ? `Welcome back${session.name ? `, ${session.name.split("@")[0]}` : ""}.` : demoActive ? "Explore freely in demo mode." : "Start your career quest."}
              </h1>
              <p className="mt-4 max-w-2xl text-slate-600">Choose a path, inspect the real work, save what matters and keep changing your map as you learn more about yourself.</p>
            </div>
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm md:min-w-64">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500"><span>Map progress</span><span>{progress}%</span></div>
              <div className="mt-3 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style={{ width: `${Math.max(progress, 8)}%` }} /></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat value={`L${level}`} label="Explorer level" />
                <MiniStat value={xp} label="Discovery XP" />
              </div>
            </div>
          </div>
        </SoftCard>
        <AccountStatus session={session} demoActive={demoActive} savedAt={savedAt} isSaving={isSaving} isAuthLoading={isAuthLoading} onSave={onSave} onSignOut={onSignOut} onRegister={onRegister} />
      </section>

      {(authError || authNotice) && <Notice tone={authError ? "error" : "success"}>{authError || authNotice}</Notice>}

      {demoActive && <DemoNotice onRegister={onRegister} />}

      <section id="quests" className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <SoftCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Pill><Map size={14} /> Career Quest Map</Pill>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em]">Your next actions</h2>
            </div>
            <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={16} /> Reset prompts</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {QUESTS.map((quest, index) => <QuestCard key={quest.title} quest={quest} complete={index === 0 ? progress === 100 : index === 1 ? personalRecord.savedCareerIds.length > 0 : index === 2 ? personalRecord.exploredCareerIds.length > 0 : compareIds.length > 1} />)}
          </div>
        </SoftCard>
        <DiscoveryPrompts answers={answers} selectedSignals={selectedSignals} onChoose={onChoose} onToggleSignal={onToggleSignal} />
      </section>

      <section id="explore" className="mt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Explore by world" title="Choose your next path without overwhelm." text="Careerize shows a focused set first. Use career worlds to browse in clear clusters, then open details when a card feels interesting." />
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Career category filters">
            {CATEGORY_FILTERS.map((item) => <button key={item.value} type="button" onClick={() => onCategory(item.value)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${category === item.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{item.label}</button>)}
          </div>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecommendations.map((route) => (
            <CareerDiscoveryCard
              key={route.id}
              route={route}
              active={active?.id === route.id}
              saved={personalRecord.savedCareerIds.includes(route.id)}
              compared={compareIds.includes(route.id)}
              onExplore={() => onSelectRoute(route.id)}
              onSave={() => onToggleSaved(route.id)}
              onCompare={() => onToggleCompare(route.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <CareerDetail route={active} saved={personalRecord.savedCareerIds.includes(active.id)} note={personalRecord.notes[active.id] ?? ""} onSave={() => onToggleSaved(active.id)} onExplore={() => onSelectRoute(active.id)} onCompare={() => onToggleCompare(active.id)} onUpdateNote={(note) => onUpdateNote(active.id, note)} />
        <PersonalRecord savedRoutes={savedRoutes} exploredRoutes={exploredRoutes} comparedRoutes={comparedRoutes} onSelectRoute={onSelectRoute} />
      </section>
    </div>
  );
}

function AccountStatus({ session, demoActive, savedAt, isSaving, isAuthLoading, onSave, onSignOut, onRegister }) {
  return (
    <SoftCard>
      <Pill><Lock size={14} /> Record status</Pill>
      <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em]">{session ? "Your progress can be saved." : demoActive ? "Demo mode is active." : "Create a profile to save."}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {session ? `Signed in as ${session.email}. ${savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}.` : "Save when you want to keep this version."}` : "Demo mode does not store personal data or long-term progress. Register when you want a permanent map."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={session ? onSave : onRegister} disabled={isSaving || isAuthLoading} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={16} /> {session ? isSaving ? "Saving..." : "Save map" : "Create profile"}
        </button>
        {session && <button type="button" onClick={onSignOut} disabled={isAuthLoading} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"><LogOut size={16} /> Log out</button>}
      </div>
    </SoftCard>
  );
}

function DemoNotice({ onRegister }) {
  return (
    <div className="mt-5 rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p><strong>Demo profile:</strong> explore instantly, but do not enter private notes here. Create a profile to save progress across sessions.</p>
        <button type="button" onClick={onRegister} className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-900 px-4 py-2 font-bold text-white">Save for real <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function DiscoveryPrompts({ answers, selectedSignals, onChoose, onToggleSignal }) {
  const visibleSignals = selectedSignals.length || Object.keys(answers).length ? INTEREST_SIGNALS : INTEREST_SIGNALS.slice(0, 10);
  return (
    <SoftCard>
      <Pill><Search size={14} /> Guided discovery</Pill>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em]">Answer lightly. Change anytime.</h2>
      <div className="mt-6 space-y-5">
        {DISCOVERY_QUESTIONS.map((question) => (
          <fieldset key={question.id}>
            <legend className="text-sm font-bold text-slate-800">{question.label}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const activeChoice = answers[question.id] === option.value;
                return <button key={option.value} type="button" onClick={() => onChoose(question.id, option.value)} aria-pressed={activeChoice} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${activeChoice ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200"}`}>{option.label}</button>;
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-sm font-bold text-slate-800">Interest badges</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleSignals.map((signal) => {
            const Icon = ICONS[signal.icon] ?? Sparkles;
            const activeSignal = selectedSignals.includes(signal.value);
            return <button key={signal.value} type="button" onClick={() => onToggleSignal(signal.value)} aria-pressed={activeSignal} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition ${activeSignal ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200"}`}><Icon size={14} /> {signal.label}</button>;
          })}
        </div>
      </div>
    </SoftCard>
  );
}

function CareerDiscoveryCard({ route, active, saved, compared, onExplore, onSave, onCompare }) {
  return (
    <article className={`group rounded-[2rem] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100 ${active ? "border-indigo-300 ring-4 ring-indigo-100" : "border-slate-100"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{shortStream(route.stream)}</span>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em] text-slate-950">{route.title}</h3>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{route.matchPercent ?? 0}% signal</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{route.summary}</p>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">What you’ll actually do</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{route.day}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
        {Object.keys(route.signalWeights ?? {}).slice(0, 4).map((signal) => <span key={signal} className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{signal}</span>)}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onExplore} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white">Explore <ChevronRight size={16} /></button>
        <button type="button" onClick={onSave} className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold ${saved ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}><Star size={16} /> {saved ? "Saved" : "Save"}</button>
        <button type="button" onClick={onCompare} className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold ${compared ? "border-indigo-200 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-600"}`}>Compare</button>
      </div>
    </article>
  );
}

function CareerDetail({ route, saved, note, onSave, onExplore, onCompare, onUpdateNote }) {
  const items = [
    ["Overview", route.summary, BookOpen],
    ["Day in the life", route.day, Clock],
    ["Skills and tools", route.tools, Wrench],
    ["Education or entry", route.environment, GraduationCap],
    ["Growth", route.growth, Trophy],
    ["Preparation level", route.stress, Gauge],
  ];

  return (
    <SoftCard>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Pill><Flag size={14} /> Career detail</Pill>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.045em] text-slate-950">{route.title}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{route.stream}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onExplore} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Mark explored</button>
          <button type="button" onClick={onCompare} className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800">Compare</button>
          <button type="button" onClick={onSave} className={`rounded-full px-4 py-2 text-sm font-bold ${saved ? "bg-emerald-100 text-emerald-800" : "bg-slate-950 text-white"}`}>{saved ? "Saved" : "Save to my record"}</button>
        </div>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map(([title, text, Icon]) => <DetailTile key={title} icon={Icon} title={title} text={text} />)}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Tradeoff icon={ThumbsUp} title="What can feel good" text={route.best} tone="good" />
        <Tradeoff icon={ThumbsDown} title="Tradeoff to understand" text={route.worst} tone="hard" />
      </div>
      <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor={`note-${route.id}`}>
        Private note for your career map
        <textarea id={`note-${route.id}`} value={note} onChange={(event) => onUpdateNote(event.target.value)} placeholder="What surprised you? What would you like to ask someone in this career?" className="mt-2 min-h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
      </label>
      {Array.isArray(route.researchBasis) && route.researchBasis.length > 0 && (
        <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-5">
          <div className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck size={18} /> Research basis</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {route.researchBasis.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-800">{source.label}</a>)}
          </div>
        </div>
      )}
    </SoftCard>
  );
}

function PersonalRecord({ savedRoutes, exploredRoutes, comparedRoutes, onSelectRoute }) {
  return (
    <SoftCard id="record">
      <Pill><NotebookPen size={14} /> Personal progress record</Pill>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em]">Saved, explored and compared paths</h2>
      <RecordList title="Saved careers" routes={savedRoutes} empty="Save careers to build your personal map." onSelectRoute={onSelectRoute} />
      <RecordList title="Recently explored" routes={exploredRoutes.slice(-4).reverse()} empty="Open a career detail to add it to recent exploration." onSelectRoute={onSelectRoute} />
      <RecordList title="Compare board" routes={comparedRoutes} empty="Add up to two careers to compare." onSelectRoute={onSelectRoute} />
      <div className="mt-5 rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950">
        Careerize records exploration signals. It does not decide your identity, replace counselling or make hiring decisions.
      </div>
    </SoftCard>
  );
}

function RecordList({ title, routes, empty, onSelectRoute }) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-3 space-y-2">
        {routes.length ? routes.map((route) => <button key={route.id} type="button" onClick={() => onSelectRoute(route.id)} className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-left text-sm font-bold text-slate-700 hover:border-indigo-200"><span>{route.title}</span><ChevronRight size={16} /></button>) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function PublicCareerExample({ route, onDemo }) {
  return (
    <SoftCard className="transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100">
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{shortStream(route.stream)}</span>
      <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em]">{route.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{route.summary}</p>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"><strong>Day-to-day:</strong> {route.day}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.keys(route.signalWeights ?? {}).slice(0, 3).map((signal) => <span key={signal} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{signal}</span>)}
      </div>
      <button type="button" onClick={onDemo} className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Explore in demo <ArrowRight size={16} /></button>
    </SoftCard>
  );
}

function QuestCard({ quest, complete }) {
  const Icon = quest.icon;
  return (
    <div className={`rounded-3xl border p-4 ${complete ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-white"}`}>
      <div className="flex items-start gap-3">
        <span className={`rounded-2xl p-3 ${complete ? "bg-emerald-100 text-emerald-800" : "bg-indigo-50 text-indigo-700"}`}><Icon size={20} /></span>
        <div><h3 className="font-bold text-slate-900">{quest.title}</h3><p className="mt-1 text-sm leading-5 text-slate-500">{quest.text}</p><p className="mt-2 text-xs font-bold text-slate-400">+{quest.xp} XP</p></div>
      </div>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, text }) {
  return <SoftCard><div className="flex items-center justify-between"><span className="font-display text-4xl font-bold text-indigo-100">{number}</span><span className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><Icon size={22} /></span></div><h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.035em]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></SoftCard>;
}

function Benefit({ icon: Icon, title, text }) {
  return <SoftCard><span className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Icon size={22} /></span><h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.035em]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></SoftCard>;
}

function DetailTile({ icon: Icon, title, text }) {
  return <div className="rounded-3xl border border-slate-100 bg-white p-5"><div className="flex items-center gap-3"><span className="rounded-2xl bg-indigo-50 p-2 text-indigo-700"><Icon size={18} /></span><h3 className="font-bold text-slate-900">{title}</h3></div><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></div>;
}

function Tradeoff({ icon: Icon, title, text, tone }) {
  const styles = tone === "good" ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-rose-100 bg-rose-50 text-rose-950";
  return <div className={`rounded-3xl border p-5 ${styles}`}><div className="flex items-center gap-2 font-bold"><Icon size={18} /> {title}</div><p className="mt-3 text-sm leading-6 opacity-80">{text}</p></div>;
}

function SectionHeading({ eyebrow, title, text }) {
  return <div className="max-w-3xl"><Pill>{eyebrow}</Pill><h2 className="mt-5 font-display text-4xl font-bold leading-tight tracking-[-0.045em] text-slate-950 md:text-5xl">{title}</h2><p className="mt-4 text-base leading-7 text-slate-600">{text}</p></div>;
}

function MiniStat({ value, label }) {
  return <div className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm"><div className="font-display text-2xl font-bold text-slate-950">{value}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div></div>;
}

function Notice({ children, tone }) {
  return <div className={`mt-5 rounded-3xl border p-4 text-sm font-semibold leading-6 ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>{children}</div>;
}

function SoftCard({ children, className = "", id }) {
  return <div id={id} className={`rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-[0_24px_80px_-45px_rgba(79,70,229,.45)] backdrop-blur-xl md:p-7 ${className}`}>{children}</div>;
}

function Pill({ children, dark = false }) {
  return <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${dark ? "border-white/15 bg-white/10 text-white/65" : "border-indigo-100 bg-white/75 text-indigo-700"}`}>{children}</div>;
}

function LogoMark({ small = false }) {
  return <div className={`${small ? "h-8 w-8" : "h-10 w-10"} grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-300 text-white shadow-lg shadow-indigo-200`}><Compass size={small ? 16 : 20} /></div>;
}

function SoftBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/65 blur-3xl" />
      <div className="absolute right-0 top-36 h-96 w-96 rounded-full bg-emerald-100/90 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-orange-100/80 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,.08)_1px,transparent_1px)] [background-size:30px_30px] opacity-40" />
    </div>
  );
}
