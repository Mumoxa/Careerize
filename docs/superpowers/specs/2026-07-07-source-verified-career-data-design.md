# Source-Verified Career Data Design

## Goal

Replace Careerize's learner-facing placeholder/starter career information with a source-verification workflow that only promotes factual claims when each claim has traceable evidence, an access date, a verification status and a confidence score.

## Current Repository Evidence

- `src/data/careerCatalog.js` generates 1,050 live career routes from stream presets.
- `CAREER_COVERAGE_SUMMARY.sourceVerifiedProfileCount` is currently `0`.
- All 1,050 live routes currently have `status: "starter-profile"`.
- All 1,050 live routes currently have `demand.status: "not-source-verified"`.
- All 1,050 generated academic pathway records currently have `verificationStatus: "template_linked_needs_provider_verification"`.
- `data/sa-foundation/careerize_sa_top100_build_queue.csv` already defines the first 100 careers to convert from starter records into source-backed records.
- `data/sa-foundation/careerize_sa_research_canonical_careers.csv` and `data/sa-foundation/careerize_sa_research_raw_master.csv` contain research-archive rows, but those rows are working research data, not automatic permission to publish claims.
- `data/sa-foundation/qualification_pathway_schema.csv` defines the required provider/qualification verification fields.
- The canonical Mumoxa `Mumoxa/agent-instructions/AGENTS.md` file was not present in the local workspace on 2026-07-07; agents must continue to follow the checked-in `AGENTS.md` and must not invent unsupported data.

## Non-Negotiable Product Rules

- Do not invent salary ranges, APS scores, subject thresholds, provider entry requirements, province-level demand, accreditation status, professional registration requirements or employment outcomes.
- A claim may be learner-facing only when it has a source URL, source name, source type, access date, verification status and confidence score.
- Official source evidence can support only the claim types it actually proves.
- Internal Careerize editorial records may support product structure and learner-safe caveats, but they must not support factual labour-market, qualification, provider, salary, APS or registration claims.
- Unknowns must remain unknown. Use `not_publicly_confirmed`, `varies_by_provider`, `source_found_needs_review` or `needs_manual_verification` instead of filling gaps with broad language.
- Demand evidence from DHET OIHD can support high-demand signposting, but it does not prove guaranteed employment, salary, provincial demand or provider entry requirements.

## Source Classes

Use these source classes before promoting claims:

| Source class | Allowed claim types | Examples |
|---|---|---|
| official_government | occupation recognition, OIHD demand signpost, public institution context | DHET OIHD, DHET registers, Government Gazette |
| official_register | SAQA ID, qualification name, NQF level, credits, registration status | SAQA AllQS |
| quality_council | occupational qualification, accreditation, trade/occupational pathway context | QCTO, CHE, Umalusi |
| professional_body | registration category, designation route, professional exams or candidacy | ECSA, SANC, HPCSA, SAICA, LPC, SACPLAN |
| sector_body | SETA sector context, learnership/workplace-learning signposts | Relevant SETA source |
| provider_source | exact programme name, campus, duration, APS, subject threshold, entry requirement | institution prospectus or official programme page |
| vendor | current vendor certification pathway and retirement status | Microsoft, Cisco, AWS, Google Cloud, CompTIA |
| internal_methodology | guardrails, source policy, learner warning copy | Careerize docs only |

## Evidence Record Format

Create a machine-readable evidence file:

`data/sa-foundation/career_claim_evidence.csv`

Columns:

```text
evidence_id
career_id
career_title
claim_type
claim_text
source_name
source_type
source_url
access_date
supports_field
verification_status
confidence_score
learner_safe_copy
blocked_fields
review_notes
```

Allowed `claim_type` values:

```text
occupation_recognition
high_demand_signpost
critical_skill_signpost
qualification_route
nqf_level
provider_entry_requirement
professional_registration
subject_requirement
workplace_learning_route
tools_and_tasks
career_progression
geographic_demand
salary
source_limitation
```

Allowed `verification_status` values:

```text
verified
source_found_needs_review
varies_by_provider
not_publicly_confirmed
needs_manual_verification
unsupported_do_not_publish
retired_or_discontinued
replaced_by_current_route
```

Confidence score rules:

- `0`: no usable source attached.
- `25`: source found but claim type is not fully supported.
- `50`: credible source supports broad guidance, but not exact learner-facing detail.
- `75`: official or professional source supports the specific claim.
- `90`: official/provider source supports exact programme or regulatory requirement and the claim has been reviewed.
- `100`: reserved for fully reviewed, current, official, exact claims with no unresolved caveat.

## First Research Batch

