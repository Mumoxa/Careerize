import { MASTER_CAREER_GROUPS, MASTER_CAREER_LIST, MASTER_CAREER_TOTAL } from "./masterCareerList.js";
import { buildDirectionIndex, findRelatedCareers } from "./careerDirections.js";

export const SOURCE_REGISTRY = [
  {
    id: "careerize-editorial-v1",
    title: "Careerize editorial starter profiles",
    type: "editorial-demo",
    url: "docs/strategy-and-repo-scope.md",
    accessedAt: "2026-06-15",
    confidence: 55,
    supports: ["summary", "dayInLife", "tasks", "prosCons", "starterPathways", "earningPotential"],
    note: "Internal starter content used to prove the profile structure. It is not a labour-market data source and does not support salary numbers.",
  },
  {
    id: "careerize-source-model-v1",
    title: "Careerize source and confidence model",
    type: "methodology",
    url: "docs/market-insights-decision-log.md",
    accessedAt: "2026-06-15",
    confidence: 60,
    supports: ["confidence", "sourceTransparency", "recommendationGuardrails", "earningPotentialGuardrails"],
    note: "Methodology record for visible source/confidence states until external public sources are loaded.",
  },
  {
    id: "careerize-expanded-taxonomy-v1",
    title: "Careerize expanded South African starter taxonomy",
    type: "editorial-taxonomy",
    url: "docs/CAREER_COVERAGE_MANIFEST.md",
    accessedAt: "2026-06-15",
    confidence: 50,
    supports: ["careerUniverse", "streamCoverage", "starterProfiles", "pathwayScaffold"],
    note: "Broad starter taxonomy based on the Careerize project history and strategy. It expands coverage without pretending to be source-verified labour-market data.",
  },
  {
    id: "dhet-occupations-high-demand-2024",
    title: "DHET 2024 National List of Occupations in High Demand",
    type: "official-government",
    url: "https://www.gov.za/sites/default/files/gcis_document/202404/50510gen2414.pdf",
    accessedAt: "2026-06-28",
    confidence: 75,
    supports: ["occupationDemandEvidence", "ofoMapping", "postSchoolPlanning"],
    note: "Official South African demand-list source for future claim-level verification. Starter profiles must not present demand as verified until a route-level evidence record is attached.",
  },
  {
    id: "saqa-nqf-source",
    title: "South African Qualifications Authority NQF and qualification records",
    type: "official-register",
    url: "https://www.saqa.org.za",
    accessedAt: "2026-06-28",
    confidence: 80,
    supports: ["nqfLevels", "qualificationRegistration", "qualificationRoutes"],
    note: "Official qualification-register source for future route-specific NQF and qualification checks. Provider entry rules still need provider-specific verification.",
  },
  {
    id: "qcto-occupational-source",
    title: "Quality Council for Trades and Occupations occupational qualification records",
    type: "quality-council",
    url: "https://www.qcto.org.za",
    accessedAt: "2026-06-28",
    confidence: 80,
    supports: ["occupationalQualifications", "tradeRoutes", "workplaceLearning"],
    note: "Official quality-council source for future occupational, trade and skills-programme verification.",
  },
  {
    id: "che-accreditation-source",
    title: "Council on Higher Education accreditation records",
    type: "quality-council",
    url: "https://www.che.ac.za",
    accessedAt: "2026-06-28",
    confidence: 80,
    supports: ["higherEducationAccreditation", "programmeRecognition", "institutionalQuality"],
    note: "Official quality-council source for future higher-education programme and accreditation checks.",
  },
  {
    id: "dhet-institution-registers-source",
    title: "DHET public and private post-school institution registers",
    type: "official-government",
    url: "https://www.dhet.gov.za",
    accessedAt: "2026-06-28",
    confidence: 75,
    supports: ["institutionRegistration", "publicUniversities", "tvetColleges", "privateProviderChecks"],
    note: "Official government source for future provider and institution-status checks. Provider-specific programme claims still require exact source records.",
  },
];

