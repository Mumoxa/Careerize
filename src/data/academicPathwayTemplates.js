const GRADE_10_BASELINE = [
  "Choose seven NSC subjects: two languages, Mathematics or Mathematical Literacy, Life Orientation and at least three electives.",
  "Before dropping Mathematics, Physical Sciences, Life Sciences, Accounting, CAT, IT or EGD, check whether the career route needs them for Grade 12 admission, APS, TVET, occupational or professional-entry gates.",
  "Treat Grade 10 as the door-keeping year: subjects chosen now shape Grade 12 marks, APS, provider admission, learnership screening and professional-route access.",
];

const VERIFY = {
  status: "template_linked_needs_provider_verification",
  confidence: 45,
  caution: "Planning template only. Exact APS, subject percentages, campus availability, accreditation, registration, workplace, licence, fitness, medical, portfolio, audition and closing-date gates must be verified against the provider, SAQA, DHET, CHE, QCTO, SETA, professional body or vendor source before final advice.",
};

const COMMON_GATES = {
  nscPassType: "route_dependent",
  aps: "varies_by_provider",
  language: "provider_language_requirement_required",
  maths: "route_dependent",
  science: "route_dependent",
  portfolio: "route_dependent",
  professionalRegistration: "route_dependent",
  workplaceLearning: "route_dependent",
  additionalSelection: "route_dependent",
};

function route(type, qualification, gate, duration, outcome) {
  return { type, qualification, gate, duration, outcome };
}

function subjects(requiredOrStronglyRecommended, recommended, avoidDropping, mathsGate, scienceGate) {
  return { requiredOrStronglyRecommended, recommended, avoidDropping, mathsGate, scienceGate };
}

export const STREAM_TO_PATHWAY_TEMPLATE = {
  "Technology, data and AI": { kind: "tech", profile: "mixed" },
  "Finance, admin and business operations": { kind: "finance", profile: "mixed" },
  "Skilled trades, construction and engineering": { kind: "practical", profile: "trade" },
  "Health, care and social services": { kind: "care", profile: "care" },
  "Education, training and youth development": { kind: "education", profile: "education" },
  "Agriculture, food and environment": { kind: "agri", profile: "vocational" },
  "Logistics, transport and supply chain": { kind: "logistics", profile: "logistics" },
  "Law, public service and public safety": { kind: "public", profile: "public" },
  "Creative, media and design": { kind: "creative", profile: "portfolio" },
  "Sales, marketing and customer work": { kind: "people", profile: "mixed" },
  "Hospitality, tourism, sport and events": { kind: "hospitality", profile: "hospitality" },
  "Manufacturing, mining and energy": { kind: "engineering", profile: "trade" },
  "Informal, entrepreneurship and community economy": { kind: "entrepreneur", profile: "entrepreneur" },
  "Science, research and frontier careers": { kind: "science", profile: "science" },
  "Arts, culture, heritage and society": { kind: "creative", profile: "portfolio" },
};

