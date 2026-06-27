import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  countNonEmptyFields,
  joinUnique,
  normalizeTitle,
  normalizeWhitespace,
  parseScore,
  readCsv,
  slugify,
  splitList,
  tokenOverlapStats,
  uniqueValues,
  writeCsv,
} from "./saFoundationResearchUtils.mjs";

const root = process.cwd();
const foundationDir = path.join(root, "data", "sa-foundation");
const archiveSource = "workspace-019f0ad1-5c85-71b9-ba8f-c25183c5f379.zip";
const archiveRoot = process.env.CAREERIZE_RESEARCH_ARCHIVE_DIR
  ? path.resolve(process.env.CAREERIZE_RESEARCH_ARCHIVE_DIR)
  : path.join(root, ".codex-temp", "careerize-research-019f0ad1");

const batchDefinitions = [
  { id: "001_seed", file: "sa_career_database_batch_001_seed.csv", purpose: "Deep seed records across priority careers." },
  { id: "002_oihd", file: "career_research/output/sa_career_database_batch_002_250_oihd.csv", purpose: "DHET 2024 OIHD expansion batch." },
  { id: "003_qcto_tvet", file: "career_research/output/sa_career_database_batch_003_250_qcto_tvet.csv", purpose: "QCTO and TVET pathway expansion batch." },
  { id: "004_qcto_tvet", file: "career_research/output/sa_career_database_batch_004_250_qcto_tvet.csv", purpose: "Continuation of QCTO and TVET pathway expansion." },
  { id: "005_mixed_official", file: "career_research/output/sa_career_database_batch_005_250_mixed_official.csv", purpose: "Mixed official-source closure batch." },
  { id: "006_dpsa_public_service", file: "career_research/output/sa_career_database_batch_006_250_dpsa_public_service.csv", purpose: "DPSA public-service occupational records." },
  { id: "007_dpsa_public_service", file: "career_research/output/sa_career_database_batch_007_250_dpsa_public_service.csv", purpose: "DPSA continuation and top-up records." },
  { id: "008_future_2030_watchlist", file: "career_research/output/sa_career_database_batch_008_250_future_2030_watchlist.csv", purpose: "2030 watchlist expansion batch." },
];

const enrichmentDefinition = {
  id: "009_enriched_scarce_high_demand",
  file: "career_research/output/sa_career_database_batch_009_250_enriched_scarce_high_demand.csv",
  purpose: "Enrichment pass for priority scarce and high-demand records.",
};

const archiveManifestFiles = [
  { file: "README.md", type: "md", purpose: "Research archive readme." },
  { file: "SOUTH_AFRICA_CAREER_DATABASE_MASTER_DOCUMENT.md", type: "md", purpose: "Research archive master document." },
  { file: "sa_career_taxonomy_source_strategy.md", type: "md", purpose: "Taxonomy and source strategy note." },
  ...batchDefinitions.map((definition) => ({ file: definition.file, type: "csv", purpose: definition.purpose })),
  { file: enrichmentDefinition.file, type: "csv", purpose: enrichmentDefinition.purpose },
  ...["002", "003", "004", "005", "006", "007", "008", "009"].map((batchId) => ({
    file: `career_research/output/batch_${batchId}_data_quality_note.md`,
    type: "md",
    purpose: `Batch ${batchId} data-quality note.`,
  })),
  { file: "career_research/sources/dhet_oihd_2024.pdf", type: "pdf", purpose: "DHET OIHD source PDF." },
  { file: "career_research/sources/dhet_oihd_2024.txt", type: "txt", purpose: "Extracted DHET OIHD text." },
  { file: "career_research/sources/qcto_full_qualifications_2023.pdf", type: "pdf", purpose: "QCTO qualifications source PDF." },
  { file: "career_research/sources/qcto_full_qualifications_2023.txt", type: "txt", purpose: "Extracted QCTO qualification text." },
  { file: "career_research/sources/dpsa_public_service_occupational_dictionary_2023.pdf", type: "pdf", purpose: "DPSA occupational dictionary PDF." },
  { file: "career_research/sources/dpsa_public_service_occupational_dictionary_2023.txt", type: "txt", purpose: "Extracted DPSA occupational dictionary text." },
  { file: "career_research/sources/critical_skills_technical_report.pdf", type: "pdf", purpose: "Critical skills technical report PDF." },
  { file: "career_research/sources/critical_skills_technical_report.txt", type: "txt", purpose: "Extracted critical skills technical report text." },
  { file: "career_research/sources/critical_skills_update_47182_2022.pdf", type: "pdf", purpose: "Critical skills gazette PDF." },
  { file: "career_research/sources/critical_skills_update_47182_2022.txt", type: "txt", purpose: "Extracted critical skills gazette text." },
];

const fieldAliases = {
  career_id: ["Career ID"],
  primary_career_name: ["Primary Career Name"],
  alternative_job_titles: ["Alternative Job Titles"],
  career_category: ["Career Category"],
  industry_sectors: ["Industry Sectors"],
  classification: ["Current / Emerging / 2030 Forecast Classification", "Classification"],
  plain_english_career_description: ["Plain-English Career Description"],
  typical_day: ["What a Typical Day Looks Like", "Typical Day"],
  work_environment: ["Work Environment"],
  who_this_career_suits: ["Who This Career Suits"],
  school_subjects_helpful: ["School Subjects Helpful"],
  minimum_education_pathway: ["Minimum Education Pathway"],
  preferred_education_pathway: ["Preferred Education Pathway"],
  alternative_entry_pathways: ["Alternative Entry Pathways"],
  nqf_level_where_relevant: ["NQF Level Where Relevant"],
  professional_registration_required: ["Professional Registration Required"],
  key_skills_needed: ["Key Skills Needed"],
  tools_technologies_used: ["Tools / Technologies Used"],
  entry_level_job_titles: ["Entry-Level Job Titles"],
  mid_level_job_titles: ["Mid-Level Job Titles"],
  senior_level_job_titles: ["Senior-Level Job Titles"],
  career_progression: ["Career Progression"],
  related_careers: ["Related Careers"],
  current_sa_demand_evidence: ["Current South African Demand Evidence"],
  outlook_2030: ["2030 Outlook"],
  automation_ai_impact: ["Automation / AI Impact"],
  geographic_demand_in_south_africa: ["Geographic Demand in South Africa"],
  salary_range: ["Salary Range"],
  barriers_to_entry: ["Barriers to Entry"],
  opportunities_for_entrepreneurship: ["Opportunities for Entrepreneurship"],
  inclusion_notes: ["Inclusion Notes"],
  source_links: ["Source Links"],
  source_quality_rating: ["Source Quality Rating"],
  confidence_score: ["Confidence Score"],
  research_notes: ["Research Notes"],
};

const listLikeFields = new Set([
  "alternative_job_titles",
  "industry_sectors",
  "classification",
  "entry_level_job_titles",
  "mid_level_job_titles",
  "senior_level_job_titles",
  "related_careers",
  "source_links",
]);

const representativeFields = [
  "plain_english_career_description",
  "typical_day",
  "school_subjects_helpful",
  "minimum_education_pathway",
  "preferred_education_pathway",
  "alternative_entry_pathways",
  "professional_registration_required",
  "key_skills_needed",
  "tools_technologies_used",
  "career_progression",
  "current_sa_demand_evidence",
  "outlook_2030",
  "automation_ai_impact",
  "barriers_to_entry",
  "opportunities_for_entrepreneurship",
  "inclusion_notes",
  "source_links",
  "research_notes",
];

const categoryToStream = {
  "Agriculture Food and Environment": "Agriculture, food and environment",
  "Agriculture, Food and Environment": "Agriculture, food and environment",
  "Business, Management and Administration": "Finance, admin and business operations",
  "Education and Training": "Education, training and youth development",
  "Education, Public Sector and Creative Services": "Education, training and youth development",
  "Energy and Green Economy": "Manufacturing, mining and energy",
  "Engineering and Built Environment": "Skilled trades, construction and engineering",
  "Entrepreneurship and Informal Economy": "Informal, entrepreneurship and community economy",
  "Finance Banking and Insurance": "Finance, admin and business operations",
  "Finance, Banking and Insurance": "Finance, admin and business operations",
  "Healthcare and Wellness": "Health, care and social services",
  "Hospitality Tourism and Events": "Hospitality, tourism, sport and events",
  "Hospitality, Tourism and Events": "Hospitality, tourism, sport and events",
  "Human Resources and People": "Sales, marketing and customer work",
  "Law, Governance and Public Sector": "Law, public service and public safety",
  "Logistics Transport and Supply Chain": "Logistics, transport and supply chain",
  "Logistics, Transport and Customer Operations": "Logistics, transport and supply chain",
  "Logistics, Transport and Supply Chain": "Logistics, transport and supply chain",
  "Manufacturing and Industrial": "Manufacturing, mining and energy",
  "Media, Creative and Communication": "Creative, media and design",
  "Mining and Natural Resources": "Manufacturing, mining and energy",
  "Mining, Manufacturing, Science and Financial Risk": "Manufacturing, mining and energy",
  "Retail, Sales and Customer Experience": "Sales, marketing and customer work",
  "Safety, Security and Emergency Services": "Law, public service and public safety",
  "Science and Research": "Science, research and frontier careers",
  "Sports Fitness and Personal Services": "Hospitality, tourism, sport and events",
  "Sports, Fitness and Personal Services": "Hospitality, tourism, sport and events",
  "TVET / Occupational and Workplace Pathways": "Skilled trades, construction and engineering",
  "Technology and Digital": "Technology, data and AI",
  "Trades and Artisan": "Skilled trades, construction and engineering",
  "Trades and Artisan Careers": "Skilled trades, construction and engineering",
};

