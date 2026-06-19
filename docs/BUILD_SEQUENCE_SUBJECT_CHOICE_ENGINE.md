# Subject-Choice Engine Build Sequence

Date: 2026-06-18  
Status: implementation roadmap

## Goal

Build Careerize as a subject-choice-to-career pathway engine for South African learners before attempting to publish a fully exhaustive qualification database.

The sequence below prevents the product from becoming an unverified course directory. The learner value comes from showing what a learner's subjects and marks keep open, what they may close, and what verified routes are available next.

## Phase 1: Product spine

Build or confirm:

- learner profile fields for grade, subjects, estimated marks, location and route preferences
- career clusters
- school subject taxonomy
- qualification route taxonomy
- NQF-aware qualification schema
- source and verification statuses
- accreditation warning model

Definition of done:

- The repo has a documented data model.
- Each public claim has a place to store source URL, access date and verification status.
- The UI can separate broad guidance from source-backed entry requirements.

## Phase 2: Subject-choice rules

Build the first ruleset for Grade 10-12 subject planning.

Rules must include:

- Mathematics
- Mathematical Literacy
- Physical Sciences
- Life Sciences
- Accounting
- Business Studies
- Economics
- CAT
- Information Technology
- Engineering Graphics and Design
- Geography
- Agricultural Sciences
- Tourism
- Consumer Studies
- Visual Arts
- Design
- Dramatic Arts
- History
- Languages

Definition of done:

- A learner can enter subjects and see pathway warnings.
- Careerize shows green, amber and red pathway impact.
- No rule is presented as absolute unless provider-specific evidence supports it.

## Phase 3: First 100 source-backed careers

Use the existing Top 100 queue in `data/sa-foundation/` to enrich priority careers.

For each career, add:

- career reality profile
- required and recommended subjects
- route map
- at least one verified qualification route
- first-work entry roles
- further study options
- source status

Definition of done:

- 100 profiles are no longer only starter/editorial records.
- Each enriched profile has source-backed pathway information.

## Phase 4: Qualification pathway import

Build structured rows for qualification options, starting with high-value learner decisions:

1. University route
2. University of Technology and diploma route
3. TVET, trade and artisan route
4. Learnership and workplace route
5. Professional body route
6. Vendor certification and self-study route

Definition of done:

- The database can answer: which qualification routes can lead to this career?
- Provider-specific APS and entry requirements are not blended into generic claims.
- Unknown requirements remain marked as not publicly confirmed or varies by institution.

## Phase 5: Learner-facing pathway view

Build a page or component that shows:

- current learner subject profile
- careers unlocked
- careers still possible
- careers at risk
- careers likely blocked for specific routes
- required next checks
- recommended school conversation prompts

Definition of done:

- A Grade 9 or Grade 10 learner can understand why a subject choice matters.
- A parent or teacher can see the logic and challenge it.
- The app does not make irreversible claims about the learner's future.

## Phase 6: Accreditation checker

Add a learner-friendly accreditation checklist.

Checklist should include:

- SAQA registration / NQF record where applicable
- DHET registration for private providers
- CHE accreditation for higher education programmes
- QCTO accreditation for occupational qualifications and trades
- SETA accreditation for learnership routes where applicable
- professional body recognition
- vendor certification validity and retirement status

Definition of done:

- Learners are warned not to enrol in unverified courses.
- Vendor certifications such as old Microsoft MCSA/MCSE/MCSD are not displayed as current without retirement notes.

## Phase 7: Full qualification expansion

Only after the rules and verification workflow exist, expand toward a comprehensive qualification map.

Expansion order:

1. IT, cybersecurity and data routes
2. Engineering, built environment and trades
3. Finance, accounting, banking and insurance
4. Healthcare, nursing and social services
5. Education and teaching
6. Business, management and entrepreneurship
7. Law and public safety
8. Agriculture and environment
9. Logistics, aviation and maritime
10. Hospitality, tourism and culinary
11. Creative, design, media and communications
12. Sports, wellness, beauty and personal care
13. Energy, mining, manufacturing and automotive

Definition of done:

- Every row has source URL and verification status.
- No manufactured qualification names, APS scores or provider claims are allowed.
- Retired or discontinued qualifications are marked clearly.

## Immediate next engineering tasks

1. Add a normalised `subjectRules` data file.
2. Add a `qualificationPathways` data file or database seed format.
3. Add validation scripts to require source URL, access date and verification status for public qualification claims.
4. Add a learner subject-profile component.
5. Add a pathway-risk component that shows green/amber/red route impact.
6. Add a detail view for one career that works backwards from career to Grade 10 subject choice.
