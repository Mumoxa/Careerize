import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  Map,
  RotateCcw,
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
  { id: "sponsors", label: "Partners" },
];

const DEFAULT_SIGNALS = [];

export default function App() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedSignals, setSelectedSignals] = useState(DEFAULT_SIGNALS);
  const [manualActiveId, setManualActiveId] = useState(null);

  const ranked = useMemo(
    () => rankCareerRoutes(CAREER_ROUTES, answers, selectedSignals),
    [answers, selectedSignals]
  );

  const bestMatch = ranked[0];
  const active = ranked.find((route) => route.id === manualActiveId) || bestMatch;
  const progress = getProfileProgress(answers, DISCOVERY_QUESTIONS);

  function choose(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setManualActiveId(null);
  }

  function toggleInterestSignal(signal) {
    setSelectedSignals((prev) => toggleSignal(prev, signal));
    setManualActiveId(null);
  }

  function reset() {
    setAnswers({});
    setSelectedSignals(DEFAULT_SIGNALS);
    setManualActiveId(null);
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
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Discover, do not guess</div>
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
            <a href="#discover" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-[0_0_40px_-10px_rgba(242,255,73,.8)]">Start safely</a>
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
          <Pill><span className="h-2 w-2 rounded-full bg-mint" /> Career discovery for South African learners</Pill>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mt-6 font-display text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] md:text-[88px]"
          >
            Make subject and career choices with <span className="bg-gradient-to-br from-cyber via-mint to-violet bg-clip-text text-transparent">evidence, not pressure.</span>
          </motion.h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 md:text-lg">
            Careerize helps Grade 10s and school leavers compare real work patterns, stress, tools and entry routes before they spend years and money on a path.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#discover" className="inline-flex items-center gap-2 rounded-full bg-cyber px-6 py-3 font-semibold text-black shadow-[0_0_55px_-14px_rgba(242,255,73,.9)]">Start discovery <ArrowRight size={18} /></a>
            <a href="#reality" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-white/80 hover:border-white/40">See reality checks <ArrowUpRight size={18} /></a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <MiniStat value={CAREER_ROUTES.length} label="starter routes" />
            <MiniStat value={`${progress}%`} label="profile complete" />
            <MiniStat value="Human" label="final choice" />
          </div>
        </div>

        <HeroCard ranked={ranked} active={active} progress={progress} />
      </section>

      <section id="discover" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Discovery" title="Start with behaviour, not job titles" text="The learner answers simple questions and Careerize turns the answers into practical career routes with clear caveats. It is guidance, not a hidden hiring decision." />
        <div className="mt-9 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold">Quick fit questions</h3>
                <p className="mt-2 text-sm text-white/55">Simple enough for an uninformed learner, but useful enough to shape a route.</p>
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
            <p className="mt-2 text-sm text-white/55">Tags add texture without pretending to measure personality, worth or potential.</p>
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
          <GlassCard>
            <p className="text-sm uppercase tracking-[0.18em] text-white/40">Ranked matches</p>
            <div className="mt-5 space-y-3">
              {ranked.map((route, index) => (
                <button
                  type="button"
                  key={route.id}
                  onClick={() => setManualActiveId(route.id)}
                  aria-pressed={active.id === route.id}
                  className={`w-full rounded-3xl border p-4 text-left transition ${active.id === route.id ? "border-cyber bg-cyber text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{index + 1}. {route.title}</span>
                    <span className="rounded-full bg-black/10 px-3 py-1 text-xs">{route.matchPercent}% signal</span>
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
        <SectionHeading eyebrow="Pathway" title="Show the route in and the route up" text="A learner needs to know the entry point, the practical ladder and where the career can get stuck." />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <PathStep icon={GraduationCap} title="1. Entry" text="School subjects, TVET, diploma, degree, internship, apprenticeship, portfolio or short course." />
          <PathStep icon={Building2} title="2. First job" text="Junior role, assistant role, trainee role, site role or support role where real work begins." />
          <PathStep icon={Trophy} title="3. Growth" text="Specialist, senior, supervisor, manager, consultant, contractor or business-owner options." />
        </div>
        <NextActionPlan route={active} progress={progress} />
      </section>

      <section id="trust" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Trust architecture" title="Guidance should increase agency, not quietly score people" text="Careerize is designed around learner dignity: transparent signals, visible caveats and no automated rejection or suitability decisioning." />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <TrustCard icon={ShieldCheck} title="Explainable suggestions" text="Routes are ranked from the answers and tags learners choose. The app shows reality checks instead of pretending one score can decide a future." />
          <TrustCard icon={Lock} title="Privacy by default" text="This frontend demo keeps discovery state in the browser session. The optional Supabase schema limits saved learner records to the signed-in owner through row-level security." />
          <TrustCard icon={Lightbulb} title="Human decision loop" text="Careerize can support family, school and mentor conversations, but it should not replace counselling, admissions advice or employer judgement." />
        </div>
      </section>

      <section id="sponsors" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <GlassCard className="overflow-hidden">
          <div className="grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div>
              <Pill><Sparkles size={14} /> Hybrid NGO / Commercial model</Pill>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Fund access. Build a future talent pipeline.</h2>
              <p className="mt-5 max-w-2xl text-white/60">Companies, schools and funders can support learner access while Careerize builds useful labour-market insight over time.</p>
            </div>
            <div className="grid gap-3">
              {["School access", "Sponsored learner licences", "Career stream data", "Employer pathway content"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/75"><Check size={18} className="text-mint" /> {item}</div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-white/5 px-5 py-10 text-sm text-white/40 md:flex-row md:justify-between">
        <div className="flex items-center gap-3"><LogoMark small /> <span>© 2026 Careerize · Made in South Africa</span></div>
        <div className="flex gap-6"><a href="#trust">Privacy</a><a href="#sponsors">For Schools</a><a href="mailto:hello@careerize.co.za">Partner with us</a></div>
      </footer>
    </main>
  );
}

function HeroCard({ ranked, active, progress }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }} className="relative">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-violet/25 via-mint/10 to-cyber/20 blur-3xl" />
      <GlassCard className="relative min-h-[520px] overflow-hidden">
        <div className="flex items-center justify-between">
          <Pill><Eye size={14} /> Live learner profile</Pill>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{progress}% complete</span>
        </div>
        <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/25 p-5">
          <p className="text-sm text-white/45">Best current match</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">{active.title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">{active.summary}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/60">
            <InfoPill icon={Clock} text={active.stress} />
            <InfoPill icon={Compass} text={active.remote} />
          </div>
          <p className="mt-4 rounded-2xl border border-cyber/20 bg-cyber/10 p-3 text-xs leading-5 text-white/70">
            Not a verdict: this is a transparent signal based on your current answers. Change any answer to compare alternatives.
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {ranked.slice(0, 3).map((route, index) => (
            <div key={route.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div><p className="text-sm font-semibold">{route.title}</p><p className="text-xs text-white/40">{route.stream}</p></div>
              <div className="flex items-center gap-2 text-xs text-white/55"><Star size={14} className="text-cyber" /> {index === 0 ? "Top" : `#${index + 1}`}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
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