Use `data/sa-foundation/careerize_sa_top100_build_queue.csv` as the first batch, in `priority_rank` order. The first implementation pass should populate evidence rows for the first 25 careers before expanding to all 100:

1. Civil Engineer
2. Electrical Engineer
3. Electrician
4. Mechanical Engineer
5. Millwright
6. Quantity Surveyor
7. Plumber
8. Software Developer
9. Cybersecurity Analyst
10. Data Analyst
11. Data Scientist
12. IT Project Manager
13. Registered Nurse
14. Medical Practitioner
15. Pharmacist
16. Occupational Therapist
17. Physiotherapist
18. Radiographer
19. Chartered Accountant (CA(SA))
20. Actuary
21. Financial Analyst
22. Tax Practitioner
23. Attorney
24. Advocate
25. Teacher

## Promotion Model

Add a build-time resolver that maps `career_claim_evidence.csv` rows onto the existing live `CAREER_ROUTES` records.

For each career:

- Keep starter/generated copy for discovery scaffolding only when it is explicitly labelled as exploratory.
- Promote `demand` from `not-source-verified` only when at least one `high_demand_signpost` or `critical_skill_signpost` claim has `verification_status: "verified"` and confidence `>= 75`.
- Promote `professional_registration` only from a professional body, statute, official register or provider/professional-body source.
- Promote `qualification_route`, `nqf_level` and `provider_entry_requirement` separately. A verified NQF level does not imply a verified APS or provider entry requirement.
- Never promote `salary` unless a salary evidence row exists with a clearly allowed source class and a reviewed limitation note. The default product rule remains no detailed salary figures.
- Keep route pages visibly honest: learners should see what is verified, what varies by provider and what must be checked before decisions.

## Validation Requirements

Add validators so unsupported claims cannot quietly enter the public app:

- Every evidence row must have non-empty `evidence_id`, `career_id`, `career_title`, `claim_type`, `source_name`, `source_type`, `source_url`, `access_date`, `supports_field`, `verification_status`, `confidence_score`, `learner_safe_copy` and `blocked_fields`.
- `claim_type`, `source_type` and `verification_status` must be from the allowed lists.
- `confidence_score` must be an integer from 0 to 100.
- Rows with `verification_status: "verified"` must have confidence `>= 75`.
- Rows with `source_type: "internal_methodology"` cannot verify salary, demand, APS, provider entry, accreditation or registration claims.
- Rows with `claim_type: "provider_entry_requirement"` must use `source_type: "provider_source"` or remain `source_found_needs_review`, `varies_by_provider`, `not_publicly_confirmed` or `needs_manual_verification`.
- Rows with `claim_type: "salary"` must default to `unsupported_do_not_publish` unless specifically reviewed in a later salary-policy spec.

## UI Rules

- Replace generic profile language that appears factual with evidence-backed fields where available.
- Show verified badges only for exact claim groups that are verified.
- Show "Needs provider check" or equivalent for APS, subject thresholds, campus availability and programme entry details unless provider evidence exists.
- Search and pathway pages must not imply that a route is fully verified when only one claim type is verified.
- Continue to avoid salary figures unless a future approved salary-policy spec allows them.

## Implementation Shape

Expected files:

- Create `data/sa-foundation/career_claim_evidence.csv`.
- Create `scripts/validateCareerClaimEvidence.mjs`.
- Create `src/data/careerClaimEvidence.js` or a generated JS module if the app needs direct imports.
- Modify `src/data/careerCatalog.js` only through a narrow resolver/helper that overlays verified claim states.
- Modify `scripts/validateProductionReadiness.mjs` and `package.json` to include the new validator.
- Update tests in `src/App.test.jsx` or a focused data test so verified and unverified claim states are both covered.
- Update documentation in `docs/CAREER_COVERAGE_MANIFEST.md` and `docs/deployment-readiness.md` after the first batch is imported.

## Out Of Scope For First Implementation

- Filling all 1,050 careers.
- Publishing salary figures.
- Publishing provider-specific APS for careers without provider-source rows.
- Replacing the entire frontend layout.
- Building a CMS or admin UI.
- Claiming Cloudflare deployment status.

## Acceptance Criteria

- The repo contains a claim-level evidence table in the agreed format.
- The first 25 Top 100 careers have evidence rows for occupation recognition or source limitation, and where official support exists, high-demand or professional-registration signposts.
- The app or generated data can distinguish starter-only, partially verified and claim-verified careers.
- Validators fail on unsupported verified claims.
- `npm run check` passes after the evidence validator is added.
- The handoff states exactly which careers and claim types were populated, which remain blocked and which sources were used.