export const PATHWAY_TYPES = [
  { id: "nsc", label: "NSC subject route", description: "School subject choices and matric readiness." },
  { id: "university", label: "University route", description: "Degree or postgraduate study where required or useful." },
  { id: "tvet", label: "TVET route", description: "College, certificate, diploma or practical vocational route." },
  { id: "learnership", label: "Learnership route", description: "SETA-aligned workplace learning where available." },
  { id: "apprenticeship", label: "Apprenticeship route", description: "Trade-tested route for artisan and technical work where relevant." },
  { id: "shortcourse", label: "Short-course route", description: "Focused skills course, portfolio project or tool-specific training." },
  { id: "work", label: "Work-experience route", description: "Assistant, junior, volunteer, shadowing or project-based entry." },
  { id: "pivot", label: "Career-pivot route", description: "Move in from related work by using transferable skills." },
];

const qualitativeDemandOnly = {
  status: "not-source-verified",
  label: "Demand insight not verified yet",
  explanation: "This profile is ready for province-level demand signals later, but Careerize must add source-verified South African labour-market data before displaying demand claims.",
};

const baseProfile = {
  country: "ZA",
  status: "starter-profile",
  lastUpdated: "2026-06-15",
  dataConfidence: 50,
  sourceIds: ["careerize-editorial-v1", "careerize-source-model-v1", "careerize-expanded-taxonomy-v1"],
  demand: qualitativeDemandOnly,
};

const SIGNAL_PRESETS = {
  tech: { technology: 3, building: 2, problemSolving: 3, patterns: 2, quiet: 1 },
  finance: { numbers: 3, detail: 3, accounting: 3, structure: 2, office: 1 },
  practical: { handsOn: 3, practical: 3, tools: 2, fixing: 2, moving: 1 },
  care: { helping: 3, care: 3, biology: 2, people: 2, highStress: 1 },
  education: { helping: 3, people: 3, structure: 2, care: 1, business: 1 },
  agri: { practical: 3, biology: 2, tools: 2, moving: 2, business: 1 },
  logistics: { business: 2, moving: 3, practical: 2, people: 1, structure: 2 },
  public: { people: 2, structure: 3, helping: 2, detail: 2, highStress: 1 },
  creative: { building: 2, people: 2, technology: 1, practical: 1, detail: 1 },
  people: { people: 3, helping: 2, business: 2, structure: 1, office: 1 },
  hospitality: { people: 3, moving: 2, practical: 2, helping: 2, highStress: 1 },
  engineering: { technical: 3, maths: 2, problemSolving: 2, practical: 2, tools: 2 },
  entrepreneur: { business: 3, people: 2, practical: 3, problemSolving: 2, moving: 2 },
  science: { science: 3, biology: 2, patterns: 2, detail: 2, problemSolving: 2 },
};

const SUBJECT_PRESETS = {
  tech: ["Mathematics", "Information Technology", "Computer Applications Technology", "Physical Sciences", "Business Studies"],
  finance: ["Accounting", "Mathematics", "Mathematical Literacy", "Business Studies", "Economics"],
  practical: ["Technical Mathematics", "Engineering Graphics and Design", "Physical Sciences", "Mathematics", "Technology subjects"],
  care: ["Life Sciences", "Mathematics", "Physical Sciences", "Life Orientation", "English"],
  education: ["English", "Life Orientation", "History", "Mathematics", "Life Sciences"],
  agri: ["Agricultural Sciences", "Life Sciences", "Geography", "Mathematics", "Business Studies"],
  logistics: ["Business Studies", "Geography", "Mathematics", "Computer Applications Technology", "Economics"],
  public: ["History", "Business Studies", "English", "Life Orientation", "Geography"],
  creative: ["Visual Arts", "Design", "Dramatic Arts", "Computer Applications Technology", "English"],
  people: ["Business Studies", "English", "Life Orientation", "Computer Applications Technology", "Economics"],
  hospitality: ["Hospitality Studies", "Tourism", "Consumer Studies", "Business Studies", "English"],
  engineering: ["Mathematics", "Physical Sciences", "Engineering Graphics and Design", "Technical Mathematics", "Information Technology"],
  entrepreneur: ["Business Studies", "Accounting", "Mathematical Literacy", "Computer Applications Technology", "English"],
  science: ["Physical Sciences", "Life Sciences", "Mathematics", "Geography", "Information Technology"],
};