export const PATHWAY_TEMPLATE_PRESETS = {
  tech: {
    academicRequirementRoute: "Digital route. Keep Mathematics for Computer Science, Data Science, Informatics, analytics-heavy, engineering-adjacent and AI routes. IT support, cloud, vendor and portfolio routes can be more flexible but still need strong computer literacy.",
    grade10Subjects: subjects(["Mathematics"], ["Information Technology", "Computer Applications Technology", "Physical Sciences", "Business Studies"], ["Mathematics"], "Mathematics strongly preferred and often required for degree routes. Mathematical Literacy may still allow some certificates, diplomas or vendor routes but can close many degree doors.", "Physical Sciences useful for engineering-adjacent routes; not always required for software or IT support."),
    grade12ExitTarget: "Bachelor admission for BSc/BCom/BIT routes; Diploma or Higher Certificate admission for UoT/private ICT routes; vendor certificates can supplement but do not replace accredited study where required.",
    qualificationRoutes: [route("university", "BSc Computer Science / BSc Data Science / BCom Informatics / BIT / related degree", "Bachelor pass plus provider-specific Mathematics/APS", "3-4 years", "graduate developer, analyst, data, AI or systems route"), route("diploma", "Diploma or Advanced Diploma in ICT / software / network / applications", "Diploma admission plus provider gates", "3 years plus possible advanced diploma", "junior developer, network technician or systems support"), route("higher_certificate", "Higher Certificate in IT / systems support / computing", "Higher Certificate admission plus provider gates", "1 year", "IT support or progression route"), route("vendor_certificate", "CompTIA, Cisco, Microsoft, AWS, Google Cloud, Linux, Oracle, SAP or Salesforce route", "Vendor readiness; training provider rules vary", "1-12 months", "support, cloud, admin or platform role"), route("portfolio", "Projects, GitHub/work samples, hackathon or practical build evidence", "Proof quality gate", "ongoing", "entry-level digital proof")],
    firstWorkEntry: ["intern", "junior developer", "IT support technician", "data analyst assistant", "QA tester"],
  },
  finance: {
    academicRequirementRoute: "Commerce route. Keep Mathematics and Accounting for accounting, actuarial, finance, risk and quantitative banking. Mathematical Literacy can support admin/bookkeeping routes but may limit professional and quantitative degree routes.",
    grade10Subjects: subjects(["Mathematics", "Accounting"], ["Business Studies", "Economics", "Computer Applications Technology"], ["Mathematics", "Accounting"], "Mathematics strongly recommended and often required for BCom Accounting, Actuarial, Finance, Risk and Analytics routes.", "Physical Sciences usually not required."),
    grade12ExitTarget: "Bachelor admission for BCom/professional routes; Diploma or Higher Certificate admission for bookkeeping, office finance, banking, payroll and insurance support.",
    qualificationRoutes: [route("university", "BCom Accounting / Finance / Economics / Risk / Actuarial / Business Science", "Bachelor pass plus provider-specific APS and Mathematics", "3 years", "accounting, finance, banking, risk, audit, tax or analyst route"), route("diploma", "Diploma in Accounting / Financial Management / Banking / Public Finance / Auditing", "Diploma admission plus provider rules", "2-3 years", "accounts clerk or trainee finance route"), route("higher_certificate", "Higher Certificate in Accounting / Business / Banking / Bookkeeping", "Higher Certificate admission", "1 year", "bookkeeper or finance admin entry"), route("professional_body", "SAICA / SAIPA / CIMA / ACCA / ICB / tax or financial planning pathway", "Professional body and provider-specific rules", "1-7 years", "professional accountant, tax, finance or advisory route"), route("learnership", "Banking, insurance, bookkeeping, payroll or business administration learnership", "Employer/SETA screening", "12-24 months", "entry-level banking, insurance, accounts or office finance")],
    firstWorkEntry: ["accounts clerk", "bookkeeper", "finance intern", "banking consultant", "claims assistant"],
  },
  practical: {
    academicRequirementRoute: "Trade and technical route. Keep Mathematics or Technical Mathematics, Physical Sciences or Technical Sciences and EGD/technical subjects where possible. Plan for TVET, NATED, occupational certificate, apprenticeship and possible trade-test gates.",
    grade10Subjects: subjects(["Mathematics or Technical Mathematics", "Physical Sciences or Technical Sciences"], ["Engineering Graphics and Design", "Mechanical Technology", "Electrical Technology", "Civil Technology", "Computer Applications Technology"], ["Mathematics or Technical Mathematics"], "Dropping all maths makes engineering and many technical routes harder.", "Physical Sciences or Technical Sciences strongly supports electrical, mechanical, civil, process and energy routes."),
    grade12ExitTarget: "Grade 12, NCV Level 4, NATED theory or employer apprenticeship entry depending on trade/provider.",
    qualificationRoutes: [route("tvet", "NCV Engineering / Electrical Infrastructure / Civil Construction or related route", "Grade 9 entry for NCV; progression through levels", "3 years to Level 4", "artisan assistant or NATED/apprenticeship progression"), route("nated", "N1-N6 engineering or technical studies", "Provider-specific Grade 10-12/N-level entry", "trimester/semester blocks", "technician or artisan theory route"), route("occupational_certificate", "QCTO occupational certificate", "Provider/workplace practical components", "1-4 years", "occupationally competent worker"), route("apprenticeship", "Apprenticeship plus workplace logbook", "Employer screening and workplace placement", "2-4 years", "trade-test candidate"), route("trade_test", "Trade test where applicable", "Prescribed theory and workplace evidence", "after workplace period", "qualified artisan where designated")],
    firstWorkEntry: ["apprentice", "artisan assistant", "workshop assistant", "maintenance assistant", "site assistant"],
  },
  care: {
    academicRequirementRoute: "Health and care route. Keep Life Sciences, Mathematics and Physical Sciences where aiming at medicine, pharmacy, radiography, emergency care, veterinary or science-heavy routes. Care-support routes can have different certificate/diploma gates.",
    grade10Subjects: subjects(["Life Sciences", "Mathematics"], ["Physical Sciences", "Computer Applications Technology", "English"], ["Life Sciences", "Mathematics", "Physical Sciences where clinical/science routes are possible"], "Mathematics matters for many university health routes; requirements vary strongly.", "Life Sciences and Physical Sciences are often important; exact rules vary by programme."),
    grade12ExitTarget: "Bachelor admission and strong marks for competitive clinical degrees; certificates/diplomas can support care, community health, support and administration routes.",
    qualificationRoutes: [route("university", "Nursing / Social Work / Public Health / Pharmacy / Radiography / Emergency Care / related health degree", "Bachelor pass plus provider-specific APS, subject and selection gates", "3-6 years", "professional or regulated health/care route"), route("diploma", "Nursing, emergency care, health support, veterinary or applied health diploma", "Diploma admission plus provider selection", "2-3 years", "health support or professional progression"), route("higher_certificate", "Care, community health, counselling support or health admin certificate", "Higher Certificate admission", "1 year", "care support or progression"), route("learnership", "Community health, care work, pharmacy support, social auxiliary or health admin learnership", "Employer/provider screening", "12-24 months", "assistant/support role"), route("registration", "Professional or statutory registration where required", "Approved qualification plus practical/service requirements", "after qualification", "licensed or registered practice where applicable")],
    firstWorkEntry: ["care worker", "health administrator", "community health worker", "assistant trainee", "student pathway"],
  },
  education: {
    academicRequirementRoute: "Education route. Keep strong languages and subjects linked to the phase/subject you may teach. Mathematics and Physical Sciences are critical for maths, science and technology teaching.",
    grade10Subjects: subjects(["English or language of learning and teaching"], ["Mathematics", "Life Sciences", "History", "Geography", "Physical Sciences", "Computer Applications Technology"], ["Mathematics and Physical Sciences if STEM teaching is possible"], "STEM teaching needs subject depth.", "Science subjects matter for science-teaching routes."),
    grade12ExitTarget: "Bachelor admission for BEd routes; Diploma/Higher Certificate/occupational routes support ECD, education assistance or progression.",
    qualificationRoutes: [route("university", "Bachelor of Education by phase", "Bachelor pass plus provider-specific APS and subject gates", "4 years", "teacher route"), route("postgraduate", "PGCE after suitable degree", "Completed degree plus teaching-subject credits", "1 year", "teacher route for graduates"), route("higher_certificate", "Higher Certificate in Education / ECD / education support", "Higher Certificate admission", "1 year", "education assistant or progression"), route("occupational_certificate", "ECD practitioner or learning support occupational route", "Provider/workplace practical components", "1-3 years", "ECD or learning support"), route("workplace", "Tutor, assistant, volunteer or youth-programme evidence", "Safeguarding/provider screening where relevant", "ongoing", "proof for education route")],
    firstWorkEntry: ["education assistant", "tutor", "ECD assistant", "student teacher", "training assistant"],
  },
  agri: {
    academicRequirementRoute: "Agriculture/environment route. Keep Agricultural Sciences, Life Sciences, Geography and Mathematics where possible. Science-heavy routes need maths/science; practical farming routes can enter through TVET/workplace learning.",
    grade10Subjects: subjects(["Agricultural Sciences or Life Sciences"], ["Mathematics", "Geography", "Business Studies", "Physical Sciences"], ["Mathematics and Life Sciences if science/food/environment route is possible"], "Mathematics supports agricultural science, food technology, environmental science, GIS and business planning.", "Life Sciences/Physical Sciences support biology, food, environmental and conservation routes."),
    grade12ExitTarget: "Bachelor admission for BSc/agriculture/environmental science; TVET/NCV/NATED/occupational routes support practical farming, food and conservation.",
    qualificationRoutes: [route("university", "BSc Agriculture / Environmental Science / Food Science / Conservation / Geography route", "Bachelor pass plus provider-specific maths/science gates", "3-4 years", "scientific, advisory or professional route"), route("diploma", "Diploma in Agriculture / Nature Conservation / Food Technology / Environmental Management", "Diploma admission plus provider rules", "2-3 years", "technician/officer/farm management"), route("tvet", "NCV Primary Agriculture or occupational farming/food route", "Grade 9/12 depending route", "1-3 years", "practical farming or food-production"), route("learnership", "Agriculture, conservation, food production or environmental learnership", "Employer/SETA screening", "12-24 months", "field or production assistant"), route("workplace", "Farm, nursery, conservation, food-processing or field work evidence", "Employer/site requirements", "ongoing", "practical proof")],
    firstWorkEntry: ["farm assistant", "conservation assistant", "food production assistant", "lab assistant", "fieldworker"],
  },
  logistics: {
    academicRequirementRoute: "Logistics route. Business Studies, Geography, Mathematics and CAT are useful. Some transport routes add licence, medical, workplace clearance or industry-specific gates.",
    grade10Subjects: subjects(["English"], ["Business Studies", "Geography", "Mathematics", "Computer Applications Technology", "Economics"], ["Mathematics if analytics, planning or degree route is possible"], "Mathematics helps supply-chain analytics, planning and commerce degrees; Mathematical Literacy can support operational routes.", "Science usually not required except technical, cold-chain, aviation/maritime or engineering-adjacent routes."),
    grade12ExitTarget: "Diploma, Higher Certificate, TVET or learnership for operational entry; Bachelor's route for management, analytics and planning.",
    qualificationRoutes: [route("university", "BCom / BBA / Supply Chain / Logistics / Transport Management", "Bachelor pass plus provider-specific APS", "3 years", "planner, analyst, coordinator or manager route"), route("diploma", "Diploma in Logistics / Supply Chain / Transport / Operations", "Diploma admission", "2-3 years", "logistics coordinator, fleet, warehouse or planning"), route("tvet", "Transport, logistics, warehousing, freight or business admin route", "Provider-specific NSC/NCV entry", "1-3 years", "operational entry"), route("learnership", "Freight handling, warehousing, supply chain, road transport or business admin learnership", "Employer/SETA screening", "12-24 months", "warehouse, fleet or transport entry"), route("licence_or_permit", "Role-specific licence/permit/medical where applicable", "Regulatory and employer gates vary", "varies", "regulated transport role")],
    firstWorkEntry: ["warehouse clerk", "fleet assistant", "logistics intern", "inventory clerk", "transport assistant"],
  },
  public: {
    academicRequirementRoute: "Law, public service and safety route. Keep strong languages, History/Business/Geography and Mathematics where possible. Some roles add fitness, background, age, driving licence, citizenship, statutory or professional gates.",
    grade10Subjects: subjects(["English or strong language subject"], ["History", "Business Studies", "Geography", "Mathematics", "Computer Applications Technology"], ["Mathematics where forensics, analytics, finance, disaster management or policy analytics is possible"], "Maths helps policy, investigation analytics, forensics, finance and management routes.", "Science matters for forensic, emergency, environmental or technical safety routes."),
    grade12ExitTarget: "Bachelor admission for law, public administration, criminology, social science or policy; Diploma/learnership/workplace routes for support roles.",
    qualificationRoutes: [route("university", "LLB / BA Law / BCom Law / Public Administration / Criminology / Social Science", "Bachelor pass plus provider APS/language gates", "3-4 years", "law, policy, admin or justice route"), route("diploma", "Diploma in Public Management / Legal Support / Safety / Disaster Management", "Diploma admission", "2-3 years", "public-service or support route"), route("learnership", "Public admin, legal support, safety or emergency-service learnership/academy route", "Employer/state screening and route-specific checks", "12-36 months", "public-service entry"), route("professional_registration", "Admission or statutory registration where applicable", "Degree plus practical/statutory requirements", "after degree", "regulated professional practice"), route("workplace", "Clerk, admin, community, court, legal support or public-service assistant route", "Employer/statutory requirements", "ongoing", "experience and progression proof")],
    firstWorkEntry: ["court clerk", "legal secretary", "public admin clerk", "community worker", "candidate route"],
  },
  creative: {
    academicRequirementRoute: "Creative/portfolio route. Keep languages and creative subjects where possible. Portfolio evidence, auditions or practical work may matter as much as marks for many design, media, arts and culture routes.",
    grade10Subjects: subjects(["English or strong language subject"], ["Visual Arts", "Design", "Dramatic Arts", "Computer Applications Technology", "History"], ["Creative subject if portfolio route is likely"], "Maths helps UX, animation tech, architecture-adjacent design, production budgeting and digital tools.", "Science usually not required unless the route overlaps with technical production, architecture, product design, gaming or digital systems."),
    grade12ExitTarget: "Bachelor/Diploma/Higher Certificate admission depends on provider; portfolio, audition or creative task may be required.",
    qualificationRoutes: [route("university", "BA / BFA / Design / Film / Media / Journalism / Communication / Heritage route", "Bachelor pass plus provider APS and portfolio/audition where required", "3-4 years", "creative, media, culture or communication route"), route("diploma", "Diploma in Design / Film / Media / Photography / Sound / Fashion / Interior / Journalism", "Diploma admission plus portfolio/provider gate", "2-3 years", "junior creative or production role"), route("higher_certificate", "Higher Certificate in design, media, digital content or communication", "Higher Certificate admission", "1 year", "assistant/portfolio progression"), route("portfolio", "Portfolio, showreel, writing samples, demo reel or published work", "Quality and relevance gate", "ongoing", "creative-entry proof"), route("shortcourse", "Tool-specific software/camera/editing/design/production course", "Provider rules", "1-12 months", "skill proof")],
    firstWorkEntry: ["design intern", "junior content creator", "production assistant", "studio assistant", "portfolio freelancer"],
  },
  people: {
    academicRequirementRoute: "Sales, marketing and customer route. Business Studies, Economics, languages, CAT and Mathematics help. Entry can come through degrees, diplomas, certificates, learnerships, vendor tool certificates or workplace proof.",
    grade10Subjects: subjects(["English or strong language subject"], ["Business Studies", "Economics", "Computer Applications Technology", "Mathematics", "Accounting"], ["Mathematics if marketing analytics, ecommerce, finance sales or management route is possible"], "Maths helps analytics, ecommerce, category management, finance sales and business degrees; Mathematical Literacy supports many frontline routes.", "Science usually not required."),
    grade12ExitTarget: "Higher Certificate, Diploma or Bachelor's routes are common; workplace evidence of communication/results can matter strongly.",
    qualificationRoutes: [route("university", "BCom Marketing / Communication / Business / HR / Psychology / Management", "Bachelor pass plus provider APS", "3 years", "marketing, sales, client, HR or management route"), route("diploma", "Diploma in Marketing / PR / Business / Retail / Real Estate / HR", "Diploma admission", "2-3 years", "junior marketing, sales, HR or client role"), route("higher_certificate", "Higher Certificate in Marketing / Business / Sales / Customer Service / HR", "Higher Certificate admission", "1 year", "entry-level service/business role"), route("learnership", "Sales, contact centre, retail, marketing, business admin or insurance learnership", "Employer/SETA screening", "12-24 months", "frontline or trainee role"), route("vendor_certificate", "CRM, analytics, ecommerce, Google, Meta, HubSpot, Salesforce or marketing platform certificate", "Tool readiness", "1-6 months", "tool-assisted entry")],
    firstWorkEntry: ["sales assistant", "call centre agent", "marketing assistant", "customer success assistant", "recruitment trainee"],
  },
  hospitality: {
    academicRequirementRoute: "Hospitality, tourism, sport and events route. Tourism, Hospitality Studies, Consumer Studies, Business Studies and languages help. Some aviation, maritime, sport or safety routes add medical, licence, fitness or regulatory gates.",
    grade10Subjects: subjects(["English or strong language subject"], ["Tourism", "Hospitality Studies", "Consumer Studies", "Business Studies", "Life Sciences"], ["Mathematics if management, aviation, tourism analytics or business route is possible"], "Mathematics/Mathematical Literacy can both support many service routes; Mathematics helps management and analytics.", "Science usually not required except food science, aviation, sport science, safety or health-adjacent routes."),
    grade12ExitTarget: "TVET, Diploma, Higher Certificate, learnership and workplace routes are common; some routes add extra checks.",
    qualificationRoutes: [route("diploma", "Diploma in Hospitality / Tourism / Culinary / Events / Sport Management", "Diploma admission plus provider rules", "2-3 years", "supervisor, coordinator or management route"), route("tvet", "NCV Hospitality / Tourism or NATED hospitality/business route", "Grade 9/12 depending route", "1-3 years", "frontline or practical entry"), route("learnership", "Hospitality, food service, travel, events, sport or customer-service learnership", "Employer/SETA screening", "12-24 months", "frontline trainee"), route("additional_gate", "Role-specific medical, fitness, licence, travel or regulatory gate where applicable", "Route-specific", "varies", "regulated or employer-screened service route"), route("workplace", "Frontline service, kitchen, event, lodge, guesthouse or sport facility entry", "Employer screening and practical proof", "ongoing", "experience-based growth")],
    firstWorkEntry: ["waiter", "receptionist", "barista", "tourism assistant", "event assistant"],
  },
  engineering: {
    academicRequirementRoute: "Engineering, manufacturing, mining and energy route. Keep Mathematics, Physical Sciences/Technical Sciences and EGD/technical subjects. Routes can be degree, diploma, NATED, occupational, apprenticeship or workplace-based.",
    grade10Subjects: subjects(["Mathematics or Technical Mathematics", "Physical Sciences or Technical Sciences"], ["Engineering Graphics and Design", "Information Technology", "Mechanical/Electrical/Civil Technology"], ["Mathematics", "Physical Sciences"], "Engineering degrees generally need Mathematics; technical college/trade routes may accept technical equivalents but still need maths confidence.", "Physical Sciences/Technical Sciences is a major gate for engineering, manufacturing, mining, process and energy routes."),
    grade12ExitTarget: "Bachelor admission for BEng/BScEng; Diploma admission for UoT technician routes; TVET/NATED/occupational routes for artisan and plant roles.",
    qualificationRoutes: [route("university", "BEng / BScEng / Industrial / Mining / Energy-related degree", "Bachelor pass plus high provider-specific Maths/Science gates", "4 years", "engineer or specialist route"), route("diploma", "Diploma / Advanced Diploma in Engineering Technology / Operations / Mining / Process / Energy", "Diploma admission plus maths/science gate", "3 years plus possible advanced diploma", "technician or supervisor route"), route("tvet", "NATED, NCV or occupational route in engineering/manufacturing/mining/energy", "Grade 9-12/NCV/N-level depending provider", "1-3 years", "operator, artisan or technician progression"), route("apprenticeship", "Apprenticeship, workplace learning and trade test where applicable", "Employer/provider entry plus workplace logbook", "2-4 years", "qualified artisan or technician route"), route("workplace", "Operator, production, quality, maintenance or site assistant entry", "Employer/site/safety requirements", "ongoing", "operations proof")],
    firstWorkEntry: ["production operator", "maintenance assistant", "technician trainee", "quality inspector", "process assistant"],
  },
  entrepreneur: {
    academicRequirementRoute: "Entrepreneurship route. No single academic route fits all. Business Studies, Accounting, CAT, languages and practical proof help. Keep doors open while building small, safe business experiments.",
    grade10Subjects: subjects(["English or strong language subject"], ["Business Studies", "Accounting", "Computer Applications Technology", "Mathematics or Mathematical Literacy", "Economics"], ["Accounting or Business Studies if business ownership is likely"], "Numeracy is essential for pricing, stock, cash flow and growth.", "Science usually not required unless the business is technical, food, agriculture, energy, health or manufacturing related."),
    grade12ExitTarget: "Matric plus practical proof, certificates, short courses, learnerships or small business experience can support the route.",
    qualificationRoutes: [route("higher_certificate", "Higher Certificate in Business / Entrepreneurship / Small Business Management", "Higher Certificate admission", "1 year", "business foundation"), route("shortcourse", "Small business, bookkeeping, digital marketing, ecommerce, costing or operations", "Provider rules", "1-12 months", "focused skill proof"), route("learnership", "Business administration, wholesale/retail, services, entrepreneurship or digital assistant learnership", "Employer/SETA screening", "12-24 months", "structured workplace learning"), route("workplace", "Small project, family business support, market, digital service or community proof", "Legal/safety/age constraints apply", "ongoing", "practical proof"), route("support", "Mentor, incubator, municipal, NGO or enterprise-development support", "Programme gate", "varies", "support network")],
    firstWorkEntry: ["business assistant", "shop assistant", "digital assistant", "market seller", "operations helper"],
  },
  science: {
    academicRequirementRoute: "Science/research route. Keep Mathematics, Physical Sciences and Life Sciences where possible. Many routes require a BSc, diploma or postgraduate study before specialist work opens.",
    grade10Subjects: subjects(["Mathematics", "Physical Sciences", "Life Sciences"], ["Geography", "Information Technology", "Agricultural Sciences"], ["Mathematics", "Physical Sciences", "Life Sciences"], "Mathematics is a major gate for BSc, statistics, chemistry, physics, geology, bioinformatics and research routes.", "Physical Sciences and/or Life Sciences are major gates for science routes."),
    grade12ExitTarget: "Bachelor admission and strong maths/science marks for BSc; diplomas can support laboratory, environmental and technician routes.",
    qualificationRoutes: [route("university", "BSc in Chemistry, Physics, Biology, Microbiology, Biotechnology, Geology, Environmental Science, Statistics or Bioinformatics", "Bachelor pass plus Maths/Science gates", "3 years plus possible honours", "research, lab, analyst or specialist route"), route("postgraduate", "Honours, postgraduate diploma, master's or PhD where specialist research is required", "Completed degree plus selection/research gate", "1-6 years after degree", "scientist, researcher or specialist analyst"), route("diploma", "Diploma in Laboratory, Environmental, Food, Chemical, Marine, Water or applied science", "Diploma admission plus provider maths/science rules", "2-3 years", "technician or assistant scientist"), route("workplace", "Lab assistant, field assistant, research assistant or data assistant experience", "Employer/safety gate", "ongoing", "practical research proof"), route("shortcourse", "Data, lab safety, GIS, coding, instrumentation or quality systems course", "Provider entry", "1-12 months", "supporting skill proof")],
    firstWorkEntry: ["lab assistant", "research assistant", "fieldworker", "quality assistant", "data assistant"],
  },
};

