// South African study-path backbone for Careerize.
//
// This module links Grade 10 subject choices -> National Senior Certificate (NSC)
// admission levels -> NQF/HEQSF qualification types and common named degrees ->
// postgraduate progression -> the career fields used by the catalog.
//
// Scope and honesty rule:
// South Africa registers tens of thousands of qualifications across NQF levels 1-10.
// This file does NOT enumerate every institution programme. It encodes the parts that
// are stable, public policy (the NSC subject framework, statutory minimum admission
// requirements, the HEQSF qualification types and NQF levels) plus a verified set of
// common degrees, and links every career field to its real study path. Specific
// institution programmes, exact APS cut-offs and current-year details must always be
// confirmed with the institution. Every claim here carries a source id and a coverage
// status so the UI can show what is framework-level versus institution-specific.

export const STUDY_SOURCE_REGISTRY = [
  {
    id: "sa-nsc-caps",
    title: "DBE National Senior Certificate subjects and CAPS",
    type: "government-policy",
    url: "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx",
    accessedAt: "2026-06-18",
    confidence: 65,
    supports: ["nscSubjects", "subjectChoiceRules"],
    note: "Department of Basic Education subject framework for the NSC. Subject availability still varies by school.",
  },
  {
    id: "sa-min-admission",
    title: "Minimum admission requirements for Higher Certificate, Diploma and Bachelor's Degree study",
    type: "government-policy",
    url: "https://www.usaf.ac.za",
    accessedAt: "2026-06-18",
    confidence: 60,
    supports: ["admissionLevels", "designatedSubjects", "apsScale"],
    note: "Statutory minimum requirements published in the Government Gazette and summarised by Universities South Africa. Institutions and programmes set higher requirements, APS thresholds and admission tests.",
  },
  {
    id: "sa-heqsf",
    title: "DHET Higher Education Qualifications Sub-Framework (HEQSF)",
    type: "government-policy",
    url: "https://www.dhet.gov.za",
    accessedAt: "2026-06-18",
    confidence: 68,
    supports: ["qualificationTypes", "nqfLevels", "progression"],
    note: "Defines higher education qualification types, NQF levels and credit values.",
  },
  {
    id: "sa-saqa-nqf",
    title: "SAQA National Qualifications Framework",
    type: "government-policy",
    url: "https://www.saqa.org.za",
    accessedAt: "2026-06-18",
    confidence: 68,
    supports: ["nqfLevels", "qualificationTypes"],
    note: "Authority for NQF levels 1-10 and registered qualifications.",
  },
  {
    id: "sa-qcto-trades",
    title: "QCTO occupational qualifications and trade tests",
    type: "government-policy",
    url: "https://www.qcto.org.za",
    accessedAt: "2026-06-18",
    confidence: 56,
    supports: ["qualificationTypes", "occupationalRoutes", "registration"],
    note: "Occupational certificates, learnerships, apprenticeships and artisan trade tests. Specific occupational qualifications and accredited providers vary.",
  },
  {
    id: "careerize-study-framework",
    title: "Careerize subject-to-qualification-to-career mapping methodology",
    type: "methodology",
    url: "docs/CAREER_COVERAGE_MANIFEST.md",
    accessedAt: "2026-06-18",
    confidence: 50,
    supports: ["studyFields", "careerLinkage", "coverageStatus"],
    note: "Internal mapping that connects career fields to subjects and qualification routes. Field-level guidance, not an institution eligibility ruling.",
  },
];

// NQF levels 1-10 (SAQA / NQF Act). Bands are simplified for learner-facing display.
export const NQF_LEVELS = [
  { level: 1, band: "GET/FET", label: "Grade 9 / ABET 4 level" },
  { level: 2, band: "FET", label: "Grade 10 / NCV 2 level" },
  { level: 3, band: "FET", label: "Grade 11 / NCV 3 level" },
  { level: 4, band: "FET", label: "Matric (NSC) / NCV 4 level" },
  { level: 5, band: "Higher Education", label: "Higher Certificate level" },
  { level: 6, band: "Higher Education", label: "Diploma / Advanced Certificate level" },
  { level: 7, band: "Higher Education", label: "Bachelor's Degree / Advanced Diploma level" },
  { level: 8, band: "Higher Education", label: "Honours / Postgraduate Diploma / professional degree level" },
  { level: 9, band: "Higher Education", label: "Master's Degree level" },
  { level: 10, band: "Higher Education", label: "Doctoral Degree level" },
];

// Standard 7-point achievement scale used to convert NSC percentages.
// Many universities use this for the Admission Point Score (APS); some (for example
// UCT, Wits and UP) use their own scales, so this is indicative only.
export const APS_SCALE = {
  note: "Most universities build an Admission Point Score (APS) from your best six subjects, usually excluding Life Orientation. Some institutions use their own scale, so always confirm how a specific university counts your marks.",
  sourceIds: ["sa-min-admission"],
  levels: [
    { code: 7, range: "80-100%", label: "Outstanding" },
    { code: 6, range: "70-79%", label: "Meritorious" },
    { code: 5, range: "60-69%", label: "Substantial" },
    { code: 4, range: "50-59%", label: "Adequate" },
    { code: 3, range: "40-49%", label: "Moderate" },
    { code: 2, range: "30-39%", label: "Elementary" },
    { code: 1, range: "0-29%", label: "Not achieved" },
  ],
};