const TOOL_PRESETS = {
  tech: ["computer", "specialised software", "testing tools", "online documentation", "team communication tools"],
  finance: ["computer", "spreadsheets", "finance or accounting systems", "banking/document platforms", "compliance checklists"],
  practical: ["hand tools", "testing equipment", "safety gear", "technical drawings", "mobile job cards"],
  care: ["care records", "basic medical or support equipment", "safety procedures", "communication tools", "referral systems"],
  education: ["lesson plans", "computer or tablet", "learning materials", "assessment tools", "communication apps"],
  agri: ["farm tools", "machinery or irrigation systems", "safety gear", "record books", "mobile weather or market tools"],
  logistics: ["vehicle or transport systems", "tracking software", "warehouse tools", "route plans", "communication devices"],
  public: ["case files", "computer systems", "legislation or policy documents", "forms", "communication tools"],
  creative: ["computer", "creative software", "camera or design tools", "brief documents", "portfolio platforms"],
  people: ["computer", "phone", "customer or case systems", "email and chat tools", "planning templates"],
  hospitality: ["booking systems", "kitchen or service tools", "point-of-sale systems", "cleaning/safety checklists", "communication tools"],
  engineering: ["design software", "technical drawings", "measurement tools", "project documents", "site or lab equipment"],
  entrepreneur: ["phone", "payment tools", "stock records", "supplier contacts", "basic marketing tools"],
  science: ["laboratory or field equipment", "computer", "measurement tools", "analysis software", "safety records"],
};

const ROUTE_PRESETS = {
  mixed: ["nsc", "university", "tvet", "learnership", "shortcourse", "work", "pivot"],
  trade: ["nsc", "tvet", "learnership", "apprenticeship", "shortcourse", "work", "pivot"],
  vocational: ["nsc", "tvet", "learnership", "shortcourse", "work", "pivot"],
  portfolio: ["nsc", "university", "tvet", "shortcourse", "work", "pivot"],
  care: ["nsc", "university", "tvet", "learnership", "shortcourse", "work", "pivot"],
  public: ["nsc", "university", "tvet", "learnership", "shortcourse", "work", "pivot"],
  entrepreneur: ["nsc", "shortcourse", "work", "pivot"],
  science: ["nsc", "university", "shortcourse", "work", "pivot"],
  logistics: ["nsc", "tvet", "learnership", "shortcourse", "work", "pivot"],
  hospitality: ["nsc", "tvet", "learnership", "shortcourse", "work", "pivot"],
  education: ["nsc", "university", "tvet", "learnership", "shortcourse", "work", "pivot"],
};

const PATHWAY_LABELS = {
  nsc: "Use school subjects to build the foundation for this route",
  university: "Use a relevant degree or diploma where the role needs deeper theory or professional recognition",
  tvet: "Use a TVET or vocational programme where practical entry is realistic",
  learnership: "Look for a SETA-aligned or employer learnership where available",
  apprenticeship: "Use an apprenticeship or trade-tested route where the work is artisan based",
  shortcourse: "Build specific proof through focused short courses, projects or tool practice",
  work: "Start through assistant, junior, internship, volunteer, project or trainee work",
  pivot: "Move in from adjacent work by proving transferable skills and closing the biggest gaps",
};

const PATHWAY_TIME = {
  nsc: "School planning",
  university: "3-4 years",
  tvet: "1-3 years",
  learnership: "12-24 months",
  apprenticeship: "2-4 years",
  shortcourse: "3-18 months",
  work: "0-24 months",
  pivot: "6-24 months",
};

