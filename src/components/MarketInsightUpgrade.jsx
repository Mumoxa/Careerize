import React from "react";
import { BarChart3, Check, Database, GraduationCap, Map, Search, ShieldCheck, WifiOff } from "lucide-react";
import { CAREER_ROUTES, PATHWAY_TYPES, SOURCE_REGISTRY } from "../data/careerCatalog";

const DECISIONS = [
  ["Structured O*NET-style profiles", "Adapt", "Careerize keeps its warmer South African voice, but the catalog now carries tasks, day-in-life, subjects, pathways, sources and confidence."],
  ["Skills Matcher pattern", "Adapt", "The deterministic route scoring is preserved and prepared for visible matched/missing signals instead of black-box AI."],
  ["NCS multi-route entry", "Replace weak area", "The old generic pathway concept is expanded into eight South African route types."],
  ["Salary and demand visuals", "Prepare, not fake", "The product now shows source/data states and refuses to display numbers until the data is verified."],
  ["Free and independent surface", "Preserve", "Careerize already had the right boundary: no job board, no course marketplace, no employer influence."],
];

const PROFILE_BLUEPRINT = [
  "Plain-English summary",
  "Real day-in-the-life blocks",
  "Key tasks and tools",
  "School subjects to investigate",
  "SA training and work routes",
  "Best, worst and misconceptions",
  "Salary/demand source state",
  "Confidence and last-updated date",
];

export default function MarketInsightUpgrade() {
  const starterProfiles = CAREER_ROUTES.length;
  const mappedPathways = CAREER_ROUTES.reduce((total, route) => total + route.pathways.length, 0);

  return (
    <section className="relative z-10 bg-ink px-5 py-16 text-white" aria-labelledby="market-upgrade-heading">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <Pill><Search size={14} /> Market-insight upgrade</Pill>
          <h2 id="market-upgrade-heading" className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
            What was preserved, adapted and prepared for scale.
          </h2>
          <p className="mt-5 text-base leading-7 text-white/60">
            The uploaded market report was used as a decision filter, not a copy source. The current build preserves Careerize’s independent positioning and adds the source, confidence, pathway and architecture scaffolding needed for a serious South African career-intelligence product.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-4">
          <Metric icon={Database} value={starterProfiles} label="structured starter profiles" />
          <Metric icon={GraduationCap} value={PATHWAY_TYPES.length} label="SA pathway types" />
          <Metric icon={Map} value={mappedPathways} label="mapped route entries" />
          <Metric icon={ShieldCheck} value={SOURCE_REGISTRY.length} label="source records" />
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassCard>
            <Pill><Check size={14} /> Temporary comparison table</Pill>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-white/35">
                  <tr><th className="pr-4">Document insight</th><th className="pr-4">Decision</th><th>Reason</th></tr>
                </thead>
                <tbody>
                  {DECISIONS.map(([insight, decision, reason]) => (
                    <tr key={insight} className="align-top">
                      <td className="rounded-l-2xl border-y border-l border-white/10 bg-white/[0.03] p-4 font-semibold text-white/80">{insight}</td>
                      <td className="border-y border-white/10 bg-white/[0.03] p-4 text-cyber">{decision}</td>
                      <td className="rounded-r-2xl border-y border-r border-white/10 bg-white/[0.03] p-4 text-white/55">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          <GlassCard>
            <Pill><BarChart3 size={14} /> Career profile blueprint</Pill>
            <h3 className="mt-4 font-display text-3xl font-semibold">Structured enough for data, plain enough for a Grade 10 learner.</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PROFILE_BLUEPRINT.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/65">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-cyber/20 bg-cyber/10 p-5 text-sm leading-6 text-white/70">
              Salary and demand sections are intentionally marked as not source-verified. This avoids misleading precision while keeping the UI ready for real South African data.
            </div>
          </GlassCard>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard>
            <Pill><GraduationCap size={14} /> South African pathway readiness</Pill>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {PATHWAY_TYPES.map((route) => (
                <div key={route.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="font-semibold text-white/85">{route.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/50">{route.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <Pill><WifiOff size={14} /> Trust and access guardrails</Pill>
            <div className="mt-5 space-y-3 text-sm leading-6 text-white/60">
              <p><strong className="text-white/85">Low-data ready:</strong> the UI has a low-data control and avoids making heavy visuals the only way to understand the product.</p>
              <p><strong className="text-white/85">No unsupported claims:</strong> starter profiles carry confidence scores and last-updated dates, while salary and demand remain withheld until sourced.</p>
              <p><strong className="text-white/85">No black-box verdict:</strong> scoring remains deterministic and explainable; it is a conversation starter, not a psychometric decision.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <span className="inline-flex rounded-2xl bg-cyber p-3 text-black"><Icon size={20} /></span>
      <div className="mt-4 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">{label}</div>
    </div>
  );
}

function GlassCard({ children }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-7">{children}</div>;
}

function Pill({ children }) {
  return <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/55">{children}</div>;
}
