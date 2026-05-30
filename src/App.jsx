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
  Menu,
  RotateCcw,
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

const C = {
  yellow: "#F2FF49",
  violet: "#8A5BFF",
  mint: "#6CFFB0",
  pink: "#FF6AD5",
};

const routes = [
  {
    id: "data",
    title: "Data Analyst",
    stream: "Data, insights and business decisions",
    fit: ["numbers", "patterns", "problem-solving", "quiet", "technology", "business"],
    summary: "You study information and help people understand what is really happening in a business.",
    day: "Collect information, clean it, find patterns, build reports and explain what the numbers mean.",
    tools: "A computer, spreadsheets, dashboards, databases and reporting software.",
    environment: "Banks, retailers, insurers, telecoms, logistics companies and large corporates. Usually office or hybrid.",
    stress: "Medium. Pressure rises when leaders need answers quickly.",
    remote: "Often possible once you have skill and trust.",
    growth: "Can grow into BI, analytics, data science, product, risk or management.",
    worst: "Messy information and unclear questions can be frustrating.",
    best: "You help people make better decisions with facts instead of guesses.",
  },
  {
    id: "software",
    title: "Software Developer",
    stream: "Technology and digital products",
    fit: ["building", "problem-solving", "technology", "quiet", "remote", "maths"],
    summary: "You build websites, apps and systems that people use on computers and phones.",
    day: "Understand a problem, write code, test it, fix issues, join short meetings and improve software.",
    tools: "A computer, code editor, browser, communication tools and project boards.",
    environment: "Software companies, banks, retailers, startups and global remote teams.",
    stress: "Medium to high when deadlines are tight or systems break.",
    remote: "One of the stronger remote-work paths.",
    growth: "Can grow into senior developer, architect, engineering manager or product founder.",
    worst: "You can get stuck on difficult bugs for hours.",
    best: "You can create something useful from nothing.",
  },
  {
    id: "finance",
    title: "Finance or Accounting Professional",
    stream: "Finance, accounting and business control",
    fit: ["numbers", "detail", "business", "structure", "money", "office"],
    summary: "You help a business understand money, costs, payments, profit and financial rules.",
    day: "Check transactions, prepare reports, follow up payments, compare budgets and help managers understand results.",
    tools: "A computer, spreadsheets, accounting systems, banking platforms and document systems.",
    environment: "Nearly every company needs finance people. Mostly office-based, sometimes hybrid at higher levels.",
    stress: "Medium to high around month-end, audits and deadlines.",
    remote: "Sometimes possible, but many teams still expect office time.",
    growth: "Can grow into accountant, analyst, financial manager, CFO or business owner.",
    worst: "Deadlines and detailed checking can become repetitive.",
    best: "You understand how businesses really work.",
  },
  {
    id: "artisan",
    title: "Electrician or Technical Artisan",
    stream: "Skilled trades and technical work",
    fit: ["hands-on", "fixing", "tools", "practical", "moving", "technical"],
    summary: "You install, repair and maintain physical systems like wiring, equipment or machinery.",
    day: "Travel to a site, check the problem, use tools, repair or install equipment and make sure the work is safe.",
    tools: "Hand tools, testing equipment, safety gear, ladders, meters and technical drawings.",
    environment: "Homes, factories, mines, construction sites, offices or industrial plants.",
    stress: "Medium. Can be high when safety risks or urgent breakdowns are involved.",
    remote: "Not usually remote. The work is physical and site-based.",
    growth: "Can grow into specialist artisan, supervisor, contractor or business owner.",
    worst: "Physical work, travel and unsafe sites can be difficult.",
    best: "You solve visible problems and your skill is always needed.",
  },
  {
    id: "healthcare",
    title: "Healthcare Professional",
    stream: "Health, care and human services",
    fit: ["helping", "people", "science", "biology", "care", "high-stress"],
    summary: "You help people stay healthy, recover or manage illness and injury.",
    day: "See patients, check symptoms, follow care plans, record information and work with other healthcare workers.",
    tools: "Medical equipment, patient records, computers, medicine-related systems and practical care tools.",
    environment: "Hospitals, clinics, private practices, care facilities or community health settings.",
    stress: "High. You deal with real people, pressure and responsibility.",
    remote: "Mostly not remote, except for some admin, advisory and digital-health roles.",
    growth: "Can grow into senior clinical, specialist, management, research or private practice paths.",
    worst: "Emotionally heavy days and shift work can be hard.",
    best: "Your work can directly improve someone’s life.",
  },
];