const EARNING_PRESETS = {
  tech: ["High upside potential where skill depth and proof grow", "digital work can become a high-upside route when the learner builds proof, keeps learning and can solve real problems."],
  finance: ["Good progression potential with trust and accuracy", "finance and control work has many levels, from accessible support roles to professional and leadership routes."],
  practical: ["Strong practical earning potential with reliable skill", "hands-on work can become valuable when the person becomes reliable, safe, trusted and able to solve real site problems."],
  care: ["Meaningful pathway with earning growth linked to qualification and responsibility", "care work can grow when formal training, registration, experience and responsibility increase."],
  education: ["Stable purpose-led pathway with growth through specialisation", "education and training routes grow through qualification, experience, subject depth and leadership."],
  agri: ["Variable but important earning potential linked to production and market access", "agricultural and environmental routes can grow through technical knowledge, scale, markets and reliability."],
  logistics: ["Steady earning potential with operational responsibility", "logistics can grow through reliability, route or stock control, compliance and team responsibility."],
  public: ["Stable progression potential where rules, service and trust matter", "public-service paths usually grow through formal entry requirements, discipline, experience and responsibility."],
  creative: ["Variable earning potential; portfolio and market fit matter", "creative paths can grow strongly for people who build a visible portfolio, reliable delivery and a clear niche."],
  people: ["Variable but useful earning potential through relationships and results", "people-facing work can grow when service quality, trust and commercial judgement improve."],
  hospitality: ["Variable earning potential; service quality and management matter", "hospitality can grow from frontline work into supervision, operations, ownership or specialist service."],
  engineering: ["Strong technical earning potential with scarce practical judgement", "engineering and technical work can grow when maths, systems thinking and site judgement improve."],
  entrepreneur: ["Variable earning potential with high personal responsibility", "entrepreneurial routes can grow when the person understands demand, cost, service, cash flow and repeat customers."],
  science: ["Specialist earning potential with scarce technical depth", "science and research paths often need more study, but specialist skill can open strong options over time."],
};

const ENVIRONMENT_PRESETS = {
  tech: "companies, startups, public bodies, remote teams or internal technology departments",
  finance: "companies, accounting firms, banks, insurers, retailers, SMEs or public institutions",
  practical: "workshops, sites, homes, factories, farms, mines or customer locations",
  care: "clinics, hospitals, community programmes, homes, NGOs or private practices",
  education: "schools, colleges, training centres, homes, online classes or community programmes",
  agri: "farms, food businesses, field sites, markets, conservation areas or processing facilities",
  logistics: "warehouses, depots, vehicles, ports, stores or planning offices",
  public: "government offices, courts, communities, emergency services or regulated environments",
  creative: "studios, agencies, media teams, events, freelance settings or client projects",
  people: "service teams, sales teams, communities, offices, contact centres or client sites",
  hospitality: "hotels, restaurants, events, tourist sites, lodges, airports or service venues",
  engineering: "sites, plants, design offices, factories, labs, mines or energy projects",
  entrepreneur: "homes, townships, local markets, online channels, streets, customer sites or small premises",
  science: "labs, field sites, research organisations, universities, industry or public agencies",
};

const HIGH_STRESS_KINDS = new Set(["care", "public", "hospitality", "engineering"]);
const VARIABLE_STRESS_KINDS = new Set(["creative", "entrepreneur", "agri"]);
const REMOTE_FRIENDLY_KINDS = new Set(["tech", "creative", "finance"]);
const PART_REMOTE_KINDS = new Set(["people", "public", "education", "science"]);

// Structured lifestyle profile per kind (0-100). This is the source of truth for
// the lifestyle sliders instead of keyword-parsing prose strings. Values are
// starter-tier structural estimates (confidence < 70) and must not be treated as
// verified facts about any individual role.
const LIFESTYLE_PROFILES = {
  tech:         { earnings: 80, travel: 25, stress: 50, danger: 20 },
  finance:      { earnings: 75, travel: 20, stress: 60, danger: 15 },
  practical:    { earnings: 60, travel: 75, stress: 60, danger: 70 },
  care:         { earnings: 55, travel: 50, stress: 82, danger: 55 },
  education:    { earnings: 60, travel: 30, stress: 60, danger: 20 },
  agri:         { earnings: 55, travel: 80, stress: 66, danger: 70 },
  logistics:    { earnings: 60, travel: 80, stress: 60, danger: 65 },
  public:       { earnings: 60, travel: 50, stress: 82, danger: 55 },
  creative:     { earnings: 55, travel: 40, stress: 66, danger: 20 },
  people:       { earnings: 50, travel: 45, stress: 60, danger: 20 },
  hospitality:  { earnings: 45, travel: 45, stress: 82, danger: 30 },
  engineering:  { earnings: 75, travel: 75, stress: 82, danger: 75 },
  entrepreneur: { earnings: 70, travel: 65, stress: 66, danger: 50 },
  science:      { earnings: 65, travel: 45, stress: 60, danger: 40 },
};