const starterRouteAliasTitles = {
  [normalizeTitle("ICT Security Specialist")]: "Cyber Security Analyst",
  [normalizeTitle("Registered Nurse")]: "Nurse",
  [normalizeTitle("Secondary School STEM Teacher")]: "High School Teacher",
  [normalizeTitle("Secondary School Teacher")]: "High School Teacher",
  [normalizeTitle("Senior Phase School Teacher")]: "High School Teacher",
  [normalizeTitle("FET Phase School Teacher")]: "High School Teacher",
  [normalizeTitle("Hairdresser")]: "Hair Stylist",
  [normalizeTitle("Hotel Front Office Clerk")]: "Hotel Receptionist",
  [normalizeTitle("Call Centre Operator")]: "Call Centre Agent",
  [normalizeTitle("Shop Sales Assistant")]: "Retail Sales Assistant",
  [normalizeTitle("Sales Clerk")]: "Retail Sales Assistant",
  [normalizeTitle("SAPS Officer")]: "Police Officer",
};

const MANUAL_TOP100_QUEUE_CANONICAL_TITLES = {
  [normalizeTitle("BBBEE Consultant")]: ["Compliance Officer", "Public Procurement Compliance Officer", "Small Business Consultant"],
  [normalizeTitle("Traditional Health Practitioner")]: [
    "Health Promotion Practitioner",
    "Natural Energy Healing Practitioner",
    "Crystal Healing Practitioner",
  ],
  [normalizeTitle("Building Inspector")]: [
    "Regulatory Inspector",
    "Electrical Installation Inspector",
    "Environmental Practices Inspector",
  ],
  [normalizeTitle("Business Analyst")]: ["Business Intelligence Specialist", "ICT Systems Analyst", "Data Analyst"],
  [normalizeTitle("IT Project Manager")]: ["ICT Project Manager"],
  [normalizeTitle("Radiographer")]: ["Diagnostic Radiographer", "Medical Diagnostic Radiographer", "Nuclear Medicine Radiographer", "Therapeutic Radiographer"],
  [normalizeTitle("Chartered Accountant (CA(SA))")]: ["Chartered Accountant CA(SA)"],
  [normalizeTitle("Financial Analyst")]: ["Financial Investment Advisor", "Investment Adviser", "Investment Advisor"],
  [normalizeTitle("Tax Practitioner")]: ["Tax Professional", "Tax Technician"],
  [normalizeTitle("Teacher")]: [
    "Foundation Phase School Teacher",
    "Intermediate Phase School Teacher (Grades 4-6)",
    "Senior Phase School Teacher (Grades 7 - 9)",
    "FET Phase School Teacher (Grades 10-12)",
    "Secondary School STEM Teacher",
  ],
  [normalizeTitle("Agricultural Scientist / Agronomist")]: ["Agricultural Scientist"],
  [normalizeTitle("Farm Manager")]: ["Agricultural Farm Manager", "Mixed Crop Farm Production Manager"],
  [normalizeTitle("Environmental Scientist / Consultant")]: ["Environmental Scientist"],
  [normalizeTitle("Supply Chain Analyst")]: ["Supply Chain Executive", "Supply chain clerk", "Supply Chain Manager", "Supply Planner"],
  [normalizeTitle("Mine Health and Safety Officer")]: ["Mine Health and Safety Inspector", "Environmental Health and Safety Officer"],
  [normalizeTitle("Land Surveyor")]: ["Surveyor", "Surveyor's Assistant", "Surveying or Cartographic Technician"],
  [normalizeTitle("Correctional Services Officer")]: ["Correctional Administration Officer", "Corrections patrol officer", "Corrections Security Officer"],
  [normalizeTitle("SAPS Officer")]: ["Police Official", "Commissioned Police Officer", "Non-Commissioned Police Official", "Senior Police Officer"],
  [normalizeTitle("SANDF Member")]: ["Defence Official", "Middle Management Defence Official", "Senior Defence Official"],
  [normalizeTitle("Automotive Mechanic")]: ["Automotive Engine Mechanic", "Automotive Motor Mechanic"],
  [normalizeTitle("Construction Manager")]: ["Construction Project Manager"],
  [normalizeTitle("Health and Safety Officer")]: ["Environmental Health and Safety Officer", "Health and Safety Manager"],
  [normalizeTitle("Human Resources Officer")]: ["Human Resource Advisor", "Human Resource Practitioner"],
  [normalizeTitle("Payroll Officer")]: ["Payroll Clerk"],
  [normalizeTitle("Network Administrator")]: ["Computer Network and Systems Engineer", "Network Analyst"],
  [normalizeTitle("Database Administrator")]: ["Database Designer and Administrator"],
  [normalizeTitle("Systems Analyst")]: ["ICT Systems Analyst"],
  [normalizeTitle("UX/UI Designer")]: ["UX Designer", "Service Designer"],
  [normalizeTitle("Call Centre Agent")]: ["Call or Contact Centre Agent"],
  [normalizeTitle("Sales Representative")]: ["Commercial Sales Representative", "Health Products Sales Representative", "Industrial Products Sales Representative"],
  [normalizeTitle("Warehouse Supervisor")]: ["Warehouse Manager"],
  [normalizeTitle("Transport Planner")]: ["Transport Analyst", "Planner", "Port Operations Planner"],
  [normalizeTitle("Supply Chain Planner")]: ["Supply Planner", "Supply Chain Executive", "Supply chain clerk"],
  [normalizeTitle("General Office Clerk")]: ["Cash Office Clerk"],
  [normalizeTitle("Shop Sales Assistant")]: ["Sales Assistant (General) (Retail Sales Advisor)"],
  [normalizeTitle("Delivery Driver")]: ["Delivery Platform Driver-Partner"],
  [normalizeTitle("Care Worker")]: ["Child Care Worker", "Geriatric Care Worker", "Ancillary Health Care Worker", "Home Based Personal Care Worker"],
  [normalizeTitle("Administrative Officer")]: ["Office Administrator", "Office Administrator: Public Service Administrator", "Administration Officer"],
  [normalizeTitle("Municipal Officer")]: ["Municipal Digital Services Officer"],
  [normalizeTitle("Customer Service Agent")]: ["International Customer Service Agent", "Remote Customer Support Agent"],
  [normalizeTitle("Accountant")]: ["General Accountant"],
  [normalizeTitle("Human Resources Manager")]: ["Human Resource Manager"],
};

