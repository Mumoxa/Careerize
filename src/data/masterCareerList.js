import { SOURCES, getSourceStatus } from "./accreditationSourceRegistry.js";
import { CAREERS as TECH_CAREERS, STREAM as TECH_STREAM, KIND as TECH_KIND, PROFILE as TECH_PROFILE, OFO_MAJOR_GROUPS as TECH_OFO } from "./streams/technology.js";
import { CAREERS as TRADES_CAREERS, STREAM as TRADES_STREAM, KIND as TRADES_KIND, PROFILE as TRADES_PROFILE, OFO_MAJOR_GROUPS as TRADES_OFO } from "./streams/trades.js";
import { CAREERS as FINANCE_CAREERS, STREAM as FINANCE_STREAM, KIND as FINANCE_KIND, PROFILE as FINANCE_PROFILE, OFO_MAJOR_GROUPS as FINANCE_OFO } from "./streams/finance.js";
import { CAREERS as HEALTH_CAREERS, STREAM as HEALTH_STREAM, KIND as HEALTH_KIND, PROFILE as HEALTH_PROFILE, OFO_MAJOR_GROUPS as HEALTH_OFO } from "./streams/health.js";
import { CAREERS as EDUCATION_CAREERS, STREAM as EDUCATION_STREAM, KIND as EDUCATION_KIND, PROFILE as EDUCATION_PROFILE, OFO_MAJOR_GROUPS as EDUCATION_OFO } from "./streams/education.js";
import { CAREERS as AGRICULTURE_CAREERS, STREAM as AGRICULTURE_STREAM, KIND as AGRICULTURE_KIND, PROFILE as AGRICULTURE_PROFILE, OFO_MAJOR_GROUPS as AGRICULTURE_OFO } from "./streams/agriculture.js";
import { CAREERS as LOGISTICS_CAREERS, STREAM as LOGISTICS_STREAM, KIND as LOGISTICS_KIND, PROFILE as LOGISTICS_PROFILE, OFO_MAJOR_GROUPS as LOGISTICS_OFO } from "./streams/logistics.js";
import { CAREERS as LAW_CAREERS, STREAM as LAW_STREAM, KIND as LAW_KIND, PROFILE as LAW_PROFILE, OFO_MAJOR_GROUPS as LAW_OFO } from "./streams/law.js";
import { CAREERS as CREATIVE_CAREERS, STREAM as CREATIVE_STREAM, KIND as CREATIVE_KIND, PROFILE as CREATIVE_PROFILE, OFO_MAJOR_GROUPS as CREATIVE_OFO } from "./streams/creative.js";
import { CAREERS as SALES_CAREERS, STREAM as SALES_STREAM, KIND as SALES_KIND, PROFILE as SALES_PROFILE, OFO_MAJOR_GROUPS as SALES_OFO } from "./streams/sales.js";
import { CAREERS as HOSPITALITY_CAREERS, STREAM as HOSPITALITY_STREAM, KIND as HOSPITALITY_KIND, PROFILE as HOSPITALITY_PROFILE, OFO_MAJOR_GROUPS as HOSPITALITY_OFO } from "./streams/hospitality.js";
import { CAREERS as MANUFACTURING_CAREERS, STREAM as MANUFACTURING_STREAM, KIND as MANUFACTURING_KIND, PROFILE as MANUFACTURING_PROFILE, OFO_MAJOR_GROUPS as MANUFACTURING_OFO } from "./streams/manufacturing.js";
import { CAREERS as INFORMAL_CAREERS, STREAM as INFORMAL_STREAM, KIND as INFORMAL_KIND, PROFILE as INFORMAL_PROFILE, OFO_MAJOR_GROUPS as INFORMAL_OFO } from "./streams/informal.js";
import { CAREERS as SCIENCE_CAREERS, STREAM as SCIENCE_STREAM, KIND as SCIENCE_KIND, PROFILE as SCIENCE_PROFILE, OFO_MAJOR_GROUPS as SCIENCE_OFO } from "./streams/science.js";
import { CAREERS as ARTS_CAREERS, STREAM as ARTS_STREAM, KIND as ARTS_KIND, PROFILE as ARTS_PROFILE, OFO_MAJOR_GROUPS as ARTS_OFO } from "./streams/arts.js";
import { CAREERS as MANAGEMENT_CAREERS, STREAM as MANAGEMENT_STREAM, KIND as MANAGEMENT_KIND, PROFILE as MANAGEMENT_PROFILE, OFO_MAJOR_GROUPS as MANAGEMENT_OFO } from "./streams/management.js";
import { CAREERS as ELEMENTARY_CAREERS, STREAM as ELEMENTARY_STREAM, KIND as ELEMENTARY_KIND, PROFILE as ELEMENTARY_PROFILE, OFO_MAJOR_GROUPS as ELEMENTARY_OFO } from "./streams/elementary.js";
import { CAREERS as ARMED_CAREERS, STREAM as ARMED_STREAM, KIND as ARMED_KIND, PROFILE as ARMED_PROFILE, OFO_MAJOR_GROUPS as ARMED_OFO } from "./streams/armedForces.js";