const CANONICAL_IDS = {
  "Data Analyst": "data-analyst",
  "Software Developer": "software-developer",
  "Junior Accountant": "finance-accounting",
  Electrician: "technical-artisan",
  Nurse: "healthcare-professional",
};

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makePathways(title, profile) {
  return ROUTE_PRESETS[profile].map((type) => ({
    type,
    label: `${PATHWAY_LABELS[type]} for ${title.toLowerCase()}`,
    timeToEntry: PATHWAY_TIME[type],
    confidence: ["university", "tvet", "learnership"].includes(type) ? 45 : 50,
  }));
}

function makeRoute(title, stream, kind, profile, ofoCode) {
  const tools = TOOL_PRESETS[kind];
  const [earningLabel, earningExplanation] = EARNING_PRESETS[kind];
  const remote = REMOTE_FRIENDLY_KINDS.has(kind)
    ? "Often possible for parts of the work once trust and systems access are in place."
    : PART_REMOTE_KINDS.has(kind)
      ? "Sometimes possible for planning or admin tasks, but much of the work is in-person."
      : "Usually limited because the work depends on people, places, equipment or physical service.";
  const stress = HIGH_STRESS_KINDS.has(kind)
    ? "High at times. Pressure rises when safety, deadlines, customers or public responsibility are involved."
    : VARIABLE_STRESS_KINDS.has(kind)
      ? "Variable. Some weeks are calm, while busy periods can be demanding."
      : "Medium. Pressure rises when deadlines, people, quality or unclear information come together.";

  const starterNote = "Starter profile — source-verified details for South Africa are still being added. Compare this route with alternatives before making subject or study choices.";

  return {
    id: CANONICAL_IDS[title] ?? slugify(title),
    title,
    stream,
    cluster: stream,
    ofoCode: ofoCode ?? null,
    signalWeights: SIGNAL_PRESETS[kind],
    summary: starterNote,
    day: starterNote,
    tools: "Tool examples are not yet source-verified for this route.",
    environment: ENVIRONMENT_PRESETS[kind],
    stress,
    remote,
    growth: starterNote,
    worst: "Challenges are not yet source-verified for this route.",
    best: "Rewards are not yet source-verified for this route.",
    earningPotential: {
      status: "editorial-insight",
      label: earningLabel,
      explanation: `Careerize does not show salary figures here. The useful learner insight is that ${earningExplanation} Salary figures, APS scores and employer demand must not be treated as verified for this profile until an evidence record is attached.`,
    },
    dayInLife: [starterNote],
    keyTasks: ["Verify source-verified tasks during research for this route."],
    toolExamples: tools,
    workEnvironment: [REMOTE_FRIENDLY_KINDS.has(kind) ? "hybrid-or-remote-possible" : "mostly-in-person", "SA-context-starter"],
    lifestyleProfile: LIFESTYLE_PROFILES[kind] ?? { earnings: 50, travel: 50, stress: 50, danger: 40 },
    subjects: SUBJECT_PRESETS[kind],
    qualifications: [
      "Subject and qualification requirements still need source verification per institution and role level.",
      "Relevant certificate, diploma, degree, learnership, apprenticeship, short course or workplace route depending on the role level — verify entry rules directly with providers.",
      "Portfolio, workplace evidence, references or practical projects can matter where formal qualification is not the only entry route.",
    ],
    pathways: makePathways(title, profile),
    misconceptions: [
      "This is a starter profile, not a verified occupational fact sheet.",
      "One qualification route is not the only route. Verify options directly with SAQA, DHET, the relevant SETA, TVET colleges, universities and employers before deciding.",
    ],
    fitWarnings: [
      "This route should be compared with at least two alternatives before making subject or study decisions.",
      "Source-verified South African demand, salary, APS, institution and qualification detail still needs to be added before treating this as final advice.",
    ],
    similarCareerIds: [],
  };
}