const TRADE_HINTS = ["electrician", "plumber", "boilermaker", "welder", "fitter", "millwright", "mechanic", "technician", "machinist", "toolmaker", "bricklayer", "carpenter", "installer"];
const REGULATED_HINTS = ["nurse", "teacher", "attorney", "pharmacy", "paramedic", "social worker", "veterinary", "real estate"];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isTradeLike(title, profile) {
  return profile === "trade" || TRADE_HINTS.some((hint) => title.toLowerCase().includes(hint));
}

function isRegulatedLike(title, kind) {
  return ["care", "education", "public"].includes(kind) || REGULATED_HINTS.some((hint) => title.toLowerCase().includes(hint));
}

function timeline(title, plan, profile) {
  const workLine = isTradeLike(title, profile)
    ? "After Grade 12/NCV/NATED: secure workplace learning, complete the required theory/practical evidence and verify whether trade-test or occupational assessment applies."
    : "After Grade 12: apply to the most suitable qualification route and build proof through projects, volunteering, vacation work, internships or assistant roles.";

  return [
    "Grade 10: choose subjects that keep the route open; confirm whether Mathematics, Physical Sciences, Life Sciences, Accounting, CAT, IT, EGD or portfolio subjects matter.",
    "Grade 11: track marks against likely APS and subject gates; compare university, UoT, TVET, private, occupational, professional-body, vendor and workplace routes.",
    "Grade 12: apply early and verify accreditation, APS, subject percentages, portfolio/audition/fitness/licence/registration gates before accepting an offer.",
    workLine,
    `First work step: target ${plan.firstWorkEntry.slice(0, 3).join(", ")} or a related entry role while continuing verified study or workplace learning.`,
  ];
}