const MANUAL_STARTER_ROUTE_CURATED_RESEARCH_TITLES = {
  "adventure-tourism-guide": ["Tour Guide", "Tourist Information Officer", "Tourism Experience Designer"],
  "anti-corruption-investigator": ["Anti-Corruption Data Analyst", "Crime/ Crash Scene Investigator"],
  actor: ["Camera Operator (Film, Television or Video)", "Digital Artist", "Visual Artist", "Musician (Instrumental)", "Arts/ Culture Manager"],
  animator: ["Multimedia Designer", "Graphic Designer", "Digital Artist"],
  author: ["Technical Writer", "Copywriter", "Book or Script Editor", "Text Editor", "Editor"],
  "astronomy-outreach-officer": ["STEM Tutor", "Robotics Club Coach", "University Lecturer", "Digital Literacy Trainer"],
  barista: ["Food Trade Assistant"],
  "behavioural-insights-analyst": ["Market Research Analyst", "Research Psychologist"],
  baker: ["Confectionary Baker"],
  "bioinformatics-analyst": ["Biotechnologist", "Biochemist", "Medical Biological Scientist", "Microbiologist", "Data Analyst"],
  "brand-strategist": ["Director of Marketing", "Public/ Media Relations Manager", "Communication and Marketing Manager"],
  "business-process-analyst": ["Business Intelligence Specialist", "Data Analyst"],
  "category-assistant": ["Sales Assistant (General) (Retail Sales Advisor)", "Marketing Coordinator"],
  "casino-dealer": ["Hotel Service Manager", "Customer Service Manager", "Cash Office Clerk", "Conference and Events Organiser"],
  "clinical-trial-coordinator": ["Clinical Data Manager", "Nurse Researcher", "Research and Development Manager", "Epidemiological Surveillance Officer"],
  choreographer: ["Dance Movement Therapist", "Musician (Instrumental)", "Visual Artist", "Arts/ Culture Manager"],
  "circular-economy-analyst": ["Circular Economy Consultant"],
  "client-services-consultant": ["Customer Success Specialist", "International Customer Service Agent", "Remote Customer Support Agent"],
  "community-arts-facilitator": ["Arts/ Culture Manager", "Visual Artist"],
  "community-wi-fi-operator": ["Technical Support Agent", "Digital Literacy Trainer"],
  "construction-site-supervisor": ["Construction Project Manager", "Engineering Supervisor"],
  "cultural-programme-coordinator": ["Arts/ Culture Manager", "Events Manager", "Conference and Events Organiser"],
  dancer: ["Dance Movement Therapist", "Musician (Instrumental)", "Visual Artist", "Digital Artist"],
  "digital-twin-specialist": ["Digital Twin Technician"],
  "epidemiology-assistant": ["Epidemiological Surveillance Officer"],
  "entrepreneurship-programme-coordinator": ["Youth Employment Coach", "Program or Project Administrators"],
  "executive-assistant": ["Personal Assistant", "Management Assistant", "Office Administrator"],
  "facilities-maintenance-technician": [
    "Predictive Maintenance Technician",
    "Robotics Maintenance Technician",
    "Solar Operations and Maintenance Technician",
    "Maintenance Officer",
  ],
  "food-safety-scientist": ["Food Safety Auditor", "Food and Beverage Scientist"],
  "freelance-digital-assistant": ["Personal Assistant", "Office Administrator", "Remote Customer Support Agent"],
  "fundraising-coordinator": ["Marketing Coordinator", "Public/ Media Relations Manager", "Communication and Marketing Manager"],
  "garden-services-owner": ["Landscape Gardener (Landscaping Supervisor)", "Landscape Contractor", "Garden Worker"],
  "guest-house-manager": ["Hotel Service Manager"],
  "home-bakery-operator": ["Confectionary Baker"],
  "home-based-childcare-provider": [
    "Child Care Worker",
    "Child and Youth Care Worker",
    "Home-Based Care Coordinator",
    "Home Based Personal Care Worker",
  ],
  "human-factors-researcher": ["UX Researcher", "Research Psychologist"],
  "informal-recycling-collector": [
    "Waste Reclaimer",
    "Collaborative Recycler",
    "Materials Recycler (Paper and Packaging Collector)",
    "Waste Reclaimer Cooperative Coordinator",
  ],
  illustrator: ["Visual Artist", "Graphic Designer", "Digital Artist"],
  "investment-operations-analyst": ["Financial Investment Advisor", "Investment Advisor", "Investment Manager", "Financial Advisor"],
  "language-practitioner": ["Translator", "Interpreter", "South African Sign Language Interpreter"],
  "local-events-supplier": ["Conference and Events Organiser", "Events Manager"],
  "mobile-beauty-service-provider": ["Hairdresser"],
  horticulturist: ["Ornamental Horticultural or Nursery Assistant"],
  "motion-graphics-designer": ["Graphic Designer", "Multimedia Designer", "Digital Artist"],
  "mobile-car-wash-owner": ["Small Business Consultant", "Small Business Manager", "Automotive Workshop Assistant"],
  "paid-media-specialist": ["Social Media Community Manager", "Public/ Media Relations Manager", "Director of Marketing"],
  "packaging-technologist": [
    "Packaging Rotary Printing and Re-reeling Flexographic Machine Minder",
    "Tissue Packaging Attendant",
    "Materials Recycler (Paper and Packaging Collector)",
  ],
  "personal-trainer": ["Individual Fitness Instructor", "Group Fitness Instructor", "Fitness Instructor"],
  "pest-control-operator": ["Pest Management Officer"],
  "plastic-moulding-technician": ["Plastics Manufacturing Machine Setter", "Plastics Manufacturing Machine Operator"],
  "podcast-producer": ["Sound Operator", "Camera Operator (Film, Television or Video)"],
  "private-investigator": ["Crime/ Crash Scene Investigator", "Fire Investigator"],
  "procurement-logistics-analyst": ["Procurement Data Analyst", "Procurement Officer", "Public Procurement Compliance Officer"],
  "publishing-assistant": ["Editor", "Text Editor", "Book or Script Editor", "Commissioning Editor", "Permissions Editor"],
  "cruise-ship-worker": ["Flight Attendant", "Hotel Service Manager", "Tour Guide", "Airline Ground Crew"],
  "repair-shop-owner": [
    "Automotive Workshop Assistant",
    "Bicycle Repairer",
    "Refrigeration Maintenance and Repair workman",
    "Sewing Machine Mechanic Repairer",
  ],
  "research-assistant": [
    "UX Researcher",
    "Research Psychologist",
    "Nurse Researcher",
    "Manufacturing Research Chemist",
    "Forestry Research Technician",
  ],
  "recycling-entrepreneur": ["Recycling Operations Coordinator", "Waste Reclaimer Cooperative Coordinator"],
  "renewable-energy-researcher": ["Renewable Energy Engineer"],
  "scrum-master": ["ICT Project Manager", "Programme or Project Manager", "Project Manager", "Digital Product Manager"],
  "second-hand-clothing-trader": ["Sales Assistant (General) (Retail Sales Advisor)", "Retail Supervisor", "Fashion Designer"],
  "waste-management-coordinator": ["Waste Reclaimer Cooperative Coordinator", "Waste Materials Plant Operator"],
  "security-supervisor": ["Security First Line Manager", "Security Officer", "Protection/Security Official", "Corrections Security Officer"],
  "seo-assistant": ["Copywriter", "Web Designer", "Social Media Community Manager"],
  "smart-city-analyst": ["Smart City Operations Technician", "Municipal Service Delivery Data Analyst"],
  "space-systems-technician": ["Digital Twin Technician", "Geographic Information Systems Technician", "Industrial IoT Technician"],
  "sports-coach": ["Sports Coach or Instructor"],
  "special-needs-support-assistant": ["Disability Support Facilitator"],
  "small-scale-poultry-entrepreneur": ["Poultry Farmer", "Agro-processing Entrepreneur"],
  "street-food-trader": ["Food Trade Assistant"],
  "risk-analyst": ["Risk Officer", "Organisational Risk Practitioner"],
  "community-tutor": ["Online Tutor", "STEM Tutor", "University Tutor"],
  "set-designer": ["Interior Designer", "Furniture Designer", "Industrial Designer"],
  "theatre-technician": ["Sound Operator", "Camera Operator (Film, Television or Video)"],
  "township-delivery-operator": ["Township Delivery Entrepreneur", "Courier", "Delivery Platform Driver-Partner"],
  "urban-farmer": ["Controlled Environment Agriculture Technician", "Regenerative Agriculture Practitioner", "Smallholder Farmer Support Officer"],
  "animal-health-technician": ["Animal Health Data Technician"],
  "dietitian-assistant": ["Assistant Nutritionist", "Nutritionist"],
  "event-coordinator": ["Conference and Events Organiser", "Events Manager"],
  "conference-coordinator": ["Conference and Events Organiser"],
  "event-creative-producer": ["Conference and Events Organiser", "Events Manager"],
  "courier-operations-supervisor": ["Courier"],
  "customs-clearing-agent": ["Customs Officer", "Customs Compliance Specialist"],
  "freight-forwarding-coordinator": ["Freight Handler"],
  "furniture-maker": ["Furniture Designer", "Furniture Upholsterer"],
  "land-survey-technician": ["Surveying or Cartographic Technician", "Surveyor's Assistant"],
  "water-treatment-technician": ["Industrial Water Plant Operator", "Industrial Water Process Controller", "Wastewater Process Controller"],
  "back-end-developer": ["Software Developer", "Applications Developer"],
  "front-end-developer": ["Software Developer", "Applications Developer"],
  "full-stack-developer": ["Software Developer", "Applications Developer"],
  "ai-workflow-builder": ["AI Workflow Designer"],
  "no-code-automation-builder": ["Low-Code Developer"],
  "prompt-engineer": ["Generative AI Application Developer", "AI Workflow Designer"],
  "drone-operator": ["Drone Crop Scout", "Drone Delivery Coordinator", "Drone Spraying Operator", "Mine Drone Survey Operator"],
  "security-operations-centre-analyst": ["ICT Security Specialist"],
  "ui-designer": ["UX Designer", "Service Designer"],
  "learning-technologist": ["Learning Experience Designer", "AI Learning Support Designer", "Instructional Designer"],
  "youth-programme-coordinator": ["Youth Employment Coach"],
  "content-creator": ["Social Media Community Manager", "Content Moderation Specialist"],
  "virtual-assistant": ["Personal Assistant", "Management Assistant", "Office Administrator", "Remote Customer Support Agent"],
  "virtual-production-artist": ["Digital Artist", "Multimedia Designer", "Camera Operator (Film, Television or Video)"],
  videographer: ["Camera Operator (Film, Television or Video)"],
  "wildlife-guide": ["Tour Guide", "Tourist Information Officer"],
  "wedding-planner": ["Conference and Events Organiser", "Events Manager"],
  "sound-engineer": ["Sound Operator"],
  "arts-administrator": ["Arts/ Culture Manager"],
};