const questions = [
  {
    id: "interest",
    label: "What sounds most interesting to you?",
    options: [
      ["building", "Building things on a computer"],
      ["people", "Working with people"],
      ["numbers", "Working with numbers"],
      ["hands-on", "Fixing practical things"],
    ],
  },
  {
    id: "day",
    label: "What type of day would suit you better?",
    options: [
      ["remote", "Quiet work that can sometimes be done from home"],
      ["hands-on", "Moving around and doing practical work"],
      ["business", "Working inside a company with teams"],
      ["helping", "Helping people directly"],
    ],
  },
  {
    id: "school",
    label: "Which school area do you prefer?",
    options: [
      ["science", "Science or biology"],
      ["numbers", "Maths, accounting or business"],
      ["technology", "Computers and digital tools"],
      ["technical", "Technical or practical work"],
    ],
  },
  {
    id: "friction",
    label: "What would frustrate you the least?",
    options: [
      ["problem-solving", "Solving difficult problems"],
      ["detail", "Checking details carefully"],
      ["people", "Dealing with different personalities"],
      ["practical", "Physical work and site visits"],
    ],
  },
];

const vibeTags = [
  ["building", "Building things", Wrench],
  ["people", "Talking to people", Users],
  ["numbers", "Working with data", Brain],
  ["helping", "Helping people", Heart],
  ["technology", "Digital tools", Zap],
  ["business", "Business decisions", Briefcase],
  ["practical", "Practical work", Gauge],
  ["detail", "Detailed checking", Check],
];

function scoreRoutes(answers, selectedTags) {
  const selected = [...Object.values(answers), ...selectedTags];
  return routes
    .map((route) => ({
      ...route,
      score: route.fit.reduce((total, tag) => total + (selected.includes(tag) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState(["technology", "business"]);
  const [activeId, setActiveId] = useState("data");
  const [saved, setSaved] = useState(false);

  const ranked = useMemo(() => scoreRoutes(answers, selectedTags), [answers, selectedTags]);
  const active = routes.find((route) => route.id === activeId) || ranked[0];
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  function choose(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaved(false);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
    setSaved(false);
  }

  function reset() {
    setAnswers({});
    setSelectedTags([]);
    setActiveId("data");
    setSaved(false);
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

          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#discover" className="hover:text-white">Discovery</a>
            <a href="#reality" className="hover:text-white">Reality Check</a>
            <a href="#pathway" className="hover:text-white">Pathway</a>
            <a href="#sponsors" className="hover:text-white">Partners</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a href="#discover" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40">Try demo</a>
            <a href="#discover" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-[0_0_40px_-10px_rgba(242,255,73,.8)]">Open the app</a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="rounded-xl border border-white/10 p-2 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/5 bg-ink px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4 text-sm text-white/80">
              {["discover", "reality", "pathway", "sponsors"].map((id) => (
                <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="capitalize">{id}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-12 md:grid-cols-[1.05fr_0.95fr] md:pb-20 md:pt-20">
        <div className="flex flex-col justify-center">
          <Pill><span className="h-2 w-2 rounded-full bg-mint" /> Career guidance for South African learners</Pill>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mt-6 font-display text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] md:text-[88px]"
          >
            Do not search for a job. <span className="bg-gradient-to-br from-cyber via-mint to-violet bg-clip-text text-transparent">Discover yourself.</span>
          </motion.h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 md:text-lg">
            A gamified career discovery experience for Grade 10s and school leavers who do not yet know what work really looks like.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#discover" className="inline-flex items-center gap-2 rounded-full bg-cyber px-6 py-3 font-semibold text-black shadow-[0_0_55px_-14px_rgba(242,255,73,.9)]">Start discovery <ArrowRight size={18} /></a>
            <a href="#reality" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-white/80 hover:border-white/40">See reality checks <ArrowUpRight size={18} /></a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <MiniStat value="5" label="starter routes" />
            <MiniStat value={`${progress}%`} label="profile complete" />
            <MiniStat value="SA" label="local context" />
          </div>
        </div>

        <HeroCard ranked={ranked} active={active} progress={progress} />
      </section>

      <section id="discover" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <SectionHeading eyebrow="Discovery" title="Start with behaviour, not job titles" text="The learner answers simple questions and Careerize turns the answers into practical career routes." />
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
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-white/85">{q.label}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map(([value, label]) => {
                      const activeChoice = answers[q.id] === value;
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => choose(q.id, value)}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${activeChoice ? "border-cyber bg-cyber text-black" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-2xl font-semibold">Interest tags</h3>
            <p className="mt-2 text-sm text-white/55">This makes the experience feel more like discovery and less like a school form.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {vibeTags.map(([tag, label, Icon]) => {
                const activeTag = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`group flex items-center justify-between rounded-3xl border p-4 text-left transition ${activeTag ? "border-mint bg-mint/12" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                  >
                    <span className="flex items-center gap-3"><span className="rounded-2xl bg-white/8 p-3"><Icon size={18} /></span><span className="text-sm font-medium text-white/80">{label}</span></span>
                    {activeTag ? <Check size={18} className="text-mint" /> : <ChevronRight size={18} className="text-white/25" />}
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
                  onClick={() => setActiveId(route.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${active.id === route.id ? "border-cyber bg-cyber text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{index + 1}. {route.title}</span>
                    <span className="rounded-full bg-black/10 px-3 py-1 text-xs">score {route.score}</span>
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
        <div className="flex gap-6"><a href="#top">Privacy</a><a href="#sponsors">For Schools</a><a href="#sponsors">Partner with us</a></div>
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
