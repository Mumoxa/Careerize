import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Eye,
  Flag,
  Gauge,
  GraduationCap,
  Heart,
  Lightbulb,
  Lock,
  LogIn,
  LogOut,
  Map,
  Menu,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog";
import { getAcademicPathwayForCareer } from "./data/careerPathwayGraph";
import {
  getCurrentSession,
  hasSupabaseConfig,
  loadLearnerProfile,
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
};

const NAV_ITEMS = [
  { id: "discover", label: "Discovery" },
  { id: "reality", label: "Reality Check" },
  { id: "pathway", label: "Pathway" },
  { id: "trust", label: "Trust" },
];

const DEFAULT_SIGNALS = [];
const EMPTY_PROFILE = {
  preferredName: "",
  stage: "",
  location: "",
  subjects: "",
  notes: "",
};

export default function App() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSignals, setSelectedSignals] = useState(DEFAULT_SIGNALS);
  const [manualActiveId, setManualActiveId] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(EMPTY_PROFILE);
  const [session, setSession] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [authNotice, setAuthNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals),
    [answers, selectedSignals]
  );

  const visibleRoutes = ranked.slice(0, 10);
  const bestMatch = visibleRoutes[0];
  const active = visibleRoutes.find((route) => route.id === manualActiveId) || bestMatch;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const currentSession = await getCurrentSession();
        if (cancelled) return;
        setSession(currentSession);

        if (currentSession) {
          const [profile, saved] = await Promise.all([
            loadLearnerProfile(currentSession),
            loadSavedDiscovery(currentSession),
          ]);
          if (cancelled) return;

          if (profile) {
            setLearnerProfile({ ...EMPTY_PROFILE, ...profile });
          }

          if (saved) {
            setAnswers(saved.answers ?? {});
            setSelectedSignals(saved.selected_signals ?? DEFAULT_SIGNALS);
            setManualActiveId(saved.best_match ?? null);
            setSavedAt(saved.updated_at ?? null);
            setAuthNotice("Your saved learner profile and discovery view have been restored.");
          }
        }
      } catch (error) {
        if (!cancelled) setAuthError(error.message || "We could not restore your saved profile.");
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
  }

  function toggleInterestSignal(signal) {
    setSelectedSignals((prev) => toggleSignal(prev, signal));
    setManualActiveId(null);
  }

  function updateLearnerProfile(field, value) {
    setLearnerProfile((current) => ({ ...current, [field]: value }));
  }

  function reset() {
    setAnswers({});
    setSelectedSignals(DEFAULT_SIGNALS);
    setManualActiveId(null);
  }

  async function handleSignIn(credentials) {
    setAuthError("");
    setAuthNotice("");
    setIsAuthLoading(true);

    try {
      const nextSession = await signInOrCreateLearner(credentials);
      setSession(nextSession);

      const [profile, saved] = await Promise.all([
        loadLearnerProfile(nextSession),
        loadSavedDiscovery(nextSession),
      ]);

      if (profile) {
        setLearnerProfile({ ...EMPTY_PROFILE, ...profile });
      } else if (credentials.name) {
        setLearnerProfile((current) => ({ ...current, preferredName: credentials.name }));
      }

      if (saved) {
        setAnswers(saved.answers ?? {});
        setSelectedSignals(saved.selected_signals ?? DEFAULT_SIGNALS);
        setManualActiveId(saved.best_match ?? null);
        setSavedAt(saved.updated_at ?? null);
        setAuthNotice("Welcome back. Your saved learner profile and discovery view have been restored.");
      } else {
        setAuthNotice("Signed in. Save your learner profile and discovery view when you are ready.");
      }
    } catch (error) {
      setAuthError(error.message || "Sign in failed. Check your details and try again.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleSave() {
    setAuthError("");
    setAuthNotice("");
    setIsSaving(true);

    try {
      const record = await saveDiscovery(session, {
        profile: learnerProfile,
        answers,
        selectedSignals,
        rankedResults: ranked,
        bestMatch: active.id,
        matchPercent: active.matchPercent,
      });
      setSavedAt(record.updated_at);
      setAuthNotice("Saved. You can return later for more personalised career guidance without starting again.");
    } catch (error) {
      setAuthError(error.message || "We could not save your learner profile.");
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
      setAuthNotice("Logged out. This device no longer has an active Careerize session.");
    } catch (error) {
      setAuthError(error.message || "Logout failed.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  return (
    <main id="top" className="relative min-h-screen overflow-x-clip bg-surfacePrimary text-textEmphasis">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-surfacePrimary/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3" aria-label="Careerize home">
            <LogoMark />
            <div>
              <div className="text-sm font-semibold tracking-tight">Careerize</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-textQuiet">Free career intelligence</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-textSubtle md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#discover" className="rounded-full border border-white/15 px-4 py-2 text-sm text-textMuted hover:border-white/40">Try demo</a>
            <a href="#trust" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-[0_0_40px_-10px_rgba(242,255,73,.8)]">Read principles</a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="rounded-xl border border-white/10 p-2 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div id="mobile-navigation" className="border-t border-white/5 bg-ink px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-4 text-sm text-textMuted" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden border-b border-line/70">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=80')] bg-cover bg-[62%_center] grayscale" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,22,20,.94)_0%,rgba(18,22,20,.84)_36%,rgba(18,22,20,.36)_64%,rgba(18,22,20,.72)_100%)]" />
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-surfacePrimary to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[0.74fr_1.26fr] md:py-20 lg:py-24">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[38rem] self-end md:pt-28"
          >
            <p className="text-[clamp(3.8rem,12vw,10rem)] font-display font-black uppercase leading-[0.78] tracking-[-0.085em] text-textEmphasis">Careerize</p>
            <h1 className="mt-7 max-w-[12ch] text-balance font-display text-[clamp(2.35rem,5.3vw,5.9rem)] font-black leading-[0.9] tracking-[-0.065em] text-textEmphasis">
              Choose with the work in view.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-textMuted md:text-xl">
              Compare South African career routes by the actual day: tools, pressure, entry gates, growth paths and the parts nobody puts on a poster.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#discover" className="group inline-flex items-center gap-3 rounded-[1.15rem] bg-interactionPrimary px-6 py-3.5 font-bold text-surfacePrimary transition duration-150 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-0.5 hover:bg-textEmphasis">Start the discovery <ArrowRight size={18} className="transition-transform duration-150 group-hover:translate-x-1" /></a>
              <a href="#reality" className="inline-flex items-center gap-2 rounded-[1.15rem] border border-textEmphasis/20 bg-surfacePrimary/35 px-6 py-3.5 text-textSubtle backdrop-blur-sm transition duration-150 hover:border-textEmphasis/45 hover:text-textEmphasis">Read a route first <ArrowUpRight size={18} /></a>
            </div>
          </motion.div>

          <div className="relative hidden min-h-[620px] md:block">
            <HeroCard ranked={visibleRoutes} active={active} progress={progress} session={session} savedAt={savedAt} selectedSignals={selectedSignals} reduceMotion={shouldReduceMotion} />
          </div>
        </div>
      </section>

      <section id="discover" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Discovery" title="Start with behaviour, not job titles" text="The learner answers simple questions and Careerize turns the answers into transparent career-route signals. This is guidance for exploration, not a personality label, hiring decision or suitability verdict." />
        <div className="mt-9 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <AccountPanel
            session={session}
            savedAt={savedAt}
            learnerProfile={learnerProfile}
            authNotice={authNotice}
            authError={authError}
            isAuthLoading={isAuthLoading}
            isSaving={isSaving}
            onProfileChange={updateLearnerProfile}
            onSignIn={handleSignIn}
            onSave={handleSave}
            onSignOut={handleSignOut}
          />

          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">Quick signal questions</h3>
                <p className="mt-2 text-sm text-textQuiet">Simple enough for an uninformed learner, but useful enough to open a better career conversation.</p>
              </div>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-textMuted hover:border-white/30"><RotateCcw size={16} /> Reset</button>
            </div>
            <div className="mt-7 space-y-6">
              {DISCOVERY_QUESTIONS.map((question) => (
                <fieldset key={question.id}>
                  <legend className="text-sm font-semibold text-white/85">{question.label}</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const activeChoice = answers[question.id] === option.value;
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => choose(question.id, option.value)}
                          aria-pressed={activeChoice}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${activeChoice ? "border-interactionPrimary bg-interactionPrimary text-black" : "border-white/10 bg-white/[0.03] text-textMuted hover:border-white/25"}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-2xl font-semibold">Interest tags</h3>
            <p className="mt-2 text-sm text-textQuiet">Tags add texture without pretending to measure personality, worth or future potential.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {INTEREST_SIGNALS.map((signal) => {
                const Icon = ICONS[signal.icon] ?? Sparkles;
                const activeSignal = selectedSignals.includes(signal.value);
                return (
                  <button
                    type="button"
                    key={signal.value}
                    onClick={() => toggleInterestSignal(signal.value)}
                    aria-pressed={activeSignal}
                    className={`group flex items-center justify-between rounded-3xl border p-4 text-left transition ${activeSignal ? "border-feedbackSuccess bg-feedbackSuccess/12" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                  >
                    <span className="flex items-center gap-3"><span className="rounded-2xl bg-white/8 p-3"><Icon size={18} /></span><span className="text-sm font-medium text-textMuted">{signal.label}</span></span>
                    {activeSignal ? <Check size={18} className="text-feedbackSuccess" /> : <ChevronRight size={18} className="text-textQuiet" />}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      <section id="reality" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Reality Check" title="Every career card must show the real job" text="The point is not to make careers sound glamorous. The point is to help learners make better choices before they commit years and money." />
        <div className="mt-9 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <GlassCard>
            <p className="text-sm uppercase tracking-[0.18em] text-textQuiet">Route signals</p>
            <div className="mt-5 space-y-3">
              <RouteMindMap routes={visibleRoutes} active={active} onSelect={setManualActiveId} />
            </div>
          </GlassCard>

          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <CareerCard route={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section id="pathway" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Pathway" title="Show the route in and the route up" text="A learner needs to know the entry point, the practical ladder and where the career can get stuck." />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <PathStep icon={GraduationCap} title="1. Entry" text="School subjects, TVET, diploma, degree, internship, apprenticeship, portfolio, work exposure or practical project." />
          <PathStep icon={Building2} title="2. First job" text="Junior role, assistant role, trainee role, site role or support role where real work begins." />
          <PathStep icon={Trophy} title="3. Growth" text="Specialist, senior, supervisor, manager, consultant, contractor or business-owner options." />
        </div>
        <PathwayMap route={active} />
        <NextActionPlan route={active} progress={progress} />
      </section>

      <section id="trust" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Trust architecture" title="Personalised guidance without turning the learner into a product" text="Careerize may remember a learner profile so the advice becomes more useful over time. It must not become a CV database, employer pipeline, payment system, hidden ranking engine or marketplace." />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <TrustCard icon={ShieldCheck} title="Explainable suggestions" text="Routes are ranked from the answers and tags learners choose. The app shows reality checks instead of pretending one score can decide a future." />
          <TrustCard icon={Lock} title="Learner-owned memory" text="Saved profiles are for the learner to return later, compare options and receive better guidance. Supabase records are protected by row-level security and limited to the signed-in owner." />
          <TrustCard icon={Lightbulb} title="No commercial influence" text="No employers, recruiters, course providers or sponsors can pay to influence career profiles, unlock learners, collect CVs or steer recommendations." />
        </div>
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-white/5 px-5 py-10 text-sm text-textQuiet md:flex-row md:justify-between">
        <div className="flex items-center gap-3"><LogoMark small /> <span>© 2026 Careerize · Made in South Africa</span></div>
        <div className="flex gap-6"><a href="#trust">Privacy</a><a href="#trust">Independence</a><a href="#top">Back to top</a></div>
      </footer>
    </main>
  );
}

function HeroCard({ ranked, active, progress, session, savedAt, selectedSignals, reduceMotion = false }) {
  return (
    <motion.div initial={reduceMotion ? false : { opacity: 0, x: 28, rotate: 1.2 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0, rotate: -1 }} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-8 right-0 w-[min(32rem,46vw)]">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-clay/20 via-feedbackSuccess/10 to-interactionPrimary/15 blur-3xl" />
      <GlassCard className="relative min-h-[520px] overflow-hidden">
        <div className="flex items-center justify-between">
          <Pill><Eye size={14} /> Live learner profile</Pill>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-textQuiet">{progress}% complete</span>
        </div>
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/25 p-5">
          <p className="text-sm text-textQuiet">Strongest current signal</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">{active.title}</h2>
          <p className="mt-3 text-sm leading-6 text-textSubtle">{active.summary}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-textSubtle">
            <InfoPill icon={Clock} text={active.stress} />
            <InfoPill icon={Compass} text={active.remote} />
          </div>
          <p className="mt-4 rounded-2xl border border-interactionPrimary/20 bg-interactionPrimary/10 p-3 text-xs leading-5 text-textMuted">
            Not a verdict: this signal is based on the answers and tags selected. Active tags: {selectedSignals.length ? selectedSignals.join(", ") : "none yet"}.
          </p>
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-textQuiet">
            {session ? `Signed in as ${session.email}. ${savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}.` : "Save when you want this view available next time."}` : "Sign in below to save this personalised view and return to it later."}
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {ranked.slice(0, 3).map((route, index) => (
            <div key={route.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div><p className="text-sm font-semibold">{route.title}</p><p className="text-xs text-textQuiet">{route.stream}</p></div>
              <div className="flex items-center gap-2 text-xs text-textQuiet"><Star size={14} className="text-interactionPrimary" /> {index === 0 ? "Top signal" : `#${index + 1}`}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AccountPanel({ session, savedAt, learnerProfile, authNotice, authError, isAuthLoading, isSaving, onProfileChange, onSignIn, onSave, onSignOut }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSignIn(form);
  }

  return (
    <GlassCard className="lg:col-span-2">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <Pill><Lock size={14} /> Saved learner profile</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">Save your context and come back smarter.</h3>
          <p className="mt-3 text-sm leading-6 text-textQuiet">
            Careerize can remember a lightweight learner profile, discovery answers and route signals so future guidance can refer back to what the learner already explored.
          </p>
          <p className="mt-3 text-xs leading-5 text-textQuiet">
            {hasSupabaseConfig ? "Supabase auth is active. Saved profiles are protected by row-level security and belong to the signed-in learner." : "Local demo mode is active because Supabase environment variables are not configured. Records are saved only in this browser."}
          </p>
        </div>

        {session ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-textQuiet">Current learner</p>
            <p className="mt-2 font-semibold">{session.email}</p>
            <p className="mt-2 text-xs leading-5 text-textQuiet">{savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : "No saved profile yet for this account."}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProfileInput label="Preferred name" value={learnerProfile.preferredName} onChange={(value) => onProfileChange("preferredName", value)} placeholder="What should Careerize call you?" />
              <ProfileInput label="Stage" value={learnerProfile.stage} onChange={(value) => onProfileChange("stage", value)} placeholder="Grade 10, Grade 12, gap year..." />
              <ProfileInput label="Town or suburb" value={learnerProfile.location} onChange={(value) => onProfileChange("location", value)} placeholder="For local route context" />
              <ProfileInput label="Subjects or interests" value={learnerProfile.subjects} onChange={(value) => onProfileChange("subjects", value)} placeholder="Maths, tourism, art, computers..." />
            </div>
            <label className="mt-3 block text-sm text-textSubtle">
              Notes for future guidance
              <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-textQuiet focus:border-interactionPrimary" value={learnerProfile.notes} onChange={(event) => onProfileChange("notes", event.target.value)} placeholder="Questions, worries, careers you want to compare, or things you want Careerize to remember." />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onSave} disabled={isSaving || isAuthLoading} className="inline-flex items-center gap-2 rounded-full bg-interactionPrimary px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} /> {isSaving ? "Saving..." : "Save learner profile"}
              </button>
              <button type="button" onClick={onSignOut} disabled={isAuthLoading} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-textMuted disabled:cursor-not-allowed disabled:opacity-60">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-textSubtle">
                Learner name
                <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-textQuiet focus:border-interactionPrimary" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="A learner name" />
              </label>
              <label className="text-sm text-textSubtle">
                Email
                <input required type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-textQuiet focus:border-interactionPrimary" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="learner@example.com" />
              </label>
            </div>
            <label className="mt-3 block text-sm text-textSubtle">
              Password
              <input required minLength={6} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-textQuiet focus:border-interactionPrimary" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 6 characters" />
            </label>
            <button type="submit" disabled={isAuthLoading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-interactionPrimary px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
              <LogIn size={16} /> {isAuthLoading ? "Checking..." : "Log in or create saved profile"}
            </button>
          </form>
        )}
      </div>

      {(authNotice || authError) && (
        <div className={`mt-5 rounded-2xl border p-4 text-sm ${authError ? "border-feedbackRisk/30 bg-feedbackRisk/10 text-textMuted" : "border-feedbackSuccess/25 bg-feedbackSuccess/10 text-textMuted"}`}>
          {authError || authNotice}
        </div>
      )}
    </GlassCard>
  );
}

function ProfileInput({ label, value, onChange, placeholder }) {
  return (
    <label className="text-sm text-textSubtle">
      {label}
      <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-textQuiet focus:border-interactionPrimary" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function RouteMindMap({ routes, active, onSelect }) {
  return (
    <div className="relative rounded-[2rem] border border-white/10 bg-black/20 p-4">
      <div aria-hidden="true" className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-cyber/60 via-white/10 to-mint/60 md:block" />
      <div className="relative grid gap-3">
        {routes.map((route, index) => {
          const selected = active.id === route.id;
          const side = index % 2 === 0 ? "md:mr-[52%]" : "md:ml-[52%]";
          return (
            <button
              type="button"
              key={route.id}
              onClick={() => onSelect(route.id)}
              aria-pressed={selected}
              className={`${side} group relative rounded-3xl border p-4 text-left transition ${selected ? "border-interactionPrimary bg-interactionPrimary text-black shadow-[0_0_40px_-18px_rgba(242,255,73,.9)]" : "border-white/10 bg-white/[0.03] text-textMuted hover:border-white/25"}`}
            >
              <span className={`absolute top-1/2 hidden h-px w-8 -translate-y-1/2 bg-white/15 md:block ${index % 2 === 0 ? "-right-8" : "-left-8"}`} />
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{index + 1}. {route.title}</span>
                <span className={`${selected ? "bg-black/10" : "bg-white/8"} rounded-full px-3 py-1 text-xs`}>{route.matchPercent}%</span>
              </div>
              <p className={`${selected ? "text-black/65" : "text-textQuiet"} mt-1 text-xs`}>{route.stream}</p>
              <p className={`${selected ? "text-black/60" : "text-textQuiet"} mt-2 text-[11px]`}>
                {route.explanation.matchedSignals.slice(0, 3).map((item) => item.signal).join(" · ") || "Add more tags to strengthen this signal"}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-textQuiet">Showing the strongest 10 route signals only so the map stays usable instead of becoming cluttered.</p>
    </div>
  );
}

function PathwayMap({ route }) {
  const pathway = getAcademicPathwayForCareer(route.id)?.academicPathway;
  if (!pathway) return null;

  const subjectItems = [
    ["Keep open", pathway.grade10Subjects.requiredOrStronglyRecommended.join(", ")],
    ["Helpful", pathway.grade10Subjects.recommended.join(", ")],
    ["Avoid dropping", pathway.grade10Subjects.avoidDropping.join(", ")],
  ];
  const ladder = [
    { label: "Subject choice", text: pathway.grade10StartingPoint[0] },
    { label: "Grade 12 gate", text: pathway.grade12ExitTarget },
    { label: "Qualification entry", text: pathway.qualificationRoutes.slice(0, 3).map((item) => item.qualification).join(" · ") },
    { label: "First work", text: pathway.firstWorkEntry.join(", ") },
    { label: "Progression", text: route.growth },
  ];

  return (
    <GlassCard className="mt-5">
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div>
          <Pill><GraduationCap size={14} /> Qualification route map</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">{route.title}: from school subjects to first work.</h3>
          <p className="mt-3 text-sm leading-6 text-textQuiet">{pathway.academicRequirementRoute}</p>
          <p className="mt-3 rounded-2xl border border-interactionPrimary/20 bg-interactionPrimary/10 p-3 text-xs leading-5 text-textSubtle">{pathway.verification.caution}</p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            {subjectItems.map(([label, text]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-feedbackSuccess/80">{label}</p>
                <p className="mt-2 text-sm leading-6 text-textSubtle">{text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3">
              {ladder.map((step, index) => (
                <div key={step.label} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[10rem_1fr]">
                  <div className="flex items-center gap-3 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-interactionPrimary text-black">{index + 1}</span>{step.label}</div>
                  <p className="text-sm leading-6 text-textSubtle">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function NextActionPlan({ route, progress }) {
  const actions = [
    progress < 100 ? "Complete the remaining discovery questions so the route comparison is less noisy." : "Compare the top three routes with a parent, teacher or mentor before choosing subjects.",
    `Watch or interview someone who does ${route.title.toLowerCase()} work and ask about the worst part, not only the best part.`,
    "Write down one low-cost experiment for the next 14 days: shadowing, a short course, a project, a school subject conversation or a workplace visit.",
  ];

  return (
    <GlassCard className="mt-5">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div>
          <Pill><Map size={14} /> Next best action</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">Turn interest into a safe experiment.</h3>
          <p className="mt-3 text-sm leading-6 text-textQuiet">The product should never leave a learner with a label and no next step. The next step is small, observable and reversible.</p>
        </div>
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <div key={action} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-textMuted">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-interactionPrimary font-semibold text-black">{index + 1}</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function TrustCard({ icon: Icon, title, text }) {
  return (
    <GlassCard>
      <span className="inline-flex rounded-3xl bg-feedbackSuccess/15 p-4 text-feedbackSuccess"><Icon size={24} /></span>
      <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-textQuiet">{text}</p>
    </GlassCard>
  );
}

function CareerCard({ route }) {
  const items = [
    ["What you do", route.day, Briefcase],
    ["Tools used", route.tools, Wrench],
    ["Environment", route.environment, Building2],
    ["Stress level", route.stress, Gauge],
    ["Remote possibility", route.remote, Compass],
    ["Growth", route.growth, Trophy],
  ];

  return (
    <GlassCard>
      <Pill><Flag size={14} /> {route.stream}</Pill>
      <h3 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{route.title}</h3>
      <p className="mt-4 max-w-2xl text-textSubtle">{route.summary}</p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map(([title, text, Icon]) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3"><span className="rounded-2xl bg-white/8 p-2"><Icon size={18} /></span><h4 className="font-semibold">{title}</h4></div>
            <p className="mt-3 text-sm leading-6 text-textQuiet">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-feedbackRisk/25 bg-feedbackRisk/10 p-5"><div className="flex items-center gap-2 font-semibold"><ThumbsDown size={18} /> Worst part</div><p className="mt-3 text-sm text-textSubtle">{route.worst}</p></div>
        <div className="rounded-3xl border border-feedbackSuccess/25 bg-feedbackSuccess/10 p-5"><div className="flex items-center gap-2 font-semibold"><ThumbsUp size={18} /> Best part</div><p className="mt-3 text-sm text-textSubtle">{route.best}</p></div>
      </div>
    </GlassCard>
  );
}

function PathStep({ icon: Icon, title, text }) {
  return (
    <GlassCard>
      <span className="inline-flex rounded-3xl bg-interactionPrimary p-4 text-black"><Icon size={24} /></span>
      <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-textQuiet">{text}</p>
    </GlassCard>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-3xl">
      <Pill>{eyebrow}</Pill>
      <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-textSubtle">{text}</p>
    </div>
  );
}

function MiniStat({ value, label }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="font-display text-2xl font-semibold">{value}</div><div className="mt-1 text-xs uppercase tracking-[0.14em] text-textQuiet">{label}</div></div>;
}

function InfoPill({ icon: Icon, text }) {
  return <div className="flex items-start gap-2 rounded-2xl bg-white/[0.04] p-3"><Icon size={15} className="mt-0.5 shrink-0 text-interactionPrimary" /><span>{text}</span></div>;
}

function GlassCard({ children, className = "" }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-7 ${className}`}>{children}</div>;
}

function Pill({ children }) {
  return <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-textQuiet">{children}</div>;
}

function LogoMark({ small = false }) {
  return <div className={`${small ? "h-8 w-8" : "h-10 w-10"} grid place-items-center rounded-2xl bg-gradient-to-br from-interactionPrimary via-feedbackSuccess to-clay text-black shadow-[0_0_35px_-12px_rgba(242,255,73,.9)]`}><Compass size={small ? 16 : 20} /></div>;
}

function BgAurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet/25 blur-3xl" />
      <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-feedbackSuccess/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-interactionPrimary/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
    </div>
  );
}