const CAREER_GROUPS = MASTER_CAREER_GROUPS.map((g) => [g.stream, g.kind, g.profile, g.titles]);

const generatedRoutes = CAREER_GROUPS.flatMap(([stream, kind, profile, titles]) =>
  titles.map((title) => {
    // Look up OFO code from the master list so related-career matching can use it.
    const master = MASTER_CAREER_LIST.find((m) => m.title === title);
    return makeRoute(title, stream, kind, profile, master?.ofoCode);
  })
).sort((a, b) => a.stream.localeCompare(b.stream) || a.title.localeCompare(b.title));

// Build career-direction index and assign sensible related-career ids using
// OFO-code + keyword + direction clustering (replaces the naive next-two-in-stream
// algorithm that produced nonsensical pairings).
const directionIndex = buildDirectionIndex(generatedRoutes);

export const CAREER_DIRECTIONS = directionIndex;

const routesWithRelated = generatedRoutes.map((route) => ({
  ...baseProfile,
  ...route,
  directionId: directionIndex.find((d) => d.routeIds.includes(route.id))?.id ?? null,
  similarCareerIds: findRelatedCareers(route, generatedRoutes, directionIndex, 4),
}));

export const CAREER_ROUTES = routesWithRelated;

const streamCounts = MASTER_CAREER_GROUPS.reduce((acc, g) => {
  acc[g.stream] = g.careerCount;
  return acc;
}, {});

export const CAREER_COVERAGE_SUMMARY = {
  totalRoutes: MASTER_CAREER_TOTAL,
  country: "ZA",
  status: "expanded-starter-taxonomy",
  salaryPolicy: "qualitative-earning-potential-only",
  proofPolicy: "starter routes are broad exploration profiles; source-verified status requires claim-level evidence before learner-facing demand, salary, APS or provider claims are shown as facts",
  sourceVerifiedProfileCount: 0,
  researchQueueCount: MASTER_CAREER_TOTAL,
  streamCounts,
};

export const DISCOVERY_QUESTIONS = [
  {
    id: "interest",
    label: "What pulls your attention first?",
    options: [
      { value: "building", label: "Building things on a computer or with ideas" },
      { value: "people", label: "Working with people" },
      { value: "numbers", label: "Working with numbers and facts" },
      { value: "handsOn", label: "Fixing or making practical things" },
    ],
  },
  {
    id: "day",
    label: "What type of day would suit you better?",
    options: [
      { value: "remote", label: "Quiet work that can sometimes be done from home" },
      { value: "handsOn", label: "Moving around and doing practical work" },
      { value: "business", label: "Working inside a company with teams" },
      { value: "helping", label: "Helping people directly" },
    ],
  },
  {
    id: "school",
    label: "Which school area do you prefer?",
    options: [
      { value: "science", label: "Science or biology" },
      { value: "numbers", label: "Maths, accounting or business" },
      { value: "technology", label: "Computers and digital tools" },
      { value: "technical", label: "Technical or practical work" },
    ],
  },
  {
    id: "friction",
    label: "What would frustrate you the least?",
    options: [
      { value: "problemSolving", label: "Solving difficult problems" },
      { value: "detail", label: "Checking details carefully" },
      { value: "people", label: "Dealing with different personalities" },
      { value: "practical", label: "Physical work and site visits" },
    ],
  },
];

export const INTEREST_CATEGORIES = [
  { id: "digital-technology", label: "Digital and technology" },
  { id: "creative-building", label: "Creative, engineering and building" },
  { id: "academic-systems", label: "Academic and systems thinking" },
  { id: "health-impact", label: "Health, care and impact" },
  { id: "business-enterprise", label: "Business and enterprise" },
  { id: "communication-influence", label: "Communication and influence" },
  { id: "work-style", label: "Work style and environment" },
];