// NSC subject framework. Learners choose subjects at the end of Grade 9 and carry
// them from Grade 10 to Grade 12. A learner takes seven subjects: four compulsory
// plus at least three electives.
export const SUBJECT_CHOICE_RULES = {
  totalSubjects: 7,
  compulsory: [
    "A Home Language",
    "A First Additional Language",
    "Mathematics or Mathematical Literacy",
    "Life Orientation",
  ],
  electiveMinimum: 3,
  decisionGrade: "End of Grade 9 (subjects are taken from Grade 10 to Grade 12)",
  mathsNote:
    "The single most important Grade 10 choice for keeping doors open is Mathematics versus Mathematical Literacy. Many degree programmes (engineering, most sciences, accounting, medicine, actuarial work) require Mathematics. Mathematical Literacy is accepted for many Higher Certificate, Diploma and some degree programmes, but it closes off the maths-heavy degrees.",
  designatedNote:
    "For admission to Bachelor's Degree study, the NSC requires a 50%+ pass in four subjects from the official designated subject list. Subjects such as Computer Applications Technology, Tourism and Hospitality Studies are useful but are not on the designated list.",
  sourceIds: ["sa-nsc-caps", "sa-min-admission"],
};

// `designated` reflects the official designated subject list used for Bachelor's
// Degree admission. `unlocks` lists the career field ids the subject most supports.
export const NSC_SUBJECTS = [
  { id: "home-language", name: "Home Language", category: "language", group: "compulsory", designated: true, note: "One of the 11 official languages, taken at Home Language level.", unlocks: ["education", "public", "creative", "people"] },
  { id: "first-additional-language", name: "First Additional Language", category: "language", group: "compulsory", designated: true, note: "A second official language.", unlocks: ["education", "public", "people", "hospitality"] },
  { id: "mathematics", name: "Mathematics", category: "mathematics", group: "compulsory-choice", designated: true, note: "Keeps the widest range of degrees open, including engineering, science, commerce and health sciences.", unlocks: ["tech", "finance", "engineering", "science", "care"] },
  { id: "mathematical-literacy", name: "Mathematical Literacy", category: "mathematics", group: "compulsory-choice", designated: false, note: "Accepted for many Higher Certificate, Diploma and some degree routes. Many maths-heavy degrees will not accept it, so check before choosing it over Mathematics.", unlocks: ["hospitality", "people", "public", "entrepreneur"] },
  { id: "life-orientation", name: "Life Orientation", category: "compulsory-life", group: "compulsory", designated: false, note: "Compulsory for all learners. Usually excluded from the APS count.", unlocks: [] },

  { id: "physical-sciences", name: "Physical Sciences", category: "science", group: "elective", designated: true, note: "Required or strongly recommended for engineering, medicine, pharmacy and many sciences.", unlocks: ["engineering", "science", "care", "tech"] },
  { id: "life-sciences", name: "Life Sciences", category: "science", group: "elective", designated: true, note: "Important for health, nursing, biological and environmental sciences.", unlocks: ["care", "science", "agri"] },
  { id: "agricultural-sciences", name: "Agricultural Sciences", category: "science", group: "elective", designated: true, note: "Supports agriculture, animal and environmental study routes.", unlocks: ["agri", "science"] },

  { id: "accounting", name: "Accounting", category: "commerce", group: "elective", designated: true, note: "Strong base for accounting, auditing and financial qualifications.", unlocks: ["finance", "people"] },
  { id: "business-studies", name: "Business Studies", category: "commerce", group: "elective", designated: true, note: "Useful for commerce, management and entrepreneurship routes.", unlocks: ["finance", "people", "entrepreneur", "logistics"] },
  { id: "economics", name: "Economics", category: "commerce", group: "elective", designated: true, note: "Supports commerce, economics and policy routes.", unlocks: ["finance", "public", "people"] },

  { id: "geography", name: "Geography", category: "humanities", group: "elective", designated: true, note: "Useful for environmental, planning, logistics and earth-science routes.", unlocks: ["agri", "logistics", "science", "public"] },
  { id: "history", name: "History", category: "humanities", group: "elective", designated: true, note: "Supports law, humanities, education and public-service routes.", unlocks: ["public", "education", "creative"] },
  { id: "religion-studies", name: "Religion Studies", category: "humanities", group: "elective", designated: true, note: "A designated humanities subject.", unlocks: ["education", "public"] },

  { id: "information-technology", name: "Information Technology", category: "technical", group: "elective", designated: true, note: "Programming-focused; a strong base for computing degrees (pair with Mathematics).", unlocks: ["tech", "science"] },
  { id: "engineering-graphics-design", name: "Engineering Graphics and Design", category: "technical", group: "elective", designated: true, note: "Useful for engineering, architecture and built-environment routes.", unlocks: ["engineering", "practical"] },

  { id: "visual-arts", name: "Visual Arts", category: "arts", group: "elective", designated: true, note: "Supports design, fine art and creative routes (often plus a portfolio).", unlocks: ["creative"] },
  { id: "dramatic-arts", name: "Dramatic Arts", category: "arts", group: "elective", designated: true, note: "Supports performance, media and creative routes.", unlocks: ["creative"] },
  { id: "music", name: "Music", category: "arts", group: "elective", designated: true, note: "Supports music, sound and creative routes.", unlocks: ["creative"] },
  { id: "consumer-studies", name: "Consumer Studies", category: "services", group: "elective", designated: true, note: "Supports food, hospitality and consumer-product routes.", unlocks: ["hospitality", "agri"] },

  { id: "computer-applications-technology", name: "Computer Applications Technology", category: "technical", group: "elective", designated: false, note: "Office and end-user computing. Useful for admin and support roles, but not on the designated list and not a substitute for IT or Mathematics for computing degrees.", unlocks: ["finance", "people", "logistics"] },
  { id: "tourism", name: "Tourism", category: "services", group: "elective", designated: false, note: "Useful for tourism and hospitality routes; not on the designated list.", unlocks: ["hospitality", "people"] },
  { id: "hospitality-studies", name: "Hospitality Studies", category: "services", group: "elective", designated: false, note: "Useful for hospitality and food routes; not on the designated list.", unlocks: ["hospitality"] },
  { id: "civil-technology", name: "Civil Technology", category: "technical", group: "elective", designated: false, note: "Practical built-environment base; not on the designated list.", unlocks: ["practical", "engineering"] },
  { id: "mechanical-technology", name: "Mechanical Technology", category: "technical", group: "elective", designated: false, note: "Practical mechanical base; not on the designated list.", unlocks: ["practical", "engineering"] },
  { id: "electrical-technology", name: "Electrical Technology", category: "technical", group: "elective", designated: false, note: "Practical electrical base; not on the designated list.", unlocks: ["practical", "engineering"] },
];

