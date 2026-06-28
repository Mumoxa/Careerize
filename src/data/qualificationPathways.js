const pathway = (id, name, type, routeType, nqfLevel, appliesTo, caution) => ({
  id,
  name,
  type,
  routeType,
  nqfLevel,
  appliesTo,
  entryRequirements: "Varies by institution or awarding body",
  verificationStatus: "varies_by_institution",
  confidenceScore: 35,
  sourceUrl: "provider_or_awarding_body_source_required",
  accessDate: null,
  caution,
});

// These are qualification families, not invented provider programmes. Exact programme
// names, APS values and accreditation may only be added once an official source is linked.
export const QUALIFICATION_PATHWAYS = [
  pathway("digital-degree", "Relevant computing, information systems, data or digital degree", "Bachelor's Degree", "university", "6-8", ["Technology, data and AI"], "Mathematics requirements differ by programme."),
  pathway("digital-diploma", "Relevant ICT diploma or higher certificate", "Diploma / Higher Certificate", "university_of_technology", "5-7", ["Technology, data and AI"], "Verify the exact programme and provider accreditation."),
  pathway("digital-vendor", "Relevant vendor certificate, portfolio or workplace route", "Vendor Certificate / Portfolio Route", "vendor_certification", "Non-NQF or varies", ["Technology, data and AI"], "Vendor certificates can change or retire; verify current status."),
  pathway("finance-formal", "Relevant accounting, finance, business or administration qualification", "Higher Certificate / Diploma / Bachelor's Degree", "university", "5-8", ["Finance, admin and business operations"], "Professional designations have separate body requirements."),
  pathway("trade-apprentice", "Relevant occupational certificate, apprenticeship and trade test", "Occupational Certificate / Apprenticeship / Trade Test", "trade", "Varies", ["Skilled trades, construction and engineering", "Manufacturing, mining and energy"], "Confirm QCTO or trade-specific requirements."),
  pathway("engineering-formal", "Relevant engineering, built-environment or technology qualification", "Diploma / Bachelor's Degree", "university_of_technology", "6-8", ["Skilled trades, construction and engineering", "Manufacturing, mining and energy"], "Mathematics, science and professional recognition vary by route."),
  pathway("health-formal", "Relevant registered health, care or social-service qualification", "Higher Certificate / Diploma / Bachelor's Degree / Occupational Certificate", "university", "5-8", ["Health, care and social services"], "Check programme accreditation and professional registration before applying."),
  pathway("education-formal", "Relevant teaching, ECD, training or education qualification", "Higher Certificate / Diploma / Bachelor's Degree", "university", "5-8", ["Education, training and youth development"], "Teacher registration and role requirements differ."),
  pathway("agri-environment", "Relevant agriculture, food, conservation or environmental qualification", "Certificate / Diploma / Bachelor's Degree", "tvet", "4-8", ["Agriculture, food and environment"], "The required science subjects depend on the programme."),
  pathway("logistics", "Relevant logistics, transport or supply-chain qualification", "Occupational Certificate / Diploma / Bachelor's Degree", "tvet", "4-8", ["Logistics, transport and supply chain"], "Licences and role-specific certificates may also be required."),
  pathway("law-public", "Relevant legal, public administration, safety or compliance qualification", "Higher Certificate / Diploma / Bachelor's Degree", "university", "5-8", ["Law, public service and public safety"], "Public-service and regulated roles can have separate selection requirements."),
  pathway("creative", "Relevant creative qualification plus portfolio or practical evidence", "Certificate / Diploma / Bachelor's Degree / Portfolio Route", "portfolio", "Varies", ["Creative, media and design", "Arts, culture, heritage and society"], "Portfolio expectations and auditions vary by provider and role."),
  pathway("commercial", "Relevant marketing, sales, service or business qualification", "Certificate / Diploma / Bachelor's Degree / Workplace Route", "workplace", "Varies", ["Sales, marketing and customer work"], "Many roles accept workplace evidence; regulated roles may not."),
  pathway("hospitality", "Relevant hospitality, tourism, culinary, sport or events qualification", "Certificate / Diploma / Occupational Certificate", "tvet", "4-7", ["Hospitality, tourism, sport and events"], "Practical hours, licences or registrations can apply."),
  pathway("enterprise", "Relevant enterprise training, occupational learning or workplace route", "Short Course / Occupational Certificate / Workplace Route", "workplace", "Varies", ["Informal, entrepreneurship and community economy"], "A qualification does not guarantee business viability; test demand and costs."),
  pathway("science", "Relevant science, research or technical qualification", "Diploma / Bachelor's Degree / Postgraduate Degree", "university", "6-10", ["Science, research and frontier careers"], "Many specialist roles require postgraduate study; verify the exact route."),
];

export function getQualificationPathways(route) {
  return QUALIFICATION_PATHWAYS.filter((item) => item.appliesTo.includes(route.stream));
}

