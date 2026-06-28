import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
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
import { CAREER_COVERAGE_SUMMARY, CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog";
import { SCHOOL_SUBJECTS, SUBJECT_RULES } from "./data/subjectRules";
import {
  getCurrentSession,
  hasSupabaseConfig,
  loadLearnerProfile,
  loadSavedDiscovery,
  saveDiscovery,
  signInOrCreateLearner,
  signOutLearner,
} from "./lib/savedDiscovery";
import { DEFAULT_REALITY_PREFERENCES, REALITY_PREFERENCE_LABELS, evaluatePathwayRisk, getProfileProgress, rankCareerRoutes, toggleSignal } from "./lib/scoring";

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
  subjects: [],
  subjectMarks: {},
  notes: "",
};

function normaliseLearnerProfile(profile = {}) {
  const subjects = Array.isArray(profile.subjects)
    ? profile.subjects
    : String(profile.subjects ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return { ...EMPTY_PROFILE, ...profile, subjects, subjectMarks: profile.subjectMarks ?? {} };
}

function normaliseRealityPreferences(preferences = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_REALITY_PREFERENCES).map(([key, fallback]) => {
      const value = Number(preferences[key] ?? fallback);
      return [key, Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback];
    })
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSignals, setSelectedSignals] = useState(DEFAULT_SIGNALS);
  const [manualActiveId, setManualActiveId] = useState(null);
  const [realityPreferences, setRealityPreferences] = useState(DEFAULT_REALITY_PREFERENCES);
  const [learnerProfile, setLearnerProfile] = useState(EMPTY_PROFILE);
  const [session, setSession] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [authNotice, setAuthNotice] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals, realityPreferences),
    [answers, selectedSignals, realityPreferences]
  );

  const bestMatch = ranked[0];
  const active = ranked.find((route) => route.id === manualActiveId) || bestMatch;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);
  const pathwayRisk = useMemo(
    () => evaluatePathwayRisk(active, learnerProfile.subjects, learnerProfile.subjectMarks, SUBJECT_RULES),
    [active, learnerProfile.subjects, learnerProfile.subjectMarks]
  );

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
            setLearnerProfile(normaliseLearnerProfile(profile));
          }

          if (saved) {
            setAnswers(saved.answers ?? {});
            setSelectedSignals(saved.selected_signals ?? DEFAULT_SIGNALS);
            setRealityPreferences(normaliseRealityPreferences(saved.reality_preferences));
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

  function updateRealityPreference(dimension, value) {
    setRealityPreferences((current) => normaliseRealityPreferences({ ...current, [dimension]: value }));
    setManualActiveId(null);
  }

  function updateLearnerProfile(field, value) {
    setLearnerProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleSubject(subject) {
    setLearnerProfile((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((item) => item !== subject)
        : [...current.subjects, subject],
    }));
  }

  function updateSubjectMark(subject, value) {
    setLearnerProfile((current) => ({
      ...current,
      subjectMarks: { ...current.subjectMarks, [subject]: value },
    }));
  }

  function reset() {
    setAnswers({});
    setSelectedSignals(DEFAULT_SIGNALS);
    setRealityPreferences({ ...DEFAULT_REALITY_PREFERENCES });
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
        setLearnerProfile(normaliseLearnerProfile(profile));
      } else if (credentials.name) {
        setLearnerProfile((current) => ({ ...current, preferredName: credentials.name }));
      }

      if (saved) {
        setAnswers(saved.answers ?? {});
        setSelectedSignals(saved.selected_signals ?? DEFAULT_SIGNALS);
        setRealityPreferences(normaliseRealityPreferences(saved.reality_preferences));
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
        realityPreferences,
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
    <main id="top" className="relative min-h-screen overflow-x-clip bg-ink text-white">
      <BgAurora />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3" aria-label="Careerize home">
            <LogoMark />
            <div>
              <div className="text-sm font-semibold tracking-tight">Careerize</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Free career intelligence</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#discover" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40">Try demo</a>
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
            <nav className="flex flex-col gap-4 text-sm text-white/80" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-12 md:grid-cols-[1.05fr_0.95fr] md:pb-20 md:pt-20">
        <div className="flex flex-col justify-center">
          <Pill><span className="h-2 w-2 rounded-full bg-mint" /> Independent career intelligence</Pill>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mt-6 font-display text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] md:text-[88px]"
          >
            Know the real work <span className="bg-gradient-to-br from-cyber via-mint to-violet bg-clip-text text-transparent">before you choose.</span>
          </motion.h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 md:text-lg">
            Careerize helps South African learners compare what careers actually involve: day-to-day work, tools, stress, environment, entry routes, growth paths, worst parts, best parts and related careers they may not know exist.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#discover" className="inline-flex items-center gap-2 rounded-full bg-cyber px-6 py-3 font-semibold text-black shadow-[0_0_55px_-14px_rgba(242,255,73,.9)]">Start discovery <ArrowRight size={18} /></a>
            <a href="#reality" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-white/80 hover:border-white/40">See reality checks <ArrowUpRight size={18} /></a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <MiniStat value={CAREER_ROUTES.length} label="mapped routes" />
            <MiniStat value={`${progress}%`} label="profile complete" />
            <MiniStat value={CAREER_COVERAGE_SUMMARY.researchQueueCount} label="research queue" />
          </div>
        </div>

        <HeroCard ranked={ranked} active={active} progress={progress} session={session} savedAt={savedAt} />
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

          <SubjectProfilePanel
            profile={learnerProfile}
            onProfileChange={updateLearnerProfile}
            onToggleSubject={toggleSubject}
            onMarkChange={updateSubjectMark}
          />

          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">Quick signal questions</h3>
                <p className="mt-2 text-sm text-white/55">Simple enough for an uninformed learner, but useful enough to open a better career conversation.</p>
              </div>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:border-white/30"><RotateCcw size={16} /> Reset</button>
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
                          data-testid="discovery-option"
                          data-question-id={question.id}
                          data-option-value={option.value}
                          onClick={() => choose(question.id, option.value)}
                          aria-pressed={activeChoice}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${activeChoice ? "border-cyber bg-cyber text-black" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25"}`}
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
            <p className="mt-2 text-sm text-white/55">Tags add texture without pretending to measure personality, worth or future potential.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {INTEREST_SIGNALS.map((signal) => {
                const Icon = ICONS[signal.icon] ?? Sparkles;
                const activeSignal = selectedSignals.includes(signal.value);
                return (
                  <button
                    type="button"
                    key={signal.value}
                    data-testid="interest-signal"
                    data-signal-value={signal.value}
                    onClick={() => toggleInterestSignal(signal.value)}
                    aria-pressed={activeSignal}
                    className={`group flex items-center justify-between rounded-3xl border p-4 text-left transition ${activeSignal ? "border-mint bg-mint/12" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                  >
                    <span className="flex items-center gap-3"><span className="rounded-2xl bg-white/8 p-3"><Icon size={18} /></span><span className="text-sm font-medium text-white/80">{signal.label}</span></span>
                    {activeSignal ? <Check size={18} className="text-mint" /> : <ChevronRight size={18} className="text-white/25" />}
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
          <RealityPreferencePanel preferences={realityPreferences} onChange={updateRealityPreference} />

          <GlassCard>
            <p className="text-sm uppercase tracking-[0.18em] text-white/40">Route signals</p>
            <div className="mt-5 space-y-3">
              {ranked.map((route, index) => (
                <button
                  type="button"
                  key={route.id}
                  data-testid="route-result"
                  onClick={() => setManualActiveId(route.id)}
                  aria-pressed={active.id === route.id}
                  className={`w-full rounded-3xl border p-4 text-left transition ${active.id === route.id ? "border-cyber bg-cyber text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{index + 1}. {route.title}</span>
                    <span className="rounded-full bg-black/10 px-3 py-1 text-xs">{route.matchPercent}% signal · {route.realityFit?.matchPercent ?? 50}% reality</span>
                  </div>
                  <p className={`${active.id === route.id ? "text-black/65" : "text-white/45"} mt-1 text-xs`}>{route.stream}</p>
                </button>
              ))}
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
        <SectionHeading eyebrow="Pathway" title="See what your subjects keep open" text="Careerize works backwards from the selected career to broad qualification routes and subject choices. Exact provider requirements must still be checked." />
        <PathwayRiskPanel route={active} risk={pathwayRisk} />
        <QualificationRoutePanel route={active} />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <PathStep icon={GraduationCap} title="1. Entry" text="School subjects, TVET, diploma, degree, internship, apprenticeship, portfolio, work exposure or practical project." />
          <PathStep icon={Building2} title="2. First job" text="Junior role, assistant role, trainee role, site role or support role where real work begins." />
          <PathStep icon={Trophy} title="3. Growth" text="Specialist, senior, supervisor, manager, consultant, contractor or business-owner options." />
        </div>
        <NextActionPlan route={active} progress={progress} />
      </section>

      <section id="trust" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Trust architecture" title="Personalised guidance without turning the learner into a product" text="Careerize may remember a learner profile so the advice becomes more useful over time. It must not become a CV database, employer pipeline, payment system, hidden ranking engine or marketplace." />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <TrustCard icon={ShieldCheck} title="Explainable suggestions" text="Routes are ranked from the answers and tags learners choose. The app shows reality checks instead of pretending one score can decide a future." />
          <TrustCard icon={Lock} title="Learner-owned memory" text="Saved profiles are for the learner to return later, compare options and receive better guidance. Supabase records are protected by row-level security and limited to the signed-in owner." />
          <TrustCard icon={Lightbulb} title="No commercial influence" text="No employers, recruiters, course providers or sponsors can pay to influence career profiles, unlock learners, collect CVs or steer recommendations." />
        </div>
        <ProofLedger />
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-white/5 px-5 py-10 text-sm text-white/40 md:flex-row md:justify-between">
        <div className="flex items-center gap-3"><LogoMark small /> <span>© 2026 Careerize · Made in South Africa</span></div>
        <div className="flex gap-6"><a href="#trust">Privacy</a><a href="#trust">Independence</a><a href="#top">Back to top</a></div>
      </footer>
    </main>
  );
}

function HeroCard({ ranked, active, progress, session, savedAt }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }} className="relative">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet/25 via-mint/10 to-cyber/20 blur-3xl" />
      <GlassCard className="relative min-h-[520px] overflow-hidden">
        <div className="flex items-center justify-between">
          <Pill><Eye size={14} /> Live learner profile</Pill>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{progress}% complete</span>
        </div>
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/25 p-5">
          <p className="text-sm text-white/45">Strongest current signal</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">{active.title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">{active.summary}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/60">
            <InfoPill icon={Clock} text={active.stress} />
            <InfoPill icon={Compass} text={active.remote} />
          </div>
          <p className="mt-4 rounded-2xl border border-cyber/20 bg-cyber/10 p-3 text-xs leading-5 text-white/70">
            Not a verdict: this signal is based only on the answers and tags selected. It should start a better conversation, not end one.
          </p>
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-white/55">
            {session ? `Signed in as ${session.email}. ${savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}.` : "Save when you want this view available next time."}` : "Sign in below to save this personalised view and return to it later."}
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {ranked.slice(0, 3).map((route, index) => (
            <div key={route.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div><p className="text-sm font-semibold">{route.title}</p><p className="text-xs text-white/40">{route.stream}</p></div>
              <div className="flex items-center gap-2 text-xs text-white/55"><Star size={14} className="text-cyber" /> {index === 0 ? "Top signal" : `#${index + 1}`}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function RealityPreferencePanel({ preferences, onChange }) {
  const sliders = [
    { id: "earning", low: "Money less important", high: "High earning ambition" },
    { id: "travel", low: "Prefer one place", high: "Open to travel and movement" },
    { id: "stress", low: "Lower pressure", high: "Can handle high pressure" },
    { id: "danger", low: "Safer environments", high: "Can accept risky settings" },
  ];

  return (
    <GlassCard className="lg:col-span-2">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Pill><Gauge size={14} /> Career reality sliders</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">Choose the trade-offs that matter in real life.</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">Money, travel, stress and danger should be visible before a learner commits to subjects or study. These sliders adjust route ranking with qualitative signals only; they do not publish salary or safety claims.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/50">Neutral at 50</span>
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {sliders.map((slider) => (
          <label key={slider.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">{REALITY_PREFERENCE_LABELS[slider.id]}</span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/55">{preferences[slider.id]}</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={preferences[slider.id]} onChange={(event) => onChange(slider.id, event.target.value)} className="mt-4 w-full accent-cyber" aria-label={REALITY_PREFERENCE_LABELS[slider.id]} />
            <div className="mt-2 flex justify-between gap-3 text-xs text-white/40"><span>{slider.low}</span><span className="text-right">{slider.high}</span></div>
          </label>
        ))}
      </div>
    </GlassCard>
  );
}
function SubjectProfilePanel({ profile, onProfileChange, onToggleSubject, onMarkChange }) {
  return (
    <GlassCard className="lg:col-span-2">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Pill><GraduationCap size={14} /> Learner subject profile</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">Which subjects are you taking or considering?</h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">Choose subjects and add estimated marks when useful. Careerize uses them to flag route-level risk—not to decide what you are capable of.</p>
        </div>
        <label className="min-w-48 text-sm text-white/60">
          School stage
          <select data-testid="school-stage-select" value={profile.stage} onChange={(event) => onProfileChange("stage", event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-ink px-4 py-3 text-white outline-none focus:border-cyber">
            <option value="">Choose a stage</option>
            {["Grade 9", "Grade 10", "Grade 11", "Grade 12", "Post-matric"].map((stage) => <option key={stage}>{stage}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCHOOL_SUBJECTS.map((subject) => {
          const selected = profile.subjects.includes(subject);
          return (
            <div key={subject} className={`rounded-2xl border p-3 transition ${selected ? "border-mint/50 bg-mint/10" : "border-white/10 bg-white/[0.025]"}`}>
              <button type="button" data-testid="subject-toggle" data-subject={subject} onClick={() => onToggleSubject(subject)} aria-pressed={selected} className="flex w-full items-center justify-between gap-3 text-left text-sm">
                <span className="text-white/80">{subject}</span>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-mint bg-mint text-black" : "border-white/20 text-transparent"}`}><Check size={14} /></span>
              </button>
              {selected && (
                <label className="mt-3 flex items-center gap-2 text-xs text-white/45">
                  Estimated mark
                  <input aria-label={`${subject} estimated mark`} data-testid="subject-mark" data-subject={subject} type="number" min="0" max="100" value={profile.subjectMarks[subject] ?? ""} onChange={(event) => onMarkChange(subject, event.target.value)} placeholder="%" className="w-20 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-cyber" />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function PathwayRiskPanel({ route, risk }) {
  const styles = {
    green: { border: "border-mint/35", bg: "bg-mint/10", icon: Check, label: "Green" },
    amber: { border: "border-cyber/35", bg: "bg-cyber/10", icon: AlertTriangle, label: "Amber" },
    red: { border: "border-pink/35", bg: "bg-pink/10", icon: X, label: "Red" },
  };
  const state = styles[risk.status];
  const StatusIcon = state.icon;

  return (
    <div className={`mt-9 rounded-[2rem] border ${state.border} ${state.bg} p-5 md:p-7`}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold"><StatusIcon size={18} /> {state.label} pathway signal</div>
          <h3 className="mt-2 font-display text-3xl font-semibold">{risk.label}: {route.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs text-white/60">Broad guidance · provider check required</span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {risk.impacts.length ? risk.impacts.map((impact) => (
          <div key={impact.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="flex items-center justify-between gap-3"><strong className="text-sm">{impact.subject}</strong><span className="text-xs uppercase tracking-[0.12em] text-white/40">{impact.status}</span></div>
            <p className="mt-2 text-sm leading-6 text-white/60">{impact.reason}</p>
          </div>
        )) : <p className="text-sm text-white/60">No specific subject rule is loaded for this route yet. Treat the signal as amber and verify the intended qualification route.</p>}
      </div>
      <p className="mt-5 text-xs leading-5 text-white/45">{risk.disclaimer}</p>
    </div>
  );
}

function QualificationRoutePanel({ route }) {
  return (
    <GlassCard className="mt-5">
      <Pill><GraduationCap size={14} /> Qualification routes</Pill>
      <h3 className="mt-4 font-display text-3xl font-semibold">Routes associated with {route.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">These are qualification families associated with the career stream. They are intentionally conservative until an official provider or awarding-body source confirms an exact programme.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {route.qualificationPathways.map((qualification) => (
          <div key={qualification.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs uppercase tracking-[0.14em] text-mint">{qualification.type}</span><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">NQF {qualification.nqfLevel}</span></div>
            <h4 className="mt-3 font-semibold">{qualification.name}</h4>
            <p className="mt-2 text-sm leading-6 text-white/55">{qualification.caution}</p>
            <p className="mt-3 text-xs text-white/35">Status: {qualification.verificationStatus.replaceAll("_", " ")}</p>
          </div>
        ))}
      </div>
    </GlassCard>
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
          <p className="mt-3 text-sm leading-6 text-white/55">
            Careerize can remember a lightweight learner profile, discovery answers and route signals so future guidance can refer back to what the learner already explored.
          </p>
          <p className="mt-3 text-xs leading-5 text-white/40">
            {hasSupabaseConfig ? "Supabase auth is active. Saved profiles are protected by row-level security and belong to the signed-in learner." : "Local demo mode is active because Supabase environment variables are not configured. Records are saved only in this browser."}
          </p>
        </div>

        {session ? (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-white/45">Current learner</p>
            <p className="mt-2 font-semibold">{session.email}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">{savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : "No saved profile yet for this account."}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ProfileInput label="Preferred name" value={learnerProfile.preferredName} onChange={(value) => onProfileChange("preferredName", value)} placeholder="What should Careerize call you?" />
              <ProfileInput label="Stage" value={learnerProfile.stage} onChange={(value) => onProfileChange("stage", value)} placeholder="Grade 10, Grade 12, gap year..." />
              <ProfileInput label="Town or suburb" value={learnerProfile.location} onChange={(value) => onProfileChange("location", value)} placeholder="For local route context" />
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/55">
                <span className="block text-xs uppercase tracking-[0.14em] text-white/35">Subject profile</span>
                <span className="mt-1 block">{learnerProfile.subjects.length ? `${learnerProfile.subjects.length} subjects selected below` : "Select subjects below"}</span>
              </div>
            </div>
            <label className="mt-3 block text-sm text-white/60">
              Notes for future guidance
              <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={learnerProfile.notes} onChange={(event) => onProfileChange("notes", event.target.value)} placeholder="Questions, worries, careers you want to compare, or things you want Careerize to remember." />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onSave} disabled={isSaving || isAuthLoading} className="inline-flex items-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} /> {isSaving ? "Saving..." : "Save learner profile"}
              </button>
              <button type="button" onClick={onSignOut} disabled={isAuthLoading} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-white/60">
                Learner name
                <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="A learner name" />
              </label>
              <label className="text-sm text-white/60">
                Email
                <input required type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="learner@example.com" />
              </label>
            </div>
            <label className="mt-3 block text-sm text-white/60">
              Password
              <input required minLength={6} type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 6 characters" />
            </label>
            <button type="submit" disabled={isAuthLoading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
              <LogIn size={16} /> {isAuthLoading ? "Checking..." : "Log in or create saved profile"}
            </button>
          </form>
        )}
      </div>

      {(authNotice || authError) && (
        <div className={`mt-5 rounded-2xl border p-4 text-sm ${authError ? "border-pink/30 bg-pink/10 text-white/75" : "border-mint/25 bg-mint/10 text-white/70"}`}>
          {authError || authNotice}
        </div>
      )}
    </GlassCard>
  );
}

function ProfileInput({ label, value, onChange, placeholder }) {
  return (
    <label className="text-sm text-white/60">
      {label}
      <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
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
          <p className="mt-3 text-sm leading-6 text-white/55">The product should never leave a learner with a label and no next step. The next step is small, observable and reversible.</p>
        </div>
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <div key={action} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/70">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyber font-semibold text-black">{index + 1}</span>
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
      <span className="inline-flex rounded-3xl bg-mint/15 p-4 text-mint"><Icon size={24} /></span>
      <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
    </GlassCard>
  );
}

function ProofLedger() {
  const stats = [
    ["Mapped career routes", CAREER_COVERAGE_SUMMARY.totalRoutes],
    ["Source-verified profiles", CAREER_COVERAGE_SUMMARY.sourceVerifiedProfileCount],
    ["Research queue rows", CAREER_COVERAGE_SUMMARY.researchQueueCount],
  ];
  const blockedClaims = ["salary figures", "demand strength", "APS/marks", "provider entry requirements", "registration claims"];

  return (
    <GlassCard className="mt-5">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <Pill><ShieldCheck size={14} /> Proof ledger</Pill>
          <h3 className="mt-4 font-display text-3xl font-semibold">Evidence status is part of the product.</h3>
          <p className="mt-3 text-sm leading-6 text-white/55">{CAREER_COVERAGE_SUMMARY.proofPolicy}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-cyber/20 bg-cyber/10 p-5">
        <p className="text-sm font-semibold">Blocked until source-verified</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {blockedClaims.map((claim) => (
            <span key={claim} className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-xs text-white/60">{claim}</span>
          ))}
        </div>
      </div>
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
      <p className="mt-4 max-w-2xl text-white/60">{route.summary}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-cyber/20 bg-cyber/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} /> Evidence status</div>
          <p className="mt-2 text-sm leading-6 text-white/60">Profile: {route.evidenceState?.profile?.replaceAll("-", " ")} · Qualification: {route.evidenceState?.qualification?.replaceAll("-", " ")} · Demand: {route.evidenceState?.demand?.replaceAll("-", " ")}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Gauge size={17} /> Reality fit</div>
          <p className="mt-2 text-sm leading-6 text-white/60">{route.realityFit?.matchPercent ?? 50}% fit against your money, travel, stress and safety sliders. Qualitative signal only.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {Object.entries(route.careerReality ?? {}).filter(([key, value]) => ["earning", "travel", "stress", "danger"].includes(key) && Number.isFinite(value)).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-black/15 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">{REALITY_PREFERENCE_LABELS[key]}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyber" style={{ width: `${value}%` }} /></div>
            <p className="mt-2 text-xs text-white/50">{value}/100</p>
          </div>
        ))}
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {items.map(([title, text, Icon]) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3"><span className="rounded-2xl bg-white/8 p-2"><Icon size={18} /></span><h4 className="font-semibold">{title}</h4></div>
            <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-pink/25 bg-pink/10 p-5"><div className="flex items-center gap-2 font-semibold"><ThumbsDown size={18} /> Worst part</div><p className="mt-3 text-sm text-white/60">{route.worst}</p></div>
        <div className="rounded-3xl border border-mint/25 bg-mint/10 p-5"><div className="flex items-center gap-2 font-semibold"><ThumbsUp size={18} /> Best part</div><p className="mt-3 text-sm text-white/60">{route.best}</p></div>
      </div>
    </GlassCard>
  );
}

function PathStep({ icon: Icon, title, text }) {
  return (
    <GlassCard>
      <span className="inline-flex rounded-3xl bg-cyber p-4 text-black"><Icon size={24} /></span>
      <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
    </GlassCard>
  );
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="max-w-3xl">
      <Pill>{eyebrow}</Pill>
      <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-white/60">{text}</p>
    </div>
  );
}

function MiniStat({ value, label }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4"><div className="font-display text-2xl font-semibold">{value}</div><div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">{label}</div></div>;
}

function InfoPill({ icon: Icon, text }) {
  return <div className="flex items-start gap-2 rounded-2xl bg-white/[0.04] p-3"><Icon size={15} className="mt-0.5 shrink-0 text-cyber" /><span>{text}</span></div>;
}

function GlassCard({ children, className = "" }) {
  return <div className={`rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-7 ${className}`}>{children}</div>;
}

function Pill({ children }) {
  return <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/55">{children}</div>;
}

function LogoMark({ small = false }) {
  return <div className={`${small ? "h-8 w-8" : "h-10 w-10"} grid place-items-center rounded-2xl bg-gradient-to-br from-cyber via-mint to-violet text-black shadow-[0_0_35px_-12px_rgba(242,255,73,.9)]`}><Compass size={small ? 16 : 20} /></div>;
}

function BgAurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet/25 blur-3xl" />
      <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-mint/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyber/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
    </div>
  );
}