const STREAMS = [
  { stream: TECH_STREAM, kind: TECH_KIND, profile: TECH_PROFILE, ofoGroups: TECH_OFO, careers: TECH_CAREERS },
  { stream: TRADES_STREAM, kind: TRADES_KIND, profile: TRADES_PROFILE, ofoGroups: TRADES_OFO, careers: TRADES_CAREERS },
  { stream: FINANCE_STREAM, kind: FINANCE_KIND, profile: FINANCE_PROFILE, ofoGroups: FINANCE_OFO, careers: FINANCE_CAREERS },
  { stream: HEALTH_STREAM, kind: HEALTH_KIND, profile: HEALTH_PROFILE, ofoGroups: HEALTH_OFO, careers: HEALTH_CAREERS },
  { stream: EDUCATION_STREAM, kind: EDUCATION_KIND, profile: EDUCATION_PROFILE, ofoGroups: EDUCATION_OFO, careers: EDUCATION_CAREERS },
  { stream: AGRICULTURE_STREAM, kind: AGRICULTURE_KIND, profile: AGRICULTURE_PROFILE, ofoGroups: AGRICULTURE_OFO, careers: AGRICULTURE_CAREERS },
  { stream: LOGISTICS_STREAM, kind: LOGISTICS_KIND, profile: LOGISTICS_PROFILE, ofoGroups: LOGISTICS_OFO, careers: LOGISTICS_CAREERS },
  { stream: LAW_STREAM, kind: LAW_KIND, profile: LAW_PROFILE, ofoGroups: LAW_OFO, careers: LAW_CAREERS },
  { stream: CREATIVE_STREAM, kind: CREATIVE_KIND, profile: CREATIVE_PROFILE, ofoGroups: CREATIVE_OFO, careers: CREATIVE_CAREERS },
  { stream: SALES_STREAM, kind: SALES_KIND, profile: SALES_PROFILE, ofoGroups: SALES_OFO, careers: SALES_CAREERS },
  { stream: HOSPITALITY_STREAM, kind: HOSPITALITY_KIND, profile: HOSPITALITY_PROFILE, ofoGroups: HOSPITALITY_OFO, careers: HOSPITALITY_CAREERS },
  { stream: MANUFACTURING_STREAM, kind: MANUFACTURING_KIND, profile: MANUFACTURING_PROFILE, ofoGroups: MANUFACTURING_OFO, careers: MANUFACTURING_CAREERS },
  { stream: INFORMAL_STREAM, kind: INFORMAL_KIND, profile: INFORMAL_PROFILE, ofoGroups: INFORMAL_OFO, careers: INFORMAL_CAREERS },
  { stream: SCIENCE_STREAM, kind: SCIENCE_KIND, profile: SCIENCE_PROFILE, ofoGroups: SCIENCE_OFO, careers: SCIENCE_CAREERS },
  { stream: ARTS_STREAM, kind: ARTS_KIND, profile: ARTS_PROFILE, ofoGroups: ARTS_OFO, careers: ARTS_CAREERS },
  { stream: MANAGEMENT_STREAM, kind: MANAGEMENT_KIND, profile: MANAGEMENT_PROFILE, ofoGroups: MANAGEMENT_OFO, careers: MANAGEMENT_CAREERS },
  { stream: ELEMENTARY_STREAM, kind: ELEMENTARY_KIND, profile: ELEMENTARY_PROFILE, ofoGroups: ELEMENTARY_OFO, careers: ELEMENTARY_CAREERS },
  { stream: ARMED_STREAM, kind: ARMED_KIND, profile: ARMED_PROFILE, ofoGroups: ARMED_OFO, careers: ARMED_CAREERS },
];