export function getAcademicPathwayPlan({ title, stream, kind, profile }) {
  const mapped = STREAM_TO_PATHWAY_TEMPLATE[stream] ?? {};
  const resolvedKind = kind ?? mapped.kind ?? "people";
  const resolvedProfile = profile ?? mapped.profile ?? "mixed";
  const plan = PATHWAY_TEMPLATE_PRESETS[resolvedKind] ?? PATHWAY_TEMPLATE_PRESETS.people;
  const tradeRoute = isTradeLike(title, resolvedProfile);
  const regulatedRoute = isRegulatedLike(title, resolvedKind);

  return {
    pathwayPlanId: `${slugify(title)}-za-academic-pathway-v1`,
    linkedCareerTitle: title,
    linkedStream: stream,
    templateKind: resolvedKind,
    templateProfile: resolvedProfile,
    academicRequirementRoute: tradeRoute
      ? `${plan.academicRequirementRoute} Verify whether this specific career is a designated trade, QCTO occupational route, NATED route or apprenticeship route.`
      : plan.academicRequirementRoute,
    grade10StartingPoint: GRADE_10_BASELINE,
    grade10Subjects: plan.grade10Subjects,
    grade12ExitTarget: plan.grade12ExitTarget,
    intakeGates: {
      ...COMMON_GATES,
      maths: plan.grade10Subjects.mathsGate,
      science: plan.grade10Subjects.scienceGate,
      tradeTest: tradeRoute ? "may_be_required_for_designated_trade" : "not_usually_required",
      professionalRegistration: regulatedRoute ? "may_be_required_or_statutory_body_route_must_be_checked" : "not_usually_required",
    },
    qualificationRoutes: plan.qualificationRoutes,
    firstWorkEntry: plan.firstWorkEntry,
    fromGrade10ToWork: timeline(title, plan, resolvedProfile),
    tradeRouteFlag: tradeRoute,
    regulatedOrProfessionalRoute: regulatedRoute,
    verification: VERIFY,
  };
}

export const ACADEMIC_PATHWAY_TEMPLATE_SUMMARY = {
  totalStreamTemplates: Object.keys(STREAM_TO_PATHWAY_TEMPLATE).length,
  totalKindTemplates: Object.keys(PATHWAY_TEMPLATE_PRESETS).length,
  verificationStatus: VERIFY.status,
  rule: "Every career route receives one academic pathway plan. Exact provider entry criteria remain marked for verification until sourced from official providers/bodies.",
};
