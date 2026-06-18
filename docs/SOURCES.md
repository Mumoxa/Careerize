# Careerize Sources Registry

This registry records sources that Careerize content is allowed to cite. The current update intentionally does **not** add unsupported detailed salary, demand or provider-specific eligibility claims.

## Internal methodology / editorial scaffold

- Careerize subject-to-career engine — `docs/SUBJECT_TO_CAREER_ENGINE.md` — accessed 2026-06-18 — confidence: 70 — supports corrected product strategy, learner journey and subject-choice decision model.
- Careerize qualification pathway data model — `docs/QUALIFICATION_PATHWAY_DATA_MODEL.md` — accessed 2026-06-18 — confidence: 70 — supports schema design, route types, verification statuses and non-hallucination rules.
- Careerize build sequence — `docs/BUILD_SEQUENCE_SUBJECT_CHOICE_ENGINE.md` — accessed 2026-06-18 — confidence: 70 — supports staged implementation order.
- Careerize strategy and repository scope — `docs/strategy-and-repo-scope.md` — accessed 2026-06-15 — confidence: 60 — supports product boundary, editorial rules and learner-owned data principles.
- Careerize market insights decision log — `docs/market-insights-decision-log.md` — accessed 2026-06-15 — confidence: 60 — supports implementation decisions and source/confidence scaffolding.
- Careerize editorial starter profiles — `src/data/careerCatalog.js` — accessed 2026-06-15 — confidence: 55 — supports demo/starter career reality content and qualitative earning-potential guidance only.

## External public sources required before publishing qualification or entry-requirement claims

These are authoritative source categories, not a completed imported dataset:

- SAQA / NQF records — qualification registration, NQF level, credits and formal status.
- DHET sources — public universities, TVET colleges, private institution registration and official post-school education context.
- CHE sources — accreditation and recognition of higher education programmes.
- QCTO sources — occupational qualifications, trade certificates, skills programmes, accredited skills development providers and assessment centres.
- Umalusi sources — school, NSC, NCV and GENFETQSF context where relevant.
- SETA sources — learnerships, sector-aligned workplace learning and sector skills context.
- Official institution prospectuses and programme pages — APS, required subjects, entry requirements, duration, campus and mode.
- Professional body websites — professional routes, exams, membership, designation requirements and recognition.
- Vendor certification websites — current vendor certificate names, retired credentials and exam pathways.

## Vendor certification rule

Vendor certifications are allowed in Careerize only when clearly separated from NQF qualifications unless a formal NQF mapping is source-verified.

Examples of vendor source categories:

- CompTIA for A+, Network+, Security+ and related IT credentials.
- Microsoft Learn for current Microsoft credentials and retired certification status.
- Cisco for CCST, CCNA, CCNP and related networking credentials.
- AWS, Google Cloud and Azure for cloud certifications.
- Oracle, SAP and Salesforce for vendor-specific enterprise technology certifications.

Older Microsoft certifications such as MCSA, MCSD and MCSE must not be shown as current routes unless the row is explicitly marked as retired/discontinued or historical and linked to Microsoft retirement guidance.

## Rule

Careerize should stay away from detailed salary information for now. No Careerize page should display salary numbers, salary bands, demand strength, qualification eligibility, APS, subject thresholds or employment outcomes unless the underlying record has:

- source URL
- access date
- provider or awarding body
- verification status
- confidence score

The default product pattern is qualitative earning-potential insight and pathway guidance, not pay-detail publishing or unverified eligibility claims.