const ofoCodeSet = new Set();
const titleSet = new Set();
const duplicates = [];

for (const s of STREAMS) {
  for (const c of s.careers) {
    if (ofoCodeSet.has(c.ofoCode)) {
      duplicates.push({ type: "ofoCode", value: c.ofoCode, title: c.title, stream: s.stream });
    }
    if (titleSet.has(c.title)) {
      duplicates.push({ type: "title", value: c.title, ofoCode: c.ofoCode, stream: s.stream });
    }
    ofoCodeSet.add(c.ofoCode);
    titleSet.add(c.title);
  }
}

const seen = new Map();
const deduped = [];

for (const s of STREAMS) {
  for (const c of s.careers) {
    const key = c.title;
    if (!seen.has(key)) {
      seen.set(key, true);
      const hasCode = c.ofoCode && /^2021-\d{6}$/.test(c.ofoCode);
      deduped.push({
        title: c.title,
        ofoCode: hasCode ? c.ofoCode : null,
        stream: s.stream,
        kind: s.kind,
        profile: s.profile,
        ofoMajorGroups: s.ofoGroups,
        sourceIds: hasCode
          ? ["dhet-ofo-2021", "careerize-editorial-v1"]
          : ["careerize-editorial-v1"],
        sourceStatus: hasCode ? getSourceStatus(SOURCES.OFO_2021.confidence) : "in-progress",
        sourceRef: hasCode ? `OFO 2021: ${c.ofoCode}` : "OFO mapping pending review",
        verification: hasCode ? "editorial" : "needs-ofo-verification",
      });
    }
  }
}

// Source-of-truth OFO sanitizer: OFO 2021 codes must map to the occupation the
// code actually describes. Where the expansion scripts assigned a code to a
// title in a different stream that doesn't share a meaningful occupational root
// (e.g. "Animal Scientist" sharing a Telecommunications Engineer code, or
// "Small-Scale Clothing Designer" sharing a Diesel Mechanic code), we clear the
// code rather than publish a misleading mapping. Wrong codes are worse than no
// code — null codes render as "OFO mapping in progress" in the UI.
const STOPWORDS = new Set([
  "self","employed","informal","freelance","township","small","scale","assistant",
  "general","basic","home","based","independent","field","senior","junior",
  "live","private","voluntary","casual","night","manager","officer","worker",
  "operator","technician","supervisor","clerk","attendant","labourer",
  "app","online","owner","director","the","and","for","with","from","code",
  "craft","traditional","abnormal","mining","manufacturing","public","private",
  "services","service","sales","retail","health","care","production","entry",
  "level","removals","furniture","long","haul","heavy","light","foundation",
  "phase","intermediate","senior","phase","grade","south","africa","saps",
  "sars","prasa","ca","sa","llb","bcom","bsc","ba","nsc","tvet","seta",
  "ai","ml","llm","nlp","bi","crm","dba","devops","soc","cto","cdo","ciso",
  "ceo","coo","mp","mpl","it","ux","ui","fpga","seo","sem","sme","smmes",
  "led","ward","committee","non","executive","member","local","metro",
  "chief","deputy","acting","head","lead","principal","clinical",
  "registered","enrolled","military","air","force","navy","army",
  "township","street","village","rural","local","provincial","national",
]);

