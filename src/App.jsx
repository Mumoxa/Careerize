import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
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
  Leaf,
  Lock,
  LogIn,
  LogOut,
  Map,
  Menu,
  RotateCcw,
  Save,
  Search,
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
import softwareLearner from "./assets/software-learner.png";
import environmentLearner from "./assets/environment-learner.png";
import dataLearner from "./assets/data-learner.png";
import learnersCollaborating from "./assets/learners-collaborating.png";
import { CAREER_ROUTES, DISCOVERY_QUESTIONS, INTEREST_SIGNALS } from "./data/careerCatalog.js";
import { getAcademicPathwayForCareer } from "./data/careerPathwayGraph.js";
import {
  getCurrentSession,
  hasSupabaseConfig,
  deleteLearnerData,
  exportLearnerData,
  loadLearnerProfile,
  loadSavedDiscovery,
  saveDiscovery,
  signInOrCreateLearner,
  signOutLearner,
} from "./lib/savedDiscovery";
import { assessSubjectRisk } from "./lib/subjectRisk.js";
import { getProfileProgress, rankCareerRoutes, toggleSignal } from "./lib/scoring.js";

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
  currentSubjects: [],
  mathsChoice: "",
  marksBand: "",
  notes: "",
};

export default function App() {
  const [open, setOpen] = useState(false);
  const [questionStep, setQuestionStep] = useState(0);
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
  const [routeSearch, setRouteSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("all");

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals),
    [answers, selectedSignals]
  );

  const routeStreams = useMemo(() => [...new Set(CAREER_ROUTES.map((route) => route.stream))].sort(), []);
  const routeSearchTerm = routeSearch.trim().toLowerCase();
  const filteredRanked = ranked.filter((route) => {
    const matchesSearch = !routeSearchTerm || [route.title, route.stream, route.summary, ...(route.subjects ?? [])].join(" ").toLowerCase().includes(routeSearchTerm);
    const matchesStream = streamFilter === "all" || route.stream === streamFilter;
    return matchesSearch && matchesStream;
  });
  const visibleRoutes = filteredRanked.slice(0, 10);
  const hasDiscoveryInput = Object.keys(answers).length > 0 || selectedSignals.length > 0;
  const starterRouteIds = ["software-developer", "environmental-scientist", "data-analyst"];
  const starterRoutes = starterRouteIds.map((id) => ranked.find((route) => route.id === id)).filter(Boolean);
  const bestMatch = hasDiscoveryInput ? (visibleRoutes[0] ?? ranked[0]) : (starterRoutes[0] ?? ranked[0]);
  const active = visibleRoutes.find((route) => route.id === manualActiveId) || ranked.find((route) => route.id === manualActiveId) || bestMatch;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);

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

  async function handleExportData() {
    setAuthError("");
    setAuthNotice("");

    try {
      const data = await exportLearnerData(session);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `careerize-learner-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setAuthNotice("Your learner data export has been prepared as a JSON download.");
    } catch (error) {
      setAuthError(error.message || "We could not export your learner data.");
    }
  }

  async function handleDeleteData() {
    setAuthError("");
    setAuthNotice("");

    try {
      await deleteLearnerData(session);
      setSession(null);
      setSavedAt(null);
      setLearnerProfile(EMPTY_PROFILE);
      setAnswers({});
      setSelectedSignals(DEFAULT_SIGNALS);
      setManualActiveId(null);
      setAuthNotice("Your saved learner data has been deleted from this Careerize storage mode.");
    } catch (error) {
      setAuthError(error.message || "We could not delete your learner data.");
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

  const currentQuestion = DISCOVERY_QUESTIONS[questionStep];
  const pathway = getAcademicPathwayForCareer(active.id)?.academicPathway;
  const routeImages = [softwareLearner, environmentLearner, dataLearner];
  const heroRoutes = starterRoutes;

  return (
    <main id="top" className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5">
          <a href="#top" className="brand-wordmark" aria-label="Careerize home">Careerize</a>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Primary navigation">
            <a href="#discover">Discover</a><a href="#reality">Career reality</a><a href="#pathway">Pathways</a><a href="#trust">Trust</a>
          </nav>
          <a href="#discover" className="primary-button hidden md:inline-flex">Start exploring</a>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"} className="icon-button md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {open ? <nav id="mobile-navigation" className="grid gap-4 border-t border-slate-200 px-5 py-5 text-sm font-semibold md:hidden"><a href="#discover" onClick={() => setOpen(false)}>Discover</a><a href="#reality" onClick={() => setOpen(false)}>Career reality</a><a href="#pathway" onClick={() => setOpen(false)}>Pathways</a><a href="#trust" onClick={() => setOpen(false)}>Trust</a></nav> : null}
      </header>

      <section className="mx-auto grid max-w-[1240px] gap-14 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="max-w-[650px] text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">Find careers that fit how you think, work and live.</h1>
          <div className="accent-stroke mt-4" />
          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-600">Answer a few quick questions, explore real career routes and see the subjects that can take you there. You choose. We’ll show you how.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="#discover" className="primary-button">Start exploring <ArrowRight size={18} /></a><a href="#reality" className="secondary-button">See real careers</a></div>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600"><Map size={18} className="text-blue-700" /> Made for South African learners</p>
        </motion.div>

        <div>
          <p className="mb-4 inline-flex bg-[#ff6258] px-4 py-2 text-sm font-semibold text-white">These are suggestions, not verdicts.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {heroRoutes.map((route, index) => <RoutePreview key={route.id} route={route} image={routeImages[index]} selected={active.id === route.id} onSelect={setManualActiveId} />)}
          </div>
          <button type="button" onClick={() => document.querySelector("#reality")?.scrollIntoView({ behavior: "smooth" })} className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-blue-700">See more suggestions <ChevronRight size={16} /></button>
        </div>
      </section>

      <section id="discover" className="section-border bg-slate-50/70">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
          <SectionIntro title="Quick discovery" text="Answer honestly. There are no right or wrong answers." />
          <div>
            <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">{currentQuestion.label}</h2><span className="text-sm text-slate-500">Question {questionStep + 1} of {DISCOVERY_QUESTIONS.length}</span></div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {currentQuestion.options.map((option) => { const selected = answers[currentQuestion.id] === option.value; return <button type="button" key={option.value} onClick={() => choose(currentQuestion.id, option.value)} aria-pressed={selected} className={`answer-card ${selected ? "answer-card-selected" : ""}`}><span>{option.label}</span><span className="selection-dot">{selected ? <Check size={14} /> : null}</span></button>; })}
            </div>
            <div className="mt-7 flex justify-between"><button type="button" className="secondary-button" disabled={questionStep === 0} onClick={() => setQuestionStep((step) => Math.max(0, step - 1))}>Back</button><button type="button" className="primary-button" onClick={() => setQuestionStep((step) => Math.min(DISCOVERY_QUESTIONS.length - 1, step + 1))}>Next question <ArrowRight size={17} /></button></div>
          </div>
        </div>
      </section>

      <section className="section-border">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
          <SectionIntro title="What interests you?" text="Pick any that excite you. You can choose more than one." />
          <div><div className="relative max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm" placeholder="Search interests" aria-label="Search interests" /></div><div className="mt-6 flex flex-wrap gap-3">{INTEREST_SIGNALS.map((signal) => { const selected = selectedSignals.includes(signal.value); return <button type="button" key={signal.value} onClick={() => toggleInterestSignal(signal.value)} aria-pressed={selected} className={`interest-chip ${selected ? "interest-chip-selected" : ""}`}>{signal.label}{selected ? <Check size={15} /> : null}</button>; })}</div><div className="mt-7 flex items-center justify-between"><button type="button" onClick={reset} className="text-sm font-semibold text-blue-700 underline">Clear all</button><span className="text-sm text-slate-500">{selectedSignals.length} selected</span></div></div>
        </div>
      </section>

      <section id="reality" className="section-border bg-slate-50/70">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
          <SectionIntro title="Compare real careers" text="See day-to-day work, skills, study options and where these careers can take you." />
          <div className="grid gap-4 md:grid-cols-3">{visibleRoutes.slice(0, 3).map((route) => <CareerCompareCard key={route.id} route={route} selected={active.id === route.id} onSelect={setManualActiveId} />)}</div>
        </div>
      </section>

      <section id="pathway" className="section-border bg-[#f4f6ff]">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 lg:grid-cols-[250px_1fr]">
          <SectionIntro title="From school subjects to your first job" text="See one possible path. There are many ways to get there." />
          <PathwayJourney route={active} pathway={pathway} />
        </div>
      </section>

      <section id="trust" className="section-border overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
          <div className="px-5 py-16 lg:pr-14"><SectionIntro title="Your privacy. Our promise." text="Careerize is a safe space to explore and grow." /><div className="mt-10 grid gap-7 sm:grid-cols-3"><TrustPoint icon={Lock} title="Your data is yours" text="We don’t sell your data. Ever." /><TrustPoint icon={ShieldCheck} title="Safe and secure" text="You control what gets saved." /><TrustPoint icon={Users} title="Built for learners" text="Made for young South Africans." /></div></div>
          <img src={learnersCollaborating} alt="South African learners exploring careers together" className="h-full min-h-[360px] w-full object-cover" />
        </div>
      </section>

      <footer className="border-t border-slate-200"><div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between"><a href="#top" className="brand-wordmark">Careerize</a><p>Explore. Understand. Choose.</p><p>© 2026 Careerize · South Africa</p></div></footer>
    </main>
  );
}

function RoutePreview({ route, image, selected, onSelect }) {
  const signalLabel = route.matchPercent > 0 ? `${route.matchPercent}% signal` : "Starter route";
  return <button type="button" onClick={() => onSelect(route.id)} aria-pressed={selected} className={`route-preview ${selected ? "route-preview-selected" : ""}`}><img src={image} alt="" className="aspect-[4/5] w-full object-cover" /><div className="p-4 text-left"><h2 className="text-base font-bold">{route.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{route.summary}</p><span className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">{signalLabel} <ChevronRight size={16} /></span></div></button>;
}

function SectionIntro({ title, text }) {
  return <div><h2 className="text-3xl font-extrabold tracking-[-0.035em]">{title}</h2><div className="accent-stroke mt-3 w-24" /><p className="mt-5 max-w-[240px] leading-7 text-slate-600">{text}</p></div>;
}

function CareerCompareCard({ route, selected, onSelect }) {
  const dayToDay = Array.isArray(route.dayToDay) ? route.dayToDay[0] : route.dayToDay;
  const tools = Array.isArray(route.tools) ? route.tools.slice(0, 2).join(" · ") : route.tools;
  const subjects = Array.isArray(route.subjects) ? route.subjects.slice(0, 3).join(" · ") : route.subjects;
  return <button type="button" onClick={() => onSelect(route.id)} aria-pressed={selected} className={`career-compare-card ${selected ? "career-compare-selected" : ""}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{route.title}</h3><p className="mt-1 text-xs text-slate-500">{route.stream}</p></div><span className="selection-dot">{selected ? <Check size={14} /> : null}</span></div><ul className="mt-6 space-y-3 text-left text-sm text-slate-600"><li>{dayToDay || route.summary}</li><li>{tools || route.environment}</li><li>{subjects || route.entry}</li></ul><span className="mt-auto flex items-center justify-between pt-7 text-sm font-semibold text-blue-700">View details <ArrowRight size={16} /></span></button>;
}

function PathwayJourney({ route, pathway }) {
  const steps = [{ icon: BookOpen, label: "Now", title: "Grade 10–12", text: pathway?.grade10Subjects?.requiredOrStronglyRecommended?.slice(0, 2).join(", ") || "Choose subjects that keep options open." }, { icon: GraduationCap, label: "Next step", title: "Study", text: pathway?.qualificationRoutes?.[0]?.qualification || route.entry }, { icon: Briefcase, label: "First opportunities", title: "Gain experience", text: pathway?.firstWorkEntry?.slice(0, 2).join(", ") || "Projects, internships or practical work." }, { icon: ArrowUpRight, label: "Where it can lead", title: "Your first job", text: route.growth }];
  return <div><p className="mb-8 text-lg font-bold">Example path for <span className="text-blue-700">{route.title}</span></p><div className="grid gap-6 md:grid-cols-4">{steps.map((step, index) => { const Icon = step.icon; return <div key={step.label} className="relative"><span className="grid h-14 w-14 place-items-center rounded-full border-2 border-white bg-white text-blue-700 shadow-[0_0_0_1px_#cbd5e1]"><Icon size={23} /></span>{index < steps.length - 1 ? <ArrowRight className="absolute left-[72px] top-4 hidden text-slate-400 md:block" size={20} /> : null}<p className="mt-4 text-xs text-slate-500">{step.label}</p><h3 className="mt-1 font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></div>; })}</div></div>;
}

function TrustPoint({ icon: Icon, title, text }) { return <div><span className="grid h-11 w-11 place-items-center rounded-full bg-blue-700 text-white"><Icon size={20} /></span><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{text}</p></div>; }

function HeroCard({ ranked, active, progress, session, savedAt, selectedSignals }) {
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
            Not a verdict: this signal is based on the answers and tags selected. Active tags: {selectedSignals.length ? selectedSignals.join(", ") : "none yet"}.
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

function AccountPanel({ session, savedAt, learnerProfile, authNotice, authError, isAuthLoading, isSaving, onProfileChange, onSignIn, onSave, onExportData, onDeleteData, onSignOut }) {
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
              <label className="text-sm text-white/60">
                Grade or stage
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyber" value={learnerProfile.stage} onChange={(event) => onProfileChange("stage", event.target.value)}>
                  <option value="">Select a stage</option>
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                  <option>School leaver</option>
                  <option>Gap year</option>
                </select>
              </label>
              <ProfileInput label="Town or suburb" value={learnerProfile.location} onChange={(value) => onProfileChange("location", value)} placeholder="For local route context" />
              <label className="text-sm text-white/60">
                Mathematics choice
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyber" value={learnerProfile.mathsChoice} onChange={(event) => onProfileChange("mathsChoice", event.target.value)}>
                  <option value="">Not sure yet</option>
                  <option>Mathematics</option>
                  <option>Mathematical Literacy</option>
                  <option>Technical Mathematics</option>
                </select>
              </label>
              <label className="text-sm text-white/60">
                Current marks band
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyber" value={learnerProfile.marksBand} onChange={(event) => onProfileChange("marksBand", event.target.value)}>
                  <option value="">Prefer not to say yet</option>
                  <option>Mostly 70%+</option>
                  <option>Mostly 60-69%</option>
                  <option>Mostly 50-59%</option>
                  <option>Mostly below 50%</option>
                </select>
              </label>
              <ProfileInput label="Other subjects" value={learnerProfile.subjects} onChange={(value) => onProfileChange("subjects", value)} placeholder="Accounting, Life Sciences, CAT..." />
            </div>
            <SubjectPicker selected={learnerProfile.currentSubjects} onChange={(subjects) => onProfileChange("currentSubjects", subjects)} />
            <label className="mt-3 block text-sm text-white/60">
              Notes for future guidance
              <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={learnerProfile.notes} onChange={(event) => onProfileChange("notes", event.target.value)} placeholder="Questions, worries, careers you want to compare, or things you want Careerize to remember." />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={onSave} disabled={isSaving || isAuthLoading} className="inline-flex items-center gap-2 rounded-full bg-cyber px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={16} /> {isSaving ? "Saving..." : "Save learner profile"}
              </button>
              <button type="button" onClick={onExportData} disabled={isAuthLoading} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60">
                Export data
              </button>
              <button type="button" onClick={onDeleteData} disabled={isAuthLoading} className="inline-flex items-center gap-2 rounded-full border border-pink/30 px-5 py-3 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60">
                Delete saved data
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

const SUBJECT_OPTIONS = ["Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences", "Accounting", "Business Studies", "Economics", "Geography", "Information Technology", "Computer Applications Technology", "Engineering Graphics and Design", "Agricultural Sciences", "Tourism", "Hospitality Studies", "Visual Arts", "Design"];

function SubjectPicker({ selected = [], onChange }) {
  function toggle(subject) {
    if (selected.includes(subject)) onChange(selected.filter((item) => item !== subject));
    else onChange([...selected, subject]);
  }

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white/80">Current or planned subjects</p>
      <p className="mt-1 text-xs leading-5 text-white/45">Pick known subjects so Careerize can flag green, amber or red route risk. Exact provider requirements still need verification.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUBJECT_OPTIONS.map((subject) => {
          const active = selected.includes(subject);
          return (
            <button
              key={subject}
              type="button"
              onClick={() => toggle(subject)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-2 text-xs transition ${active ? "border-mint bg-mint/15 text-white" : "border-white/10 bg-black/20 text-white/55 hover:border-white/25"}`}
            >
              {subject}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RouteExplorer({ routes, active, onSelect, routeSearch, onSearchChange, streamFilter, onStreamChange, routeStreams, totalMatches }) {
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
        <label className="text-sm text-white/60">
          Search all career routes
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-cyber" value={routeSearch} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search data, nursing, plumbing, tourism..." />
        </label>
        <label className="text-sm text-white/60">
          Filter stream
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-cyber" value={streamFilter} onChange={(event) => onStreamChange(event.target.value)}>
            <option value="all">All streams</option>
            {routeStreams.map((stream) => <option key={stream}>{stream}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/40">{totalMatches} matching routes. Showing the strongest 10 so the map stays usable.</p>
      <div className="mt-4">
        {routes.length > 0 ? (
          <RouteMindMap routes={routes} active={active} onSelect={onSelect} />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">No routes match that search yet. Try a broader title, subject or stream.</div>
        )}
      </div>
    </div>
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
              className={`${side} group relative rounded-3xl border p-4 text-left transition ${selected ? "border-cyber bg-cyber text-black shadow-[0_0_40px_-18px_rgba(242,255,73,.9)]" : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"}`}
            >
              <span className={`absolute top-1/2 hidden h-px w-8 -translate-y-1/2 bg-white/15 md:block ${index % 2 === 0 ? "-right-8" : "-left-8"}`} />
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{index + 1}. {route.title}</span>
                <span className={`${selected ? "bg-black/10" : "bg-white/8"} rounded-full px-3 py-1 text-xs`}>{route.matchPercent}%</span>
              </div>
              <p className={`${selected ? "text-black/65" : "text-white/45"} mt-1 text-xs`}>{route.stream}</p>
              <p className={`${selected ? "text-black/60" : "text-white/35"} mt-2 text-[11px]`}>
                {route.explanation.matchedSignals.slice(0, 3).map((item) => item.signal).join(" · ") || "Add more tags to strengthen this signal"}
              </p>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-white/40">Showing the strongest 10 route signals only so the map stays usable instead of becoming cluttered.</p>
    </div>
  );
}

function PathwayMap({ route, learnerProfile }) {
  const pathway = getAcademicPathwayForCareer(route.id)?.academicPathway;
  if (!pathway) return null;
  const subjectRisk = assessSubjectRisk(pathway, learnerProfile);
  const riskStyles = {
    green: "border-mint/35 bg-mint/10 text-mint",
    amber: "border-cyber/35 bg-cyber/10 text-cyber",
    red: "border-pink/35 bg-pink/10 text-pink",
    unknown: "border-white/15 bg-white/[0.04] text-white/65",
  };

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
          <p className="mt-3 text-sm leading-6 text-white/55">{pathway.academicRequirementRoute}</p>
          <p className="mt-3 rounded-2xl border border-cyber/20 bg-cyber/10 p-3 text-xs leading-5 text-white/60">{pathway.verification.caution}</p>
          <div className={`mt-3 rounded-2xl border p-4 ${riskStyles[subjectRisk.level] ?? riskStyles.unknown}`}>
            <p className="text-xs uppercase tracking-[0.16em]">Subject risk: {subjectRisk.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{subjectRisk.summary}</p>
            <p className="mt-2 text-xs leading-5 text-white/55">{subjectRisk.nextStep}</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            {subjectItems.map(([label, text]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-mint/80">{label}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3">
              {ladder.map((step, index) => (
                <div key={step.label} className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[10rem_1fr]">
                  <div className="flex items-center gap-3 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-full bg-cyber text-black">{index + 1}</span>{step.label}</div>
                  <p className="text-sm leading-6 text-white/60">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {pathway.qualificationRoutes.slice(0, 3).map((option) => (
              <div key={`${option.type}-${option.qualification}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyber/80">{option.type.replaceAll("_", " ")}</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-white/80">{option.qualification}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">{option.gate}</p>
                <p className="mt-2 inline-flex rounded-full border border-cyber/25 bg-cyber/10 px-3 py-1 text-[11px] text-cyber">template · needs provider verification</p>
              </div>
            ))}
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