// Statutory minimum NSC admission levels for higher education. Programmes routinely
// require more than these minimums (specific subjects, higher marks, APS and tests).
export const ADMISSION_LEVELS = [
  {
    id: "higher-certificate",
    name: "Higher Certificate pass",
    unlocks: "Higher Certificate study (NQF 5)",
    minRequirement: "NSC with at least 30% in the language of learning and teaching of the institution.",
    explanation: "The most accessible higher-education entry level. A good route to build credits and bridge into a diploma or degree later.",
    sourceIds: ["sa-min-admission"],
  },
  {
    id: "diploma",
    name: "Diploma pass",
    unlocks: "Diploma study (NQF 6)",
    minRequirement: "NSC with at least 40% (achievement level 3) in four recognised NSC subjects, plus 30% in the language of learning and teaching.",
    explanation: "Opens diplomas at universities of technology, TVET colleges and many universities. Strong practical and employment-focused route.",
    sourceIds: ["sa-min-admission"],
  },
  {
    id: "bachelors",
    name: "Bachelor's Degree pass",
    unlocks: "Bachelor's Degree study (NQF 7-8)",
    minRequirement: "NSC with at least 50% (achievement level 4) in four subjects from the official designated subject list, plus 30% in the language of learning and teaching.",
    explanation: "The minimum to be considered for degree study. Competitive programmes (medicine, engineering, actuarial science, law) require much higher marks, specific subjects and an APS well above this minimum.",
    sourceIds: ["sa-min-admission"],
  },
];