const STREAM_REALITY_DEFAULTS = {
  "Technology, data and AI": { earnings: 78, travel: 30, stress: 55, danger: 25 },
  "Finance, admin and business operations": { earnings: 62, travel: 30, stress: 55, danger: 22 },
  "Skilled trades, construction and engineering": { earnings: 66, travel: 76, stress: 68, danger: 76 },
  "Health, care and social services": { earnings: 58, travel: 52, stress: 80, danger: 56 },
  "Education, training and youth development": { earnings: 52, travel: 36, stress: 60, danger: 24 },
  "Agriculture, food and environment": { earnings: 54, travel: 78, stress: 64, danger: 68 },
  "Logistics, transport and supply chain": { earnings: 55, travel: 78, stress: 62, danger: 62 },
  "Law, public service and public safety": { earnings: 58, travel: 52, stress: 76, danger: 58 },
  "Creative, media and design": { earnings: 48, travel: 48, stress: 64, danger: 24 },
  "Sales, marketing and customer work": { earnings: 55, travel: 48, stress: 60, danger: 24 },
  "Hospitality, tourism, sport and events": { earnings: 50, travel: 70, stress: 72, danger: 30 },
  "Manufacturing, mining and energy": { earnings: 70, travel: 78, stress: 70, danger: 80 },
  "Informal, entrepreneurship and community economy": { earnings: 54, travel: 72, stress: 70, danger: 42 },
  "Science, research and frontier careers": { earnings: 72, travel: 48, stress: 62, danger: 42 },
  "Arts, culture, heritage and society": { earnings: 48, travel: 44, stress: 56, danger: 22 },
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeResearchTitle(value) {
  return normalizeWhitespace(value).replace(
    /^\d+\s+sub[- ]major(?:\s+(?:category|group))?\s+code(?:s)?\s+minor(?:\s+(?:category|group))?\s+code(?:s)?(?:\s+unit(?:\s+(?:category|group))?\s+code(?:s)?)?\s+occupations?\s+code(?:s)?\s+/i,
    ""
  );
}

function sanitizeResearchText(value, rawTitle, cleanedTitle) {
  if (!value || !rawTitle || rawTitle === cleanedTitle) {
    return value;
  }

  return normalizeWhitespace(value).replace(new RegExp(escapeRegExp(rawTitle), "gi"), cleanedTitle);
}

function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function averageProfiles(items) {
  if (!items.length) {
    return null;
  }

  return {
    earnings: Math.round(items.reduce((total, item) => total + item.earnings, 0) / items.length),
    travel: Math.round(items.reduce((total, item) => total + item.travel, 0) / items.length),
    stress: Math.round(items.reduce((total, item) => total + item.stress, 0) / items.length),
    danger: Math.round(items.reduce((total, item) => total + item.danger, 0) / items.length),
  };
}

function includesAny(text, terms) {
  const value = String(text ?? "").toLowerCase();
  return terms.some((term) => value.includes(term));
}

function realityBand(value) {
  if (value >= 68) return "high";
  if (value >= 46) return "medium";
  return "low";
}

function strongestRealitySignal(profile) {
  const labels = {
    earnings: "earning upside",
    travel: "travel or movement",
    stress: "stress tolerance",
    danger: "physical safety risk",
  };

  const strongest = Object.entries(profile).sort((left, right) => right[1] - left[1])[0];
  return strongest ? labels[strongest[0]] : "balanced conditions";
}

function limitList(values, limit = 12) {
  return uniqueValues(values).slice(0, limit);
}

function resolveManualCanonicalRows(titles, canonicalRowsByNormalizedTitle) {
  return uniqueValues(titles)
    .map((title) => canonicalRowsByNormalizedTitle.get(normalizeTitle(title)))
    .filter(Boolean);
}

function getResearchRealityProfile(career, stream, directRoute, starterSuggestions, getRoutePreferenceProfile) {
  const baseProfile =
    (directRoute ? getRoutePreferenceProfile(directRoute) : null) ??
    averageProfiles(starterSuggestions.map((suggestion) => getRoutePreferenceProfile(suggestion.route))) ??
    STREAM_REALITY_DEFAULTS[stream] ??
    { earnings: 55, travel: 50, stress: 55, danger: 35 };

  const evidenceText = [
    career.classification,
    career.work_environment,
    career.barriers_to_entry,
    career.professional_registration_required,
    career.current_sa_demand_evidence,
    career.typical_day,
    career.career_progression,
    career.geographic_demand_in_south_africa,
    career.industry_sectors,
  ].join(" ");

  const profile = { ...baseProfile };

  if (includesAny(evidenceText, ["scarce skill", "high-demand", "specialist", "executive", "manager", "regulated", "professional registration", "consulting"])) {
    profile.earnings += 8;
  }
  if (includesAny(evidenceText, ["field", "site", "outdoors", "vehicle", "travel", "community", "client site", "mine", "farm", "port", "construction"])) {
    profile.travel += 10;
  }
  if (includesAny(evidenceText, ["remote", "hybrid", "office"])) {
    profile.travel -= 8;
  }
  if (includesAny(evidenceText, ["emergency", "critical", "deadline", "competitive", "pressure", "public service", "public responsibility", "shift", "security check"])) {
    profile.stress += 10;
  }
  if (includesAny(evidenceText, ["mine", "workshop", "plant", "factory", "emergency", "police", "military", "fire", "hazard", "equipment", "vehicle", "construction", "field site", "outdoors", "security"])) {
    profile.danger += 12;
  }
  if (includesAny(evidenceText, ["office", "administration", "desk-based"])) {
    profile.danger -= 8;
  }

  const clampedProfile = {
    earnings: clamp(profile.earnings),
    travel: clamp(profile.travel),
    stress: clamp(profile.stress),
    danger: clamp(profile.danger),
  };

  return {
    ...clampedProfile,
    earnings_band: realityBand(clampedProfile.earnings),
    travel_band: realityBand(clampedProfile.travel),
    stress_band: realityBand(clampedProfile.stress),
    danger_band: realityBand(clampedProfile.danger),
    strongest_signal: strongestRealitySignal(clampedProfile),
    profile_source: directRoute ? "direct_starter_route_profile" : starterSuggestions.length ? "starter_route_suggestions_average" : "stream_default",
    caution:
      "Qualitative starter-style reality profile derived from linked route structure and research text. Use as a discussion prompt only, not as verified salary, injury-risk or labour-market fact.",
  };
}

function archivePath(relativeFile) {
  return path.join(archiveRoot, relativeFile);
}

function ensureArchive() {
  if (!fs.existsSync(archiveRoot)) {
    throw new Error(`Research archive root not found: ${archiveRoot}`);
  }
}

function pick(row, aliases) {
  for (const alias of aliases) {
    const value = normalizeWhitespace(row[alias]);
    if (value) {
      return value;
    }
  }
  return "";
}

function normaliseResearchRow(row, batchId, hasEnrichment = false) {
  const record = {
    source_batches: batchId,
    has_batch_009_enrichment: hasEnrichment ? "yes" : "no",
    archive_source: archiveSource,
  };

  for (const [field, aliases] of Object.entries(fieldAliases)) {
    record[field] = pick(row, aliases);
  }

  const rawTitle = record.primary_career_name;
  const cleanedTitle = sanitizeResearchTitle(rawTitle);
  record.primary_career_name = cleanedTitle;

  for (const field of [
    "alternative_job_titles",
    "plain_english_career_description",
    "typical_day",
    "entry_level_job_titles",
    "mid_level_job_titles",
    "senior_level_job_titles",
    "career_progression",
  ]) {
    record[field] = sanitizeResearchText(record[field], rawTitle, cleanedTitle);
  }

  record.normalized_career_name = normalizeTitle(record.primary_career_name);
  return record;
}

function chooseBetterText(currentValue, incomingValue) {
  if (!incomingValue) {
    return currentValue;
  }
  if (!currentValue) {
    return incomingValue;
  }
  return incomingValue.length > currentValue.length ? incomingValue : currentValue;
}

function mergeField(field, currentValue, incomingValue) {
  if (listLikeFields.has(field)) {
    return joinUnique([...splitList(currentValue), ...splitList(incomingValue)]);
  }

  if (field === "confidence_score") {
    const currentScore = parseScore(currentValue);
    const incomingScore = parseScore(incomingValue);
    if (currentScore === null) {
      return incomingScore ?? "";
    }
    if (incomingScore === null) {
      return currentScore;
    }
    return Math.max(currentScore, incomingScore);
  }

  if (field === "source_quality_rating") {
    return chooseBetterText(currentValue, incomingValue);
  }

  return chooseBetterText(currentValue, incomingValue);
}

function mergeResearchRecords(baseRecord, incomingRecord) {
  const merged = { ...baseRecord };

  for (const field of Object.keys(fieldAliases)) {
    merged[field] = mergeField(field, merged[field], incomingRecord[field]);
  }

  merged.normalized_career_name = merged.normalized_career_name || incomingRecord.normalized_career_name;
  merged.source_batches = joinUnique([...splitList(merged.source_batches), ...splitList(incomingRecord.source_batches)]);
  merged.has_batch_009_enrichment =
    merged.has_batch_009_enrichment === "yes" || incomingRecord.has_batch_009_enrichment === "yes" ? "yes" : "no";
  merged.archive_source = archiveSource;

  return merged;
}

function representativeScore(record) {
  return (
    (record.has_batch_009_enrichment === "yes" ? 100 : 0) +
    (parseScore(record.confidence_score) ?? 0) * 10 +
    countNonEmptyFields(record, representativeFields)
  );
}

function pickRepresentative(records) {
  return [...records].sort((left, right) => {
    const scoreDifference = representativeScore(right) - representativeScore(left);
    if (scoreDifference !== 0) {
      return scoreDifference;
    }
    return String(left.career_id).localeCompare(String(right.career_id));
  })[0];
}

function keywordStream(title) {
  const normalizedTitle = normalizeTitle(title);

  const rules = [
    { regex: /\b(nurse|midwife|medical|doctor|physician|surgeon|pharmacist|pharmacy|radiologist|radiographer|radiography|physio|physiotherapy|dental|dentist|optometrist|pathologist|psychologist|paramedic|dietitian|speech(?: language)?|therap(?:ist|y)|electrotherapist|clinical|public health|community health|healthcare|social worker|veterinary)\b/, stream: "Health, care and social services" },
    { regex: /\b(aalim|imam|religious|ministry|pastor|chaplain)\b/, stream: "Arts, culture, heritage and society" },
    { regex: /\b(museum|archiv|heritage|translator|interpreter|language|publishing|author|actor|dancer|choreograph|arts)\b/, stream: "Arts, culture, heritage and society" },
    { regex: /\b(design|designer|photograph|videograph|video editor|animat|journal|copywriter|content|radio|podcast|public relations|brand|fashion|interior|makeup|hair)\b/, stream: "Creative, media and design" },
    { regex: /\b(teacher|lecturer|tutor|training|trainer|learning|school|ecd|career advisor|education)\b/, stream: "Education, training and youth development" },
    { regex: /\b(account|audit|tax|finance|bank|insurance|actuar|credit|treasury|payroll|bookkeep)\b/, stream: "Finance, admin and business operations" },
    { regex: /\b(developer|data|cyber|ict|network|cloud|software|system|database|ai|robot|automation|gis|web|ux|ui|scrum|erp|crm)\b/, stream: "Technology, data and AI" },
    { regex: /\b(logistic|supply chain|warehouse|fleet|freight|transport|customs|port|rail|driver|dispatch|courier)\b/, stream: "Logistics, transport and supply chain" },
    { regex: /\b(police|firefighter|correctional|security|legal|attorney|advocate|court|paralegal|municipal|policy|public service|government|compliance|disaster|immigration|forensic|labour)\b/, stream: "Law, public service and public safety" },
    { regex: /\b(farmer|agri|hortic|crop|livestock|conservation|environment|climate|water|wildlife|food|pest|landscape|recycling)\b/, stream: "Agriculture, food and environment" },
    { regex: /\b(sales|marketing|customer|call centre|client|recruit|merchand|category|real estate|outreach|human resource|hr)\b/, stream: "Sales, marketing and customer work" },
    { regex: /\b(hotel|restaurant|waiter|barista|tour|travel|event|wedding|conference|casino|cruise|flight attendant|ground crew|sports|fitness|trainer|chef|reception)\b/, stream: "Hospitality, tourism, sport and events" },
    { regex: /\b(spaza|trader|bakery|car wash|freelance|virtual assistant|repair shop|market stall|childcare provider|cleaning services|garden services|poultry entrepreneur|craft|mobile beauty)\b/, stream: "Informal, entrepreneurship and community economy" },
    { regex: /\b(scientist|research|laboratory|lab |chemist|microbio|biotech|epidemiolog|marine|hydrolog|bioinformatics|astronomy|geolog)\b/, stream: "Science, research and frontier careers" },
    { regex: /\b(engineer|electrician|plumber|boilermaker|welder|fitter|millwright|mechanic|machinist|toolmaker|bricklayer|carpenter|survey|draught|construction|architect|artisan)\b/, stream: "Skilled trades, construction and engineering" },
    { regex: /\b(mining|process|production|quality inspector|metallurg|chemical process|energy|wind turbine|battery|hydrogen|industrial automation|instrumentation)\b/, stream: "Manufacturing, mining and energy" },
  ];

  const match = rules.find((rule) => rule.regex.test(normalizedTitle));
  return match?.stream ?? null;
}

function resolveStarterStream(career, directStarterRoute) {
  if (directStarterRoute) {
    return { stream: directStarterRoute.stream, reason: "starter_route_match" };
  }

  const keywordMatchedStream = keywordStream(career.canonical_career_title);
  if (keywordMatchedStream) {
    return { stream: keywordMatchedStream, reason: "title_keyword" };
  }

  const mappedStream = categoryToStream[career.career_category_primary];
  if (mappedStream) {
    return { stream: mappedStream, reason: "category_map" };
  }

  return { stream: "Sales, marketing and customer work", reason: "fallback_default" };
}

function findStarterRouteMatch(career, starterRoutesByNormalizedTitle) {
  const direct = starterRoutesByNormalizedTitle.get(career.normalized_career_name);
  if (direct) {
    return { route: direct, method: "exact_title" };
  }

  for (const alternativeTitle of splitList(career.alternative_job_titles_pool)) {
    const alternativeRoute = starterRoutesByNormalizedTitle.get(normalizeTitle(alternativeTitle));
    if (alternativeRoute) {
      return { route: alternativeRoute, method: "alternative_title" };
    }
  }

  const aliasedTitle = starterRouteAliasTitles[career.normalized_career_name];
  if (aliasedTitle) {
    const aliasedRoute = starterRoutesByNormalizedTitle.get(normalizeTitle(aliasedTitle));
    if (aliasedRoute) {
      return { route: aliasedRoute, method: "manual_alias" };
    }
  }

  return { route: null, method: "unmatched" };
}

function findStarterSuggestions(career, stream, starterRoutesByStream) {
  const candidates = starterRoutesByStream.get(stream) ?? [];
  const titleInputs = [career.canonical_career_title, ...splitList(career.alternative_job_titles_pool)].filter(Boolean);
  const scoredRoutes = candidates
    .map((route) => {
      let bestScore = 0;
      let bestMatches = 0;

      for (const titleInput of titleInputs) {
        const stats = tokenOverlapStats(titleInput, route.title);
        if (stats.score > bestScore || (stats.score === bestScore && stats.matches > bestMatches)) {
          bestScore = stats.score;
          bestMatches = stats.matches;
        }
      }

      return { route, score: bestScore, matches: bestMatches };
    })
    .filter((candidate) => candidate.score >= 0.45 || candidate.matches >= 2)
    .sort((left, right) => right.score - left.score || right.matches - left.matches || left.route.title.localeCompare(right.route.title))
    .slice(0, 3);

  return scoredRoutes;
}

function buildCanonicalAlternativeLookup(canonicalRows) {
  const lookup = new Map();

  for (const career of canonicalRows) {
    const titles = [
      career.canonical_career_title,
      ...splitList(career.title_variants),
      ...splitList(career.alternative_job_titles_pool),
    ];

    for (const title of titles) {
      const normalized = normalizeTitle(title);
      if (!normalized) {
        continue;
      }
      const ids = lookup.get(normalized) ?? [];
      ids.push(career.canonical_career_id);
      lookup.set(normalized, ids);
    }
  }

  return lookup;
}

function matchTop100Queue(career, top100Rows) {
  const titleCandidates = [
    career.canonical_career_title,
    ...splitList(career.title_variants),
    ...splitList(career.alternative_job_titles_pool),
  ];
  const scoringTitleCandidates = uniqueValues(
    titleCandidates.flatMap((title) => [title, ...String(title).split("/").map((part) => part.trim())])
  );

  const normalizedCandidates = new Set(
    scoringTitleCandidates
      .map((title) => normalizeTitle(title))
      .filter(Boolean)
  );

  const directMatch = top100Rows.find((row) => normalizedCandidates.has(normalizeTitle(row.career_title)));
  if (directMatch) {
    return directMatch;
  }

  const manualMatches = top100Rows
    .map((row) => {
      const manualTitles = MANUAL_TOP100_QUEUE_CANONICAL_TITLES[normalizeTitle(row.career_title)] ?? [];
      if (!manualTitles.some((title) => normalizedCandidates.has(normalizeTitle(title)))) {
        return null;
      }

      let bestScore = 0;
      let bestMatches = 0;
      for (const titleInput of scoringTitleCandidates) {
        const stats = tokenOverlapStats(row.career_title, titleInput);
        if (stats.score > bestScore || (stats.score === bestScore && stats.matches > bestMatches)) {
          bestScore = stats.score;
          bestMatches = stats.matches;
        }
      }

      return { row, score: bestScore, matches: bestMatches };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.matches - left.matches ||
        Number.parseInt(left.row.priority_rank, 10) - Number.parseInt(right.row.priority_rank, 10)
    );

  if (manualMatches.length > 0) {
    return manualMatches[0].row;
  }

  return null;
}

function suggestCanonicalCareersForTop100(queueTitle, canonicalCareerRows) {
  const scored = canonicalCareerRows
    .map((career) => {
      const titleInputs = [career.canonical_career_title, ...splitList(career.title_variants), ...splitList(career.alternative_job_titles_pool)];
      let bestScore = 0;
      let bestMatches = 0;

      for (const titleInput of titleInputs) {
        const stats = tokenOverlapStats(queueTitle, titleInput);
        if (stats.score > bestScore || (stats.score === bestScore && stats.matches > bestMatches)) {
          bestScore = stats.score;
          bestMatches = stats.matches;
        }
      }

      return { career, score: bestScore, matches: bestMatches };
    })
    .filter((candidate) => candidate.score >= 0.45 || candidate.matches >= 2)
    .sort((left, right) => right.score - left.score || right.matches - left.matches || left.career.canonical_career_title.localeCompare(right.career.canonical_career_title))
    .slice(0, 3);

  return scored;
}

ensureArchive();

const careerCatalogModule = await import(pathToFileURL(path.join(root, "src", "data", "careerCatalog.js")).href);
const academicPathwayModule = await import(pathToFileURL(path.join(root, "src", "data", "academicPathwayTemplates.js")).href);
const scoringModule = await import(pathToFileURL(path.join(root, "src", "lib", "scoring.js")).href);
const top100Queue = readCsv(path.join(foundationDir, "careerize_sa_top100_build_queue.csv"));

const starterRoutes = careerCatalogModule.CAREER_ROUTES;
const starterRoutesByNormalizedTitle = new Map(starterRoutes.map((route) => [normalizeTitle(route.title), route]));
const starterRoutesByStream = starterRoutes.reduce((map, route) => {
  const current = map.get(route.stream) ?? [];
  current.push(route);
  map.set(route.stream, current);
  return map;
}, new Map());

const baseRecordsById = new Map();
const manifestRows = [];

for (const definition of batchDefinitions) {
  const rows = readCsv(archivePath(definition.file));
  manifestRows.push({
    archive_path: definition.file,
    file_type: "csv",
    row_count: rows.length,
    purpose: definition.purpose,
  });

  for (const row of rows) {
    const normalized = normaliseResearchRow(row, definition.id);
    baseRecordsById.set(normalized.career_id, normalized);
  }
}

const enrichmentRows = readCsv(archivePath(enrichmentDefinition.file));
manifestRows.push({
  archive_path: enrichmentDefinition.file,
  file_type: "csv",
  row_count: enrichmentRows.length,
  purpose: enrichmentDefinition.purpose,
});

for (const row of enrichmentRows) {
  const enrichmentRecord = normaliseResearchRow(row, enrichmentDefinition.id, true);
  const existingRecord = baseRecordsById.get(enrichmentRecord.career_id);
  if (existingRecord) {
    baseRecordsById.set(enrichmentRecord.career_id, mergeResearchRecords(existingRecord, enrichmentRecord));
  }
}

for (const file of archiveManifestFiles.filter((item) => item.type !== "csv")) {
  manifestRows.push({
    archive_path: file.file,
    file_type: file.type,
    row_count: "",
    purpose: file.purpose,
  });
}

manifestRows.sort((left, right) => left.archive_path.localeCompare(right.archive_path));

const rawMasterRows = [...baseRecordsById.values()].sort((left, right) => left.career_id.localeCompare(right.career_id));

const groupedByNormalizedTitle = rawMasterRows.reduce((map, record) => {
  const key = record.normalized_career_name;
  const current = map.get(key) ?? [];
  current.push(record);
  map.set(key, current);
  return map;
}, new Map());

const duplicateGroupRows = [];
const canonicalRows = [];

for (const [normalizedTitle, records] of [...groupedByNormalizedTitle.entries()].sort((left, right) => left[0].localeCompare(right[0]))) {
  const representative = pickRepresentative(records);
  const mergedRecord = records.slice(1).reduce((current, record) => mergeResearchRecords(current, record), { ...records[0] });
  const canonicalCareerId = `za-career-${slugify(representative.primary_career_name)}`;
  const titleVariants = joinUnique(records.map((record) => record.primary_career_name));
  const categoryVariants = joinUnique(records.map((record) => record.career_category));
  const alternativeTitlePool = joinUnique(records.flatMap((record) => splitList(record.alternative_job_titles)));

  const canonicalRecord = {
    canonical_career_id: canonicalCareerId,
    canonical_career_title: representative.primary_career_name,
    normalized_career_name: normalizedTitle,
    duplicate_record_count: records.length,
    raw_career_ids: joinUnique(records.map((record) => record.career_id)),
    title_variants: titleVariants,
    alternative_job_titles_pool: alternativeTitlePool,
    career_category_primary: representative.career_category,
    career_category_variants: categoryVariants,
    industry_sectors: mergedRecord.industry_sectors,
    classification: mergedRecord.classification,
    plain_english_career_description: mergedRecord.plain_english_career_description,
    typical_day: mergedRecord.typical_day,
    work_environment: mergedRecord.work_environment,
    who_this_career_suits: mergedRecord.who_this_career_suits,
    school_subjects_helpful: mergedRecord.school_subjects_helpful,
    minimum_education_pathway: mergedRecord.minimum_education_pathway,
    preferred_education_pathway: mergedRecord.preferred_education_pathway,
    alternative_entry_pathways: mergedRecord.alternative_entry_pathways,
    nqf_level_where_relevant: mergedRecord.nqf_level_where_relevant,
    professional_registration_required: mergedRecord.professional_registration_required,
    key_skills_needed: mergedRecord.key_skills_needed,
    tools_technologies_used: mergedRecord.tools_technologies_used,
    entry_level_job_titles: mergedRecord.entry_level_job_titles,
    mid_level_job_titles: mergedRecord.mid_level_job_titles,
    senior_level_job_titles: mergedRecord.senior_level_job_titles,
    career_progression: mergedRecord.career_progression,
    related_careers_pool: joinUnique(records.flatMap((record) => splitList(record.related_careers))),
    current_sa_demand_evidence: mergedRecord.current_sa_demand_evidence,
    outlook_2030: mergedRecord.outlook_2030,
    automation_ai_impact: mergedRecord.automation_ai_impact,
    geographic_demand_in_south_africa: mergedRecord.geographic_demand_in_south_africa,
    salary_range: mergedRecord.salary_range,
    barriers_to_entry: mergedRecord.barriers_to_entry,
    opportunities_for_entrepreneurship: mergedRecord.opportunities_for_entrepreneurship,
    inclusion_notes: mergedRecord.inclusion_notes,
    source_links_pool: joinUnique(records.flatMap((record) => splitList(record.source_links))),
    source_quality_rating: mergedRecord.source_quality_rating,
    confidence_score: mergedRecord.confidence_score,
    has_batch_009_enrichment: mergedRecord.has_batch_009_enrichment,
    source_batches: mergedRecord.source_batches,
    archive_source: archiveSource,
  };

  canonicalRows.push(canonicalRecord);

  if (records.length > 1) {
    duplicateGroupRows.push({
      canonical_career_id: canonicalCareerId,
      canonical_career_title: representative.primary_career_name,
      normalized_career_name: normalizedTitle,
      duplicate_record_count: records.length,
      raw_career_ids: canonicalRecord.raw_career_ids,
      title_variants: titleVariants,
      career_category_variants: categoryVariants,
      source_batches: canonicalRecord.source_batches,
      has_batch_009_enrichment: canonicalRecord.has_batch_009_enrichment,
    });
  }
}

canonicalRows.sort((left, right) => left.canonical_career_title.localeCompare(right.canonical_career_title));
duplicateGroupRows.sort((left, right) => right.duplicate_record_count - left.duplicate_record_count || left.canonical_career_title.localeCompare(right.canonical_career_title));

const canonicalLookup = new Map(canonicalRows.map((career) => [career.normalized_career_name, career]));
const canonicalAltLookup = buildCanonicalAlternativeLookup(canonicalRows);

const alignmentRows = [];
const realityProfileRows = [];
const graphNodes = [];
const graphEdges = [];
const top100GapRows = [];

const streamNodes = uniqueValues(starterRoutes.map((route) => route.stream)).map((stream) => ({
  node_id: `starter-stream:${slugify(stream)}`,
  node_type: "starter_stream",
  label: stream,
  layer: "starter_catalog",
  source_ref: "src/data/careerCatalog.js",
  notes: "Careerize learner-facing macro stream.",
}));

const pathwayTemplateNodes = uniqueValues(
  streamNodes.map((node) => {
    const template = academicPathwayModule.STREAM_TO_PATHWAY_TEMPLATE[node.label];
    return `${template.kind}:${template.profile}`;
  })
).map((templateKey) => {
  const [kind, profile] = templateKey.split(":");
  return {
    node_id: `pathway-template:${kind}:${profile}`,
    node_type: "pathway_template",
    label: `${kind}:${profile}`,
    layer: "pathway_engine",
    source_ref: "src/data/academicPathwayTemplates.js",
    notes: "Careerize Grade 10 to qualification pathway template.",
  };
});

const researchCategoryNodes = uniqueValues(canonicalRows.map((career) => career.career_category_primary)).map((category) => ({
  node_id: `research-category:${slugify(category)}`,
  node_type: "research_category",
  label: category,
  layer: "sa_foundation_research",
  source_ref: archiveSource,
  notes: "Primary research taxonomy category from the research archive.",
}));

const staticGraphNodes = [
  ...streamNodes,
  ...pathwayTemplateNodes,
  ...researchCategoryNodes,
  ...starterRoutes.map((route) => ({
    node_id: `starter-route:${route.id}`,
    node_type: "starter_route",
    label: route.title,
    layer: "starter_catalog",
    source_ref: "src/data/careerCatalog.js",
    notes: route.stream,
  })),
  {
    node_id: "backlog:top100_priority_queue",
    node_type: "backlog",
    label: "Top 100 priority queue",
    layer: "sa_foundation",
    source_ref: "data/sa-foundation/careerize_sa_top100_build_queue.csv",
    notes: "Priority enrichment backlog imported earlier in the foundation layer.",
  },
  {
    node_id: "enrichment-batch:009",
    node_type: "enrichment_batch",
    label: "Batch 009 enrichment",
    layer: "sa_foundation_research",
    source_ref: archiveSource,
    notes: "Priority scarce and high-demand enrichment pass from the research archive.",
  },
];

for (const career of canonicalRows) {
  const directMatch = findStarterRouteMatch(career, starterRoutesByNormalizedTitle);
  const streamResolution = resolveStarterStream(career, directMatch.route);
  const mappedTemplate = academicPathwayModule.STREAM_TO_PATHWAY_TEMPLATE[streamResolution.stream];
  const pathwayPlan = academicPathwayModule.getAcademicPathwayPlan({
    title: career.canonical_career_title,
    stream: streamResolution.stream,
    kind: mappedTemplate.kind,
    profile: mappedTemplate.profile,
  });
  const starterSuggestions = directMatch.route ? [] : findStarterSuggestions(career, streamResolution.stream, starterRoutesByStream);
  const realityProfile = getResearchRealityProfile(
    career,
    streamResolution.stream,
    directMatch.route,
    starterSuggestions,
    scoringModule.getRoutePreferenceProfile
  );
  const relatedCareerIds = uniqueValues(
    splitList(career.related_careers_pool)
      .flatMap((title) => canonicalAltLookup.get(normalizeTitle(title)) ?? [])
      .filter((careerId) => careerId !== career.canonical_career_id)
  );
  const top100Match = matchTop100Queue(career, top100Queue);

  alignmentRows.push({
    canonical_career_id: career.canonical_career_id,
    canonical_career_title: career.canonical_career_title,
    research_category_primary: career.career_category_primary,
    duplicate_record_count: career.duplicate_record_count,
    raw_career_ids: career.raw_career_ids,
    matched_starter_route_id: directMatch.route?.id ?? "",
    matched_starter_route_title: directMatch.route?.title ?? "",
    starter_route_match_method: directMatch.method,
    suggested_starter_route_ids: joinUnique(starterSuggestions.map((suggestion) => suggestion.route.id)),
    suggested_starter_route_titles: joinUnique(starterSuggestions.map((suggestion) => suggestion.route.title)),
    starter_stream: streamResolution.stream,
    starter_stream_reason: streamResolution.reason,
    pathway_template_kind: mappedTemplate.kind,
    pathway_template_profile: mappedTemplate.profile,
    pathway_plan_id: pathwayPlan.pathwayPlanId,
    qualification_route_types: joinUnique(pathwayPlan.qualificationRoutes.map((route) => route.type)),
    grade10_required_or_strongly_recommended_subjects: joinUnique(pathwayPlan.grade10Subjects.requiredOrStronglyRecommended),
    grade10_recommended_subjects: joinUnique(pathwayPlan.grade10Subjects.recommended),
    grade10_avoid_dropping_subjects: joinUnique(pathwayPlan.grade10Subjects.avoidDropping),
    maths_gate: pathwayPlan.grade10Subjects.mathsGate,
    science_gate: pathwayPlan.grade10Subjects.scienceGate,
    trade_route_flag: pathwayPlan.tradeRouteFlag ? "yes" : "no",
    regulated_or_professional_route: pathwayPlan.regulatedOrProfessionalRoute ? "yes" : "no",
    related_canonical_career_ids: joinUnique(relatedCareerIds),
    related_canonical_career_titles: joinUnique(relatedCareerIds.map((careerId) => canonicalRows.find((row) => row.canonical_career_id === careerId)?.canonical_career_title ?? "")),
    top100_priority_rank: top100Match?.priority_rank ?? "",
    top100_next_action: top100Match?.next_action ?? "",
    has_batch_009_enrichment: career.has_batch_009_enrichment,
    reality_profile_source: realityProfile.profile_source,
    strongest_reality_signal: realityProfile.strongest_signal,
    earnings_signal_score: realityProfile.earnings,
    earnings_signal_band: realityProfile.earnings_band,
    travel_signal_score: realityProfile.travel,
    travel_signal_band: realityProfile.travel_band,
    stress_signal_score: realityProfile.stress,
    stress_signal_band: realityProfile.stress_band,
    danger_signal_score: realityProfile.danger,
    danger_signal_band: realityProfile.danger_band,
  });

  realityProfileRows.push({
    canonical_career_id: career.canonical_career_id,
    canonical_career_title: career.canonical_career_title,
    starter_stream: streamResolution.stream,
    pathway_template_kind: mappedTemplate.kind,
    pathway_template_profile: mappedTemplate.profile,
    reality_profile_source: realityProfile.profile_source,
    strongest_reality_signal: realityProfile.strongest_signal,
    earnings_signal_score: realityProfile.earnings,
    earnings_signal_band: realityProfile.earnings_band,
    travel_signal_score: realityProfile.travel,
    travel_signal_band: realityProfile.travel_band,
    stress_signal_score: realityProfile.stress,
    stress_signal_band: realityProfile.stress_band,
    danger_signal_score: realityProfile.danger,
    danger_signal_band: realityProfile.danger_band,
    caution: realityProfile.caution,
  });

  graphNodes.push({
    node_id: `career:${career.canonical_career_id}`,
    node_type: "canonical_career",
    label: career.canonical_career_title,
    layer: "sa_foundation_research",
    source_ref: archiveSource,
    notes: career.career_category_primary,
  });

  graphEdges.push(
    {
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `research-category:${slugify(career.career_category_primary)}`,
      edge_type: "classified_as_research_category",
      confidence: career.confidence_score,
      notes: career.career_category_primary,
    },
    {
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `starter-stream:${slugify(streamResolution.stream)}`,
      edge_type: "mapped_to_starter_stream",
      confidence: career.confidence_score,
      notes: streamResolution.reason,
    },
    {
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `pathway-template:${mappedTemplate.kind}:${mappedTemplate.profile}`,
      edge_type: "uses_pathway_template",
      confidence: academicPathwayModule.ACADEMIC_PATHWAY_TEMPLATE_SUMMARY.verificationStatus,
      notes: pathwayPlan.pathwayPlanId,
    }
  );

  if (directMatch.route) {
    graphEdges.push({
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `starter-route:${directMatch.route.id}`,
      edge_type: "aligned_to_starter_route",
      confidence: career.confidence_score,
      notes: directMatch.method,
    });
  }

  for (const suggestion of starterSuggestions) {
    graphEdges.push({
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `starter-route:${suggestion.route.id}`,
      edge_type: "suggested_starter_route",
      confidence: suggestion.score.toFixed(2),
      notes: streamResolution.stream,
    });
  }

  for (const relatedCareerId of relatedCareerIds) {
    graphEdges.push({
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: `career:${relatedCareerId}`,
      edge_type: "related_career",
      confidence: career.confidence_score,
      notes: "Matched from research related-careers field.",
    });
  }

  if (top100Match) {
    graphEdges.push({
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: "backlog:top100_priority_queue",
      edge_type: "queued_for_enrichment",
      confidence: top100Match.priority_rank,
      notes: `${top100Match.priority_rank}:${top100Match.next_action}`,
    });
  }

  if (career.has_batch_009_enrichment === "yes") {
    graphEdges.push({
      source_node_id: `career:${career.canonical_career_id}`,
      target_node_id: "enrichment-batch:009",
      edge_type: "enriched_in_batch_009",
      confidence: career.confidence_score,
      notes: "Priority record improved by Batch 009.",
    });
  }
}

const allGraphNodes = [...staticGraphNodes, ...graphNodes].sort((left, right) => left.node_id.localeCompare(right.node_id));
const starterRouteLinkRows = starterRoutes.map((route) => {
  const directRows = alignmentRows.filter((row) => row.matched_starter_route_id === route.id);
  const suggestedRows = alignmentRows.filter((row) =>
    String(row.suggested_starter_route_ids || "")
      .split(" | ")
      .map((value) => value.trim())
      .filter(Boolean)
      .includes(route.id)
  );
  const manualCuratedRows =
    directRows.length === 0 && suggestedRows.length === 0
      ? resolveManualCanonicalRows(MANUAL_STARTER_ROUTE_CURATED_RESEARCH_TITLES[route.id] ?? [], canonicalLookup)
      : [];
  const template = academicPathwayModule.STREAM_TO_PATHWAY_TEMPLATE[route.stream] ?? { kind: "people", profile: "mixed" };
  const directRanks = limitList(directRows.map((row) => row.top100_priority_rank).filter(Boolean));
  const coverageStatus =
    directRows.length > 0
      ? "direct_match"
      : suggestedRows.length > 0
        ? "suggestion_only"
        : manualCuratedRows.length > 0
          ? "manual_curated_link"
          : "no_research_link";

  for (const manualRow of manualCuratedRows) {
    graphEdges.push({
      source_node_id: `career:${manualRow.canonical_career_id}`,
      target_node_id: `starter-route:${route.id}`,
      edge_type: "curated_starter_route_link",
      confidence: "manual_curated",
      notes: "Curated route-family link added after gap review.",
    });
  }

  return {
    starter_route_id: route.id,
    starter_route_title: route.title,
    starter_stream: route.stream,
    pathway_template_kind: template.kind,
    pathway_template_profile: template.profile,
    coverage_status: coverageStatus,
    direct_canonical_career_count: directRows.length,
    direct_canonical_career_ids: joinUnique(limitList(directRows.map((row) => row.canonical_career_id))),
    direct_canonical_career_titles: joinUnique(limitList(directRows.map((row) => row.canonical_career_title))),
    direct_research_categories: joinUnique(limitList(directRows.map((row) => row.research_category_primary))),
    direct_top100_priority_ranks: joinUnique(directRanks),
    suggested_canonical_career_count: suggestedRows.length,
    suggested_canonical_career_ids: joinUnique(limitList(suggestedRows.map((row) => row.canonical_career_id))),
    suggested_canonical_career_titles: joinUnique(limitList(suggestedRows.map((row) => row.canonical_career_title))),
    suggested_research_categories: joinUnique(limitList(suggestedRows.map((row) => row.research_category_primary))),
    manual_curated_canonical_career_count: manualCuratedRows.length,
    manual_curated_canonical_career_ids: joinUnique(limitList(manualCuratedRows.map((row) => row.canonical_career_id))),
    manual_curated_canonical_career_titles: joinUnique(limitList(manualCuratedRows.map((row) => row.canonical_career_title))),
    manual_curated_research_categories: joinUnique(limitList(manualCuratedRows.map((row) => row.career_category_primary))),
    research_reality_profile_available: directRows.length > 0 || suggestedRows.length > 0 || manualCuratedRows.length > 0 ? "yes" : "no",
  };
});

const starterRouteGapRows = starterRouteLinkRows
  .filter((row) => row.coverage_status === "no_research_link")
  .map((row) => ({
    starter_route_id: row.starter_route_id,
    starter_route_title: row.starter_route_title,
    starter_stream: row.starter_stream,
    pathway_template_kind: row.pathway_template_kind,
    pathway_template_profile: row.pathway_template_profile,
    reason: "starter_route_has_no_direct_or_suggested_research_alignment_yet",
  }));

const linkedTop100Ranks = new Set(alignmentRows.filter((row) => row.top100_priority_rank).map((row) => row.top100_priority_rank));
for (const queueRow of top100Queue.filter((row) => !linkedTop100Ranks.has(row.priority_rank))) {
  const candidates = suggestCanonicalCareersForTop100(queueRow.career_title, canonicalRows);
  top100GapRows.push({
    priority_rank: queueRow.priority_rank,
    career_title: queueRow.career_title,
    cluster: queueRow.cluster,
    next_action: queueRow.next_action,
    candidate_canonical_career_ids: joinUnique(candidates.map((candidate) => candidate.career.canonical_career_id)),
    candidate_canonical_career_titles: joinUnique(candidates.map((candidate) => candidate.career.canonical_career_title)),
    candidate_scores: joinUnique(candidates.map((candidate) => candidate.score.toFixed(2))),
    reason: candidates.length > 0 ? "needs_manual_title_normalisation" : "no_safe_research_candidate_found",
  });
}

const graphSummaryRows = [];
const allGraphEdges = graphEdges.sort((left, right) => left.source_node_id.localeCompare(right.source_node_id) || left.edge_type.localeCompare(right.edge_type) || left.target_node_id.localeCompare(right.target_node_id));

for (const [nodeType, count] of Object.entries(allGraphNodes.reduce((counts, node) => {
  counts[node.node_type] = (counts[node.node_type] ?? 0) + 1;
  return counts;
}, {}))) {
  graphSummaryRows.push({ summary_type: "node_type", name: nodeType, count });
}

for (const [edgeType, count] of Object.entries(allGraphEdges.reduce((counts, edge) => {
  counts[edge.edge_type] = (counts[edge.edge_type] ?? 0) + 1;
  return counts;
}, {}))) {
  graphSummaryRows.push({ summary_type: "edge_type", name: edgeType, count });
}

graphSummaryRows.push(
  { summary_type: "dataset", name: "raw_research_records", count: rawMasterRows.length },
  { summary_type: "dataset", name: "canonical_careers", count: canonicalRows.length },
  { summary_type: "dataset", name: "duplicate_groups", count: duplicateGroupRows.length },
  {
    summary_type: "dataset",
    name: "direct_starter_route_alignments",
    count: alignmentRows.filter((row) => row.matched_starter_route_id).length,
  },
  {
    summary_type: "dataset",
      name: "top100_linked_careers",
    count: alignmentRows.filter((row) => row.top100_priority_rank).length,
  },
  {
    summary_type: "dataset",
    name: "research_reality_profiles",
    count: realityProfileRows.length,
  },
  {
    summary_type: "dataset",
    name: "starter_routes_with_direct_research_alignment",
    count: starterRouteLinkRows.filter((row) => row.coverage_status === "direct_match").length,
  },
  {
    summary_type: "dataset",
    name: "starter_routes_with_any_research_link",
    count: starterRouteLinkRows.filter((row) => row.coverage_status !== "no_research_link").length,
  },
  {
    summary_type: "dataset",
    name: "starter_routes_with_curated_research_link",
    count: starterRouteLinkRows.filter((row) => row.coverage_status === "manual_curated_link").length,
  },
  {
    summary_type: "dataset",
    name: "starter_routes_without_research_link",
    count: starterRouteGapRows.length,
  }
);

writeCsv(path.join(foundationDir, "careerize_sa_research_archive_manifest.csv"), manifestRows, ["archive_path", "file_type", "row_count", "purpose"]);
writeCsv(path.join(foundationDir, "careerize_sa_research_raw_master.csv"), rawMasterRows);
writeCsv(path.join(foundationDir, "careerize_sa_research_canonical_careers.csv"), canonicalRows);
writeCsv(path.join(foundationDir, "careerize_sa_research_duplicate_groups.csv"), duplicateGroupRows);
writeCsv(path.join(foundationDir, "careerize_sa_research_alignment.csv"), alignmentRows);
writeCsv(path.join(foundationDir, "careerize_sa_research_reality_profiles.csv"), realityProfileRows);
writeCsv(path.join(foundationDir, "careerize_sa_starter_route_research_links.csv"), starterRouteLinkRows);
writeCsv(path.join(foundationDir, "careerize_sa_starter_route_research_gaps.csv"), starterRouteGapRows);
writeCsv(path.join(foundationDir, "careerize_sa_top100_research_gaps.csv"), top100GapRows);
writeCsv(path.join(foundationDir, "careerize_sa_research_graph_nodes.csv"), allGraphNodes);
writeCsv(path.join(foundationDir, "careerize_sa_research_graph_edges.csv"), allGraphEdges);
writeCsv(path.join(foundationDir, "careerize_sa_research_graph_summary.csv"), graphSummaryRows, ["summary_type", "name", "count"]);

console.log(
  `Generated SA research foundation layer: ${rawMasterRows.length} raw records, ${canonicalRows.length} canonical careers, ${duplicateGroupRows.length} duplicate groups and ${allGraphEdges.length} graph edges.`
);