export const INTEREST_SELECTION_LIMIT = 20;

export const INTEREST_SIGNALS = [
  {
    value: "building",
    label: "Building things",
    icon: "Wrench",
    category: "creative-building",
    skills: ["making", "systems thinking", "iteration"],
    sliderDimensions: ["travel", "danger"],
    why: "Building things connects to routes where ideas, tools or systems turn into usable outputs.",
  },
  {
    value: "people",
    label: "Talking to people",
    icon: "Users",
    category: "communication-influence",
    skills: ["listening", "service", "team communication"],
    sliderDimensions: ["stress", "travel"],
    why: "People-heavy interests connect to work that often involves customers, teams, learners, clients or communities.",
  },
  {
    value: "numbers",
    label: "Working with data",
    icon: "Brain",
    category: "academic-systems",
    skills: ["data literacy", "accuracy", "numeracy"],
    sliderDimensions: ["earnings", "stress"],
    why: "Data and number interests connect to routes that use facts, records and measurement to make decisions.",
  },
  {
    value: "helping",
    label: "Helping people",
    icon: "Heart",
    category: "health-impact",
    skills: ["empathy", "support", "service judgement"],
    sliderDimensions: ["stress"],
    why: "Helping interests connect to routes where progress is measured through support, teaching, care or public service.",
  },
  {
    value: "technology",
    label: "Digital tools",
    icon: "Zap",
    category: "digital-technology",
    skills: ["digital fluency", "tool learning", "systems thinking"],
    sliderDimensions: ["earnings", "travel"],
    why: "Digital interests connect to routes where software, systems or online tools are part of how work gets done.",
  },
  {
    value: "business",
    label: "Business decisions",
    icon: "Briefcase",
    category: "business-enterprise",
    skills: ["commercial judgement", "planning", "decision making"],
    sliderDimensions: ["earnings", "stress"],
    why: "Business interests connect to routes that involve customers, money, operations, planning or growth choices.",
  },
  {
    value: "practical",
    label: "Practical work",
    icon: "Gauge",
    category: "creative-building",
    skills: ["practical judgement", "safety awareness", "manual method"],
    sliderDimensions: ["travel", "danger"],
    why: "Practical interests connect to routes where physical work, site context or visible outcomes matter.",
  },
  {
    value: "detail",
    label: "Detailed checking",
    icon: "Check",
    category: "academic-systems",
    skills: ["accuracy", "checking", "documentation"],
    sliderDimensions: ["stress"],
    why: "Detail interests connect to routes where records, quality, compliance or careful review reduce mistakes.",
  },
  {
    value: "patterns",
    label: "Finding patterns",
    icon: "Brain",
    category: "academic-systems",
    skills: ["analysis", "comparison", "evidence reading"],
    sliderDimensions: ["earnings", "stress"],
    why: "Pattern interests connect to routes that compare information and look for useful signals in complex situations.",
  },
  {
    value: "quiet",
    label: "Quiet focused work",
    icon: "Check",
    category: "work-style",
    skills: ["focus", "independent work", "deep work"],
    sliderDimensions: ["stress", "travel"],
    why: "Quiet-focus interests connect to routes where concentration and independent problem solving can matter.",
  },
  {
    value: "maths",
    label: "Maths thinking",
    icon: "Brain",
    category: "academic-systems",
    skills: ["mathematical reasoning", "abstraction", "proof checking"],
    sliderDimensions: ["earnings", "stress"],
    why: "Maths interests connect to routes that use logic, models, quantities or structured problem solving.",
  },
  {
    value: "structure",
    label: "Structure and rules",
    icon: "Check",
    category: "academic-systems",
    skills: ["process following", "compliance", "organising"],
    sliderDimensions: ["stress", "danger"],
    why: "Structure interests connect to routes where rules, procedures, records or accountability shape the work.",
  },
  {
    value: "accounting",
    label: "Accounting and finance systems",
    icon: "Briefcase",
    category: "business-enterprise",
    skills: ["financial records", "controls", "accuracy"],
    sliderDimensions: ["earnings", "stress"],
    why: "Accounting interests connect to routes that track money, records, risk, controls and business decisions.",
  },
  {
    value: "office",
    label: "Office work",
    icon: "Briefcase",
    category: "work-style",
    skills: ["administration", "digital records", "coordination"],
    sliderDimensions: ["travel", "stress"],
    why: "Office-work interests connect to routes where coordination, records and digital systems support delivery.",
  },
  {
    value: "fixing",
    label: "Fixing problems",
    icon: "Wrench",
    category: "creative-building",
    skills: ["diagnosis", "troubleshooting", "repair thinking"],
    sliderDimensions: ["travel", "danger"],
    why: "Fixing interests connect to routes where people diagnose faults, test options and make things work again.",
  },
  {
    value: "tools",
    label: "Working with tools",
    icon: "Wrench",
    category: "creative-building",
    skills: ["tool handling", "technical safety", "measurement"],
    sliderDimensions: ["travel", "danger"],
    why: "Tool interests connect to routes where equipment, measurement, safety and practical method matter.",
  },
  {
    value: "moving",
    label: "Moving around",
    icon: "Gauge",
    category: "work-style",
    skills: ["situational awareness", "coordination", "stamina"],
    sliderDimensions: ["travel", "danger"],
    why: "Movement interests connect to routes that often involve sites, vehicles, field work, service areas or changing locations.",
  },
  {
    value: "biology",
    label: "Biology and health",
    icon: "Heart",
    category: "health-impact",
    skills: ["scientific observation", "body systems", "care basics"],
    sliderDimensions: ["stress", "danger"],
    why: "Biology interests connect to routes that look at living systems, health, care, environment or evidence.",
  },
  {
    value: "care",
    label: "Caring for people",
    icon: "Heart",
    category: "health-impact",
    skills: ["patient or client support", "records", "calm communication"],
    sliderDimensions: ["stress", "danger"],
    why: "Care interests connect to routes where responsibility, safety, support and human impact are part of the work.",
  },
  {
    value: "highStress",
    label: "Can handle pressure",
    icon: "Gauge",
    category: "work-style",
    skills: ["prioritisation", "calm under pressure", "handover"],
    sliderDimensions: ["stress", "danger"],
    why: "Pressure tolerance connects to routes where deadlines, safety, customers or public responsibility can raise intensity.",
  },
  {
    value: "science",
    label: "Science thinking",
    icon: "Brain",
    category: "academic-systems",
    skills: ["experimentation", "measurement", "evidence"],
    sliderDimensions: ["earnings", "stress"],
    why: "Science interests connect to routes that use evidence, testing, measurement and careful interpretation.",
  },
  {
    value: "technical",
    label: "Technical systems",
    icon: "Wrench",
    category: "creative-building",
    skills: ["technical systems", "measurement", "fault finding"],
    sliderDimensions: ["earnings", "danger"],
    why: "Technical-system interests connect to routes where equipment, infrastructure or specialised processes need judgement.",
  },
  {
    value: "remote",
    label: "Remote-friendly work",
    icon: "Check",
    category: "work-style",
    skills: ["digital communication", "self-management", "online collaboration"],
    sliderDimensions: ["travel", "stress"],
    why: "Remote-friendly interests connect to routes where parts of the work can use digital collaboration and self-management.",
  },
  {
    value: "handsOn",
    label: "Hands-on work",
    icon: "Gauge",
    category: "creative-building",
    skills: ["practical making", "site awareness", "tool confidence"],
    sliderDimensions: ["travel", "danger"],
    why: "Hands-on interests connect to routes where practical skill, safety and real-world conditions shape the day.",
  },
  {
    value: "problemSolving",
    label: "Problem solving",
    icon: "Brain",
    category: "academic-systems",
    skills: ["diagnosis", "logic", "iteration"],
    sliderDimensions: ["earnings", "stress"],
    why: "Problem-solving interests connect to routes where unclear situations need testing, logic and better options.",
  },
];