// HEQSF higher-education qualification types plus the main TVET and occupational routes.
export const QUALIFICATION_TYPES = [
  {
    id: "ncv",
    name: "National Certificate (Vocational) - NCV",
    nqfLevel: "2-4",
    credits: "120 per level",
    duration: "3 years (NCV 2-4)",
    band: "college-tvet",
    entryRequirement: "Grade 9 or above; offered at TVET colleges.",
    offeredBy: "TVET colleges",
    progressesTo: ["higher-certificate", "diploma"],
    description: "A practical Grade 10-12 alternative taken at a TVET college, combining a vocational field with fundamentals.",
    sourceIds: ["sa-saqa-nqf", "sa-qcto-trades"],
    coverageStatus: "framework",
  },
  {
    id: "nated-n1-n6",
    name: "NATED / Report 191 (N1-N6)",
    nqfLevel: "2-6",
    credits: "varies",
    duration: "N1-N6 in 2-3 years, then 18-24 months workplace experience for the National N Diploma",
    band: "college-tvet",
    entryRequirement: "Grade 9-12 depending on the programme; offered at TVET colleges.",
    offeredBy: "TVET colleges",
    progressesTo: ["diploma", "occupational-certificate"],
    description: "Engineering and business studies in N-levels. N6 plus relevant workplace experience earns a National N Diploma.",
    sourceIds: ["sa-saqa-nqf"],
    coverageStatus: "framework",
  },
  {
    id: "occupational-certificate",
    name: "Occupational Certificate / Trade qualification",
    nqfLevel: "2-6",
    credits: "varies",
    duration: "1-4 years including a learnership or apprenticeship and a trade test",
    band: "occupational",
    entryRequirement: "Varies by trade; often Grade 9-12 plus a workplace placement.",
    offeredBy: "QCTO-accredited providers, SETAs and employers",
    progressesTo: ["advanced-diploma", "diploma"],
    description: "Workplace-based occupational route. For artisan trades it leads to a trade test and Red Seal artisan status.",
    sourceIds: ["sa-qcto-trades"],
    coverageStatus: "framework",
  },
  {
    id: "higher-certificate",
    name: "Higher Certificate",
    nqfLevel: 5,
    credits: 120,
    duration: "1 year",
    band: "higher-education",
    entryRequirement: "NSC with a Higher Certificate pass (or relevant NCV/N qualification).",
    offeredBy: "Universities, universities of technology and registered private colleges",
    progressesTo: ["diploma", "advanced-certificate"],
    description: "Entry-level higher-education qualification. A common bridge into diploma or degree study.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "advanced-certificate",
    name: "Advanced Certificate",
    nqfLevel: 6,
    credits: 120,
    duration: "1 year",
    band: "higher-education",
    entryRequirement: "A relevant Higher Certificate or equivalent.",
    offeredBy: "Universities and universities of technology",
    progressesTo: ["diploma", "advanced-diploma"],
    description: "Builds on a Higher Certificate or gives focused specialisation at NQF 6.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "diploma",
    name: "Diploma",
    nqfLevel: 6,
    credits: 360,
    duration: "3 years",
    band: "higher-education",
    entryRequirement: "NSC with a Diploma pass plus any subject requirements set by the programme.",
    offeredBy: "Universities of technology, universities and TVET/private colleges",
    progressesTo: ["advanced-diploma"],
    description: "Practical, career-focused qualification. Strong route into technical, business and health-support work.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "advanced-diploma",
    name: "Advanced Diploma",
    nqfLevel: 7,
    credits: 120,
    duration: "1 year",
    band: "higher-education",
    entryRequirement: "A relevant Diploma at NQF 6.",
    offeredBy: "Universities of technology and universities",
    progressesTo: ["postgraduate-diploma", "bachelor-honours"],
    description: "A year of deeper study after a diploma, reaching NQF 7 (the same level as a Bachelor's Degree).",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "bachelors-degree",
    name: "Bachelor's Degree (general, 3 years)",
    nqfLevel: 7,
    credits: 360,
    duration: "3 years",
    band: "higher-education",
    entryRequirement: "NSC with a Bachelor's Degree pass plus programme subject and APS requirements.",
    offeredBy: "Universities and universities of technology",
    progressesTo: ["bachelor-honours", "postgraduate-diploma"],
    description: "Three-year degree such as a general BA, BCom or BSc.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "bachelors-degree-professional",
    name: "Bachelor's Degree (professional, 4+ years)",
    nqfLevel: 8,
    credits: "480+",
    duration: "4-6 years",
    band: "higher-education",
    entryRequirement: "NSC with a Bachelor's Degree pass and strong programme-specific marks (often high APS and specific subjects).",
    offeredBy: "Universities",
    progressesTo: ["masters-degree", "postgraduate-diploma"],
    description: "Four-year-plus professional degrees such as BEng, LLB, BEd, BAcc and health-science degrees, often tied to a professional body.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "bachelor-honours",
    name: "Bachelor Honours Degree",
    nqfLevel: 8,
    credits: 120,
    duration: "1 year",
    band: "higher-education",
    entryRequirement: "A relevant Bachelor's Degree, usually with a strong final-year average.",
    offeredBy: "Universities",
    progressesTo: ["masters-degree"],
    description: "A focused postgraduate year that deepens a degree and is the usual entry to a Master's.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "postgraduate-diploma",
    name: "Postgraduate Diploma",
    nqfLevel: 8,
    credits: 120,
    duration: "1 year",
    band: "higher-education",
    entryRequirement: "A relevant Bachelor's Degree or Advanced Diploma.",
    offeredBy: "Universities and universities of technology",
    progressesTo: ["masters-degree"],
    description: "A professional or specialist postgraduate qualification, often used to convert into a new field (for example a PGCE for teaching).",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "masters-degree",
    name: "Master's Degree",
    nqfLevel: 9,
    credits: "180-240",
    duration: "1-2 years",
    band: "higher-education",
    entryRequirement: "A relevant Honours degree or equivalent NQF 8 qualification.",
    offeredBy: "Universities",
    progressesTo: ["doctoral-degree"],
    description: "Advanced specialist or research qualification.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
  {
    id: "doctoral-degree",
    name: "Doctoral Degree (PhD)",
    nqfLevel: 10,
    credits: 360,
    duration: "2-4+ years",
    band: "higher-education",
    entryRequirement: "A relevant Master's Degree.",
    offeredBy: "Universities",
    progressesTo: [],
    description: "The highest NQF level, based on an original research contribution.",
    sourceIds: ["sa-heqsf"],
    coverageStatus: "framework",
  },
];

// A verified set of common named degrees. This is the "common degrees" layer the
// product roadmap calls for, not a full institution catalog. Subject requirements are
// the typical national pattern; the exact list, APS and availability vary by university.
export const COMMON_DEGREES = [
  { id: "bsc", name: "Bachelor of Science (BSc)", typeId: "bachelors-degree", fields: ["science", "tech"], requiredSubjects: ["mathematics"], recommendedSubjects: ["physical-sciences", "life-sciences"], regulator: null, exampleProviders: "Most public universities", note: "Majors range from computer science and physics to biology and statistics. Mathematics is almost always required.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bsc-eng", name: "Bachelor of Engineering (BEng / BScEng)", typeId: "bachelors-degree-professional", fields: ["engineering"], requiredSubjects: ["mathematics", "physical-sciences"], recommendedSubjects: ["engineering-graphics-design"], regulator: "ECSA", exampleProviders: "Universities with engineering faculties", note: "Four-year professional degree. High marks in Mathematics and Physical Sciences are needed. Leads to registration with the Engineering Council of South Africa (ECSA).", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "beng-tech", name: "Bachelor of Engineering Technology (BEngTech)", typeId: "bachelors-degree", fields: ["engineering", "practical", "tech"], requiredSubjects: ["mathematics", "physical-sciences"], recommendedSubjects: ["engineering-graphics-design"], regulator: "ECSA", exampleProviders: "Universities of technology", note: "Technology-focused engineering degree offered mainly by universities of technology; also an ECSA-registered route.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bcom", name: "Bachelor of Commerce (BCom)", typeId: "bachelors-degree", fields: ["finance", "people", "logistics", "entrepreneur"], requiredSubjects: ["mathematics"], recommendedSubjects: ["accounting", "economics", "business-studies"], regulator: null, exampleProviders: "Most public universities", note: "Majors include accounting, finance, marketing, economics, supply chain and information systems. Most BCom streams require Mathematics, not Mathematical Literacy.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bacc", name: "Bachelor of Accounting (BAcc / BCom Accounting)", typeId: "bachelors-degree-professional", fields: ["finance"], requiredSubjects: ["mathematics"], recommendedSubjects: ["accounting"], regulator: "SAICA / SAIPA", exampleProviders: "SAICA-accredited universities", note: "The route towards Chartered Accountant CA(SA): degree, then CTA/Honours, then board exams and articles.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "ba", name: "Bachelor of Arts (BA)", typeId: "bachelors-degree", fields: ["creative", "public", "education", "people"], requiredSubjects: [], recommendedSubjects: ["history", "home-language"], regulator: null, exampleProviders: "Most public universities", note: "Humanities and social-science majors such as languages, psychology, politics, sociology and media. Either Mathematics or Mathematical Literacy is usually accepted.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "llb", name: "Bachelor of Laws (LLB)", typeId: "bachelors-degree-professional", fields: ["public"], requiredSubjects: [], recommendedSubjects: ["history", "home-language"], regulator: "Legal Practice Council", exampleProviders: "Universities with law faculties", note: "Four-year law degree. Strong language marks matter; Mathematical Literacy is accepted by many law faculties. Practising as an attorney/advocate requires further admission steps.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "mbchb", name: "Bachelor of Medicine and Surgery (MBChB)", typeId: "bachelors-degree-professional", fields: ["care", "science"], requiredSubjects: ["mathematics", "physical-sciences", "life-sciences"], recommendedSubjects: [], regulator: "HPCSA", exampleProviders: "Medical schools", note: "Very competitive: high APS, specific subjects and often the NBT. Leads to registration with the Health Professions Council of South Africa (HPCSA).", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bpharm", name: "Bachelor of Pharmacy (BPharm)", typeId: "bachelors-degree-professional", fields: ["care", "science"], requiredSubjects: ["mathematics", "physical-sciences"], recommendedSubjects: ["life-sciences"], regulator: "SAPC", exampleProviders: "Universities with pharmacy schools", note: "Four-year degree leading to registration with the South African Pharmacy Council after community service.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bnurs", name: "Bachelor of Nursing (BNurs)", typeId: "bachelors-degree-professional", fields: ["care"], requiredSubjects: ["life-sciences"], recommendedSubjects: ["mathematics"], regulator: "SANC", exampleProviders: "Universities and nursing colleges", note: "Leads to registration as a professional nurse with the South African Nursing Council (SANC). Diploma routes also exist.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bsw", name: "Bachelor of Social Work (BSW)", typeId: "bachelors-degree-professional", fields: ["care", "public"], requiredSubjects: [], recommendedSubjects: ["life-sciences", "history"], regulator: "SACSSP", exampleProviders: "Universities with social-work departments", note: "Four-year professional degree leading to registration with the SA Council for Social Service Professions (SACSSP).", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bed", name: "Bachelor of Education (BEd)", typeId: "bachelors-degree-professional", fields: ["education"], requiredSubjects: [], recommendedSubjects: ["home-language", "mathematics"], regulator: "SACE", exampleProviders: "Universities with education faculties", note: "Four-year teaching degree (or a 3-year degree plus a PGCE). Requires registration with the SA Council for Educators (SACE) to teach. Subject requirements depend on the phase and subjects taught.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "bsc-agric", name: "Bachelor of Science in Agriculture (BScAgric)", typeId: "bachelors-degree-professional", fields: ["agri", "science"], requiredSubjects: ["mathematics"], recommendedSubjects: ["life-sciences", "agricultural-sciences", "physical-sciences"], regulator: "SACNASP (for natural scientists)", exampleProviders: "Universities with agriculture faculties", note: "Covers agronomy, animal and soil science, agricultural economics and more.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "diploma-it", name: "Diploma in Information Technology", typeId: "diploma", fields: ["tech"], requiredSubjects: [], recommendedSubjects: ["mathematics", "information-technology", "computer-applications-technology"], regulator: null, exampleProviders: "Universities of technology and TVET/private colleges", note: "Practical computing route into support, development and systems work; can bridge to an Advanced Diploma and degree.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "diploma-eng", name: "Diploma in Engineering", typeId: "diploma", fields: ["engineering", "practical"], requiredSubjects: ["mathematics", "physical-sciences"], recommendedSubjects: ["engineering-graphics-design"], regulator: "ECSA (technician route)", exampleProviders: "Universities of technology", note: "Practical engineering route (civil, electrical, mechanical and more), with progression to Advanced Diploma and BEngTech.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "diploma-hospitality", name: "Diploma in Hospitality Management", typeId: "diploma", fields: ["hospitality"], requiredSubjects: [], recommendedSubjects: ["hospitality-studies", "tourism", "consumer-studies"], regulator: null, exampleProviders: "Universities of technology and hospitality schools", note: "Management-focused route into hotels, food service and tourism operations.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "diploma-logistics", name: "Diploma in Logistics / Supply Chain", typeId: "diploma", fields: ["logistics"], requiredSubjects: [], recommendedSubjects: ["mathematics", "business-studies", "geography"], regulator: null, exampleProviders: "Universities of technology and colleges", note: "Operations-focused route into warehousing, transport and supply-chain coordination.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
  { id: "diploma-policing", name: "Diploma in Policing / Safety Management", typeId: "diploma", fields: ["public"], requiredSubjects: [], recommendedSubjects: ["history", "life-sciences"], regulator: null, exampleProviders: "Universities of technology and SAPS academies", note: "Supports policing, safety and law-enforcement roles alongside in-service training.", coverageStatus: "common-degree", sourceIds: ["sa-heqsf", "careerize-study-framework"] },
];

// Career field study paths, keyed by the catalog "kind". Each field links Grade 10
// subjects to admission level, qualification routes (in plain order: certificate ->
// diploma -> degree), postgraduate progression and alternative routes.
export const STUDY_FIELDS = {
  tech: {
    label: "Technology, data and computing",
    grade10: [
      { subjectId: "mathematics", importance: "recommended", note: "Required for most computing degrees." },
      { subjectId: "information-technology", importance: "recommended" },
      { subjectId: "physical-sciences", importance: "optional" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["higher-certificate", "diploma-it", "bsc", "bcom"],
    progression: ["Advanced Diploma or Honours", "Master's in a computing field", "Specialist certifications alongside formal study"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: null,
    notes: ["Many tech roles also reward a strong project portfolio and vendor certifications, not only a degree."],
    coverageStatus: "framework",
  },
  finance: {
    label: "Finance, accounting and business",
    grade10: [
      { subjectId: "mathematics", importance: "recommended", note: "Most commerce degrees require Mathematics, not Mathematical Literacy." },
      { subjectId: "accounting", importance: "recommended" },
      { subjectId: "economics", importance: "optional" },
      { subjectId: "business-studies", importance: "optional" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["higher-certificate", "diploma", "bcom", "bacc"],
    progression: ["Honours / CTA", "Professional qualification (for example CA(SA), SAIPA, CIMA)", "Master's"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: { body: "SAICA / SAIPA (for chartered or professional accountants)", note: "Professional accounting titles need a body's exams and workplace articles." },
    notes: ["Bookkeeping and clerk roles are reachable via certificates and learnerships; chartered routes need a degree and a professional body."],
    coverageStatus: "framework",
  },
  practical: {
    label: "Skilled trades and built environment",
    grade10: [
      { subjectId: "mathematics", importance: "recommended", note: "Technical Mathematics is also accepted for many trades." },
      { subjectId: "physical-sciences", importance: "optional" },
      { subjectId: "engineering-graphics-design", importance: "optional" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["ncv", "nated-n1-n6", "occupational-certificate", "diploma-eng"],
    progression: ["Trade test and Red Seal artisan status", "Advanced Diploma or BEngTech", "Supervisory and contractor routes"],
    alternativeRoutes: ["apprenticeship", "learnership", "work"],
    registration: { body: "QCTO / NAMB (artisan trade test)", note: "Artisan status comes from a recognised trade test, often after an apprenticeship." },
    notes: ["Trades are a strong route where a learnership or apprenticeship plus a trade test matters more than a degree."],
    coverageStatus: "framework",
  },
  care: {
    label: "Health, care and social services",
    grade10: [
      { subjectId: "life-sciences", importance: "recommended" },
      { subjectId: "mathematics", importance: "recommended", note: "Required for medicine, pharmacy and many health degrees." },
      { subjectId: "physical-sciences", importance: "optional", note: "Required for medicine and pharmacy." },
    ],
    admissionLevelId: "bachelors",
    routeIds: ["higher-certificate", "diploma", "bnurs", "bpharm", "mbchb"],
    progression: ["Community service and professional registration", "Honours / specialist training", "Master's and specialisation"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: { body: "HPCSA / SANC / SAPC / SACSSP depending on the profession", note: "Most clinical roles require registration with a health professions council before practising." },
    notes: ["Support roles (assistants, community health workers) are reachable via certificates and diplomas; clinical professional roles need degrees and registration."],
    coverageStatus: "framework",
  },
  education: {
    label: "Education and training",
    grade10: [
      { subjectId: "home-language", importance: "recommended" },
      { subjectId: "mathematics", importance: "optional", note: "Needed if you plan to teach Mathematics or the senior phase." },
    ],
    admissionLevelId: "bachelors",
    routeIds: ["higher-certificate", "diploma", "bed", "postgraduate-diploma"],
    progression: ["SACE registration", "Honours and Master's in Education", "Subject or leadership specialisation"],
    alternativeRoutes: ["learnership", "work"],
    registration: { body: "SACE (SA Council for Educators)", note: "You must register with SACE to teach in a school." },
    notes: ["You can teach via a 4-year BEd, or a 3-year degree plus a PGCE. Subject requirements depend on the phase and subjects you will teach."],
    coverageStatus: "framework",
  },
  agri: {
    label: "Agriculture, food and environment",
    grade10: [
      { subjectId: "life-sciences", importance: "recommended" },
      { subjectId: "agricultural-sciences", importance: "optional" },
      { subjectId: "mathematics", importance: "optional", note: "Required for BScAgric degrees." },
      { subjectId: "geography", importance: "optional" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["ncv", "higher-certificate", "diploma", "bsc-agric"],
    progression: ["Honours / Master's in an agricultural or environmental science", "Farm and operations management", "Specialist scientific routes"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: { body: "SACNASP (for natural scientists)", note: "Scientific roles may need registration as a natural scientist." },
    notes: ["Hands-on farming entry is possible via certificates and experience; technical and scientific roles benefit from a diploma or degree."],
    coverageStatus: "framework",
  },
  logistics: {
    label: "Logistics, transport and supply chain",
    grade10: [
      { subjectId: "mathematics", importance: "optional" },
      { subjectId: "business-studies", importance: "optional" },
      { subjectId: "geography", importance: "optional" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["ncv", "higher-certificate", "diploma-logistics", "bcom"],
    progression: ["Advanced Diploma or Honours", "Operations and supply-chain management", "Professional supply-chain certifications"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: null,
    notes: ["Many entry roles (clerk, controller, driver) start from certificates, licences and experience rather than a degree."],
    coverageStatus: "framework",
  },
  public: {
    label: "Law, public service and public safety",
    grade10: [
      { subjectId: "history", importance: "optional" },
      { subjectId: "home-language", importance: "recommended", note: "Strong language marks matter for law." },
    ],
    admissionLevelId: "bachelors",
    routeIds: ["higher-certificate", "diploma-policing", "llb", "ba"],
    progression: ["Professional admission (for law)", "Honours and Master's in law, policy or administration", "Senior public-service routes"],
    alternativeRoutes: ["learnership", "work"],
    registration: { body: "Legal Practice Council (for attorneys and advocates)", note: "Practising law needs vocational training and admission after the LLB." },
    notes: ["Many public-safety roles (police, traffic, correctional services) are entered through in-service training plus a relevant diploma or certificate."],
    coverageStatus: "framework",
  },
  creative: {
    label: "Creative, media, arts and design",
    grade10: [
      { subjectId: "visual-arts", importance: "optional" },
      { subjectId: "dramatic-arts", importance: "optional" },
      { subjectId: "home-language", importance: "recommended" },
    ],
    admissionLevelId: "diploma",
    routeIds: ["higher-certificate", "diploma", "ba"],
    progression: ["Advanced Diploma or Honours", "Master's in a creative or media field", "Portfolio-led specialisation"],
    alternativeRoutes: ["shortcourse", "work", "pivot"],
    registration: null,
    notes: ["A strong portfolio often matters as much as the qualification. Many creative routes accept either Mathematics or Mathematical Literacy."],
    coverageStatus: "framework",
  },
  people: {
    label: "Sales, marketing and customer work",
    grade10: [
      { subjectId: "business-studies", importance: "optional" },
      { subjectId: "home-language", importance: "recommended" },
      { subjectId: "mathematics", importance: "optional" },
    ],
    admissionLevelId: "higher-certificate",
    routeIds: ["higher-certificate", "diploma", "bcom"],
    progression: ["Advanced Diploma or Honours in marketing or management", "Account and client management", "Commercial leadership"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: null,
    notes: ["Many customer and sales roles start from a certificate plus on-the-job training; degrees help for marketing and management progression."],
    coverageStatus: "framework",
  },
  hospitality: {
    label: "Hospitality, tourism, sport and events",
    grade10: [
      { subjectId: "hospitality-studies", importance: "optional" },
      { subjectId: "tourism", importance: "optional" },
      { subjectId: "consumer-studies", importance: "optional" },
    ],
    admissionLevelId: "higher-certificate",
    routeIds: ["ncv", "higher-certificate", "diploma-hospitality"],
    progression: ["Advanced Diploma or degree in hospitality or tourism management", "Operations and venue management", "Ownership routes"],
    alternativeRoutes: ["learnership", "shortcourse", "work"],
    registration: null,
    notes: ["Practical hospitality roles are very accessible via certificates and experience; management benefits from a diploma or degree."],
    coverageStatus: "framework",
  },
  engineering: {
    label: "Engineering, manufacturing, mining and energy",
    grade10: [
      { subjectId: "mathematics", importance: "recommended", note: "Required for engineering degrees and diplomas." },
      { subjectId: "physical-sciences", importance: "recommended" },
      { subjectId: "engineering-graphics-design", importance: "optional" },
    ],
    admissionLevelId: "bachelors",
    routeIds: ["nated-n1-n6", "diploma-eng", "beng-tech", "bsc-eng"],
    progression: ["ECSA registration (technician, technologist or professional engineer)", "Honours / Master's", "Project and engineering management"],
    alternativeRoutes: ["apprenticeship", "learnership", "work"],
    registration: { body: "ECSA (Engineering Council of South Africa)", note: "Engineering practice is structured around ECSA registration categories." },
    notes: ["Operator and technician roles are reachable via NCV/N-routes and diplomas; professional engineering needs a degree and ECSA registration."],
    coverageStatus: "framework",
  },
  entrepreneur: {
    label: "Entrepreneurship and the community economy",
    grade10: [
      { subjectId: "business-studies", importance: "optional" },
      { subjectId: "accounting", importance: "optional" },
      { subjectId: "mathematical-literacy", importance: "optional", note: "Either Mathematics or Mathematical Literacy is useful for running a business." },
    ],
    admissionLevelId: "higher-certificate",
    routeIds: ["occupational-certificate", "higher-certificate", "diploma"],
    progression: ["Short courses in finance, marketing and operations", "Diploma or degree in business if scaling up", "Mentorship and incubator support"],
    alternativeRoutes: ["shortcourse", "work", "pivot"],
    registration: null,
    notes: ["No qualification is required to start, but business, financial and digital short courses lower the risk of failure."],
    coverageStatus: "framework",
  },
  science: {
    label: "Science and research",
    grade10: [
      { subjectId: "mathematics", importance: "recommended" },
      { subjectId: "physical-sciences", importance: "recommended" },
      { subjectId: "life-sciences", importance: "optional" },
    ],
    admissionLevelId: "bachelors",
    routeIds: ["diploma", "bsc", "bachelor-honours"],
    progression: ["Honours", "Master's", "Doctoral (PhD) and research careers"],
    alternativeRoutes: ["shortcourse", "work"],
    registration: { body: "SACNASP (for natural scientists)", note: "Many scientific roles require registration as a natural scientist." },
    notes: ["Research-track science usually needs postgraduate study; technician and lab-assistant roles are reachable with a diploma or BSc."],
    coverageStatus: "framework",
  },
};

// Per-career overrides for higher-priority careers, so flagship routes show the most
// relevant named qualification first. Keyed by catalog route id.
export const CAREER_STUDY_OVERRIDES = {
  "software-developer": { routeIds: ["higher-certificate", "diploma-it", "bsc", "bcom"], notes: ["A computer science or IT qualification helps, but a strong portfolio and demonstrable projects carry real weight for developer roles."] },
  "civil-engineering-technician": { admissionLevelId: "diploma", routeIds: ["nated-n1-n6", "diploma-eng", "beng-tech"], registration: { body: "ECSA (Engineering Technician)", note: "Register with ECSA as a candidate, then a professional engineering technician." } },
  "technical-artisan": { admissionLevelId: "diploma", routeIds: ["ncv", "nated-n1-n6", "occupational-certificate"], registration: { body: "QCTO / Department of Labour wireman's licence", note: "Electrical work needs a trade test, and installation work needs a registered licence." }, notes: ["The core route is an apprenticeship or learnership plus a trade test, not a degree."] },
  "healthcare-professional": { admissionLevelId: "bachelors", routeIds: ["higher-certificate", "diploma", "bnurs"], registration: { body: "SANC (SA Nursing Council)", note: "You must register with SANC to practise as a nurse." } },
  "finance-accounting": { admissionLevelId: "diploma", routeIds: ["higher-certificate", "diploma", "bcom", "bacc"], registration: { body: "SAICA / SAIPA", note: "Professional accountant titles need a body's exams and articles." } },
  "data-analyst": { routeIds: ["higher-certificate", "diploma-it", "bsc", "bcom"], notes: ["Statistics, data tools and a portfolio of analysis projects matter alongside the qualification."] },
};

const SUBJECTS_BY_ID = new Map(NSC_SUBJECTS.map((subject) => [subject.id, subject]));
const QUALIFICATIONS_BY_ID = new Map([...QUALIFICATION_TYPES, ...COMMON_DEGREES].map((item) => [item.id, item]));
const ADMISSION_BY_ID = new Map(ADMISSION_LEVELS.map((level) => [level.id, level]));

export function getSubject(id) {
  return SUBJECTS_BY_ID.get(id) ?? null;
}

export function getQualification(id) {
  return QUALIFICATIONS_BY_ID.get(id) ?? null;
}

// Normalise a qualification type OR a named common degree into one display shape.
// Common degrees inherit their NQF level and duration from the qualification type
// they belong to (a BSc is a Bachelor's Degree, so it is NQF 7).
function normalizeQualification(id) {
  const item = getQualification(id);
  if (!item) return null;
  if (item.typeId) {
    const type = getQualification(item.typeId);
    return {
      id: item.id,
      name: item.name,
      kind: "degree",
      nqfLevel: type?.nqfLevel,
      duration: type?.duration,
      entryRequirement: item.note,
      offeredBy: item.exampleProviders,
      regulator: item.regulator,
      coverageStatus: item.coverageStatus ?? "common-degree",
    };
  }
  return {
    id: item.id,
    name: item.name,
    kind: "qualification-type",
    nqfLevel: item.nqfLevel,
    duration: item.duration,
    entryRequirement: item.entryRequirement,
    offeredBy: item.offeredBy,
    regulator: null,
    coverageStatus: item.coverageStatus ?? "framework",
  };
}

export function getDesignatedSubjects() {
  return NSC_SUBJECTS.filter((subject) => subject.designated);
}

// Resolve a full, display-ready study path for a career route.
export function getStudyPathForCareer(route) {
  const fieldId = route?.studyFieldId;
  const field = STUDY_FIELDS[fieldId];
  if (!field) return null;

  const override = CAREER_STUDY_OVERRIDES[route?.id] ?? {};
  const merged = { ...field, ...override };

  const admissionLevel = ADMISSION_BY_ID.get(merged.admissionLevelId) ?? ADMISSION_BY_ID.get("higher-certificate");

  const grade10 = (merged.grade10 ?? [])
    .map((entry) => {
      const subject = getSubject(entry.subjectId);
      if (!subject) return null;
      return { ...subject, importance: entry.importance ?? "optional", choiceNote: entry.note ?? subject.note };
    })
    .filter(Boolean);

  const qualifications = (merged.routeIds ?? [])
    .map((id) => normalizeQualification(id))
    .filter(Boolean);

  return {
    fieldId,
    fieldLabel: merged.label,
    grade10,
    admissionLevel,
    qualifications,
    progression: merged.progression ?? [],
    alternativeRoutes: merged.alternativeRoutes ?? [],
    registration: merged.registration ?? null,
    notes: merged.notes ?? [],
    coverageStatus: merged.coverageStatus ?? "framework",
    sourceIds: ["careerize-study-framework", "sa-heqsf", "sa-min-admission"],
  };
}

// Reverse view: for a chosen NSC subject, which career fields it most supports.
export function getFieldsForSubject(subjectId) {
  const subject = getSubject(subjectId);
  if (!subject) return [];
  return (subject.unlocks ?? [])
    .map((id) => (STUDY_FIELDS[id] ? { id, label: STUDY_FIELDS[id].label } : null))
    .filter(Boolean);
}