function occupationalTokens(title) {
  return new Set(
    String(title || "")
      .toLowerCase()
      .replace(/\(.*?\)/g, " ")
      .replace(/[^a-z]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !STOPWORDS.has(t))
  );
}

let sanitizedCount = 0;
// Pass 1: null any code whose 1-digit major group isn't allowed by its stream's
// declared OFO major groups. These are fabricated/invented codes (e.g. "close
// protection officer" given a code in major group 5 when the armed forces stream
// only lists major 0/1). Wrong codes are worse than no codes.
for (const c of deduped) {
  if (!c.ofoCode) continue;
  const major = Number(c.ofoCode.slice(5, 6));
  if (!c.ofoMajorGroups?.includes(major)) {
    c.ofoCode = null;
    c.sourceIds = (c.sourceIds ?? []).filter((id) => id !== "dhet-ofo-2021");
    c.sourceRef = "OFO mapping pending — major-group mismatch";
    c.sourceStatus = "in-progress";
    c.verification = "needs-ofo-verification";
    sanitizedCount++;
  }
}
// Pass 2: for codes shared across routes within the allowed major groups, clear
// assignments that don't share an occupational root with the canonical title
// (this catches cross-stream nonsense like Animal Scientist sharing a Telecom
// Engineer code, or Clothing Designer sharing a Diesel Mechanic code).
const ofoCodeToEntries = new Map();
for (const c of deduped) {
  if (!c.ofoCode) continue;
  if (!ofoCodeToEntries.has(c.ofoCode)) ofoCodeToEntries.set(c.ofoCode, []);
  ofoCodeToEntries.get(c.ofoCode).push(c);
}
for (const [code, entries] of ofoCodeToEntries) {
  if (entries.length <= 1) continue;
  entries.sort((a, b) => a.title.length - b.title.length);
  const canonical = entries[0];
  const canonTokens = occupationalTokens(canonical.title);
  if (canonTokens.size === 0) continue;
  for (const e of entries) {
    if (e === canonical) continue;
    const eTokens = occupationalTokens(e.title);
    const overlap = [...eTokens].some((t) => canonTokens.has(t));
    if (!overlap) {
      e.ofoCode = null;
      e.sourceIds = (e.sourceIds ?? []).filter((id) => id !== "dhet-ofo-2021");
      e.sourceRef = "OFO mapping pending — code assignment did not pass the shared-occupational-root check";
      e.sourceStatus = "in-progress";
      e.verification = "needs-ofo-verification";
      sanitizedCount++;
    }
  }
}

if (sanitizedCount > 0 && !process.env.CAREERIZE_QUIET_SANITIZER) {
  console.info(`[masterCareerList] Sanitized ${sanitizedCount} OFO code mappings that did not share an occupational root with the canonical title.`);
}

export const MASTER_CAREER_LIST = deduped;

export const UNIQUE_KEY_COUNT = seen.size;

const groupMap = new Map();
for (const entry of MASTER_CAREER_LIST) {
  if (!groupMap.has(entry.stream)) {
    groupMap.set(entry.stream, []);
  }
  groupMap.get(entry.stream).push(entry);
}

export const MASTER_CAREER_GROUPS = Array.from(groupMap.entries()).map(([stream, entries]) => ({
  stream,
  kind: entries[0].kind,
  profile: entries[0].profile,
  ofoMajorGroups: entries[0].ofoMajorGroups,
  titles: entries.map((e) => e.title),
  careerCount: entries.length,
}));

export const MASTER_CAREER_TOTAL = MASTER_CAREER_LIST.length;

export const MASTER_DUPLICATE_LOG = duplicates;
