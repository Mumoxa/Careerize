# Careerize Research Team Operating Model

Date: 2026-06-28  
Scope: 461-route South African career research operating layer  
Status: Production governance scaffold, not a claim that all profiles are source-verified.

## Purpose

Careerize can be useful before every profile is fully verified only if the product is honest about evidence. The research team operating layer exists to turn every mapped career from starter guidance into claim-level, source-backed guidance without publishing unsupported salary, demand, APS, provider-entry or registration claims.

## Required Artifacts

These artifacts must stay in sync with the live `CAREER_ROUTES` ids:

| Artifact | Required rows | Purpose |
|---|---:|---|
| `career_qualification_coverage.csv` | 461 | Confirms every route has a conservative qualification-family association. |
| `career_research_queue.csv` | 461 | Confirms every route has required source categories and blocked claim types. |
| `career_research_team_workplan.csv` | 461 | Assigns every route to a research lane, phase, primary role, evidence reviewer and QA reviewer. |

## Team Roles

| Role | Main responsibility | Must not approve alone |
|---|---|---|
| `occupation_mapper` | Map the career title to the closest official occupation/OFO/OIHD source category. | Demand strength, salary, qualification eligibility. |
| `qualification_accreditation_researcher` | Verify SAQA, QCTO, CHE, SETA, DHET institution or provider route evidence. | Learner-facing publication without evidence review. |
| `professional_registration_researcher` | Check regulated practice gates, professional bodies and public-service entry rules. | Salary or broad demand claims. |
| `career_reality_researcher` | Check day-to-day work, travel, stress, safety and environment claims using conservative evidence. | Formal qualification or accreditation claims. |
| `source_evidence_reviewer` | Confirm URL, access date, source category, verification status and confidence score. | Final learner wording alone. |
| `learner_safety_editor` | Convert verified findings into learner-safe, non-overclaiming guidance. | Evidence approval. |

## Source Hierarchy

Use official or primary sources first:

1. DHET OIHD/OFO/government gazette sources for occupation mapping and national shortage/demand context.
2. SAQA/NQF records for registered qualification existence, level and credits.
3. QCTO records for occupational qualifications, trades, skills programmes, assessment and accredited providers.
4. CHE sources for higher-education programme accreditation.
5. DHET institution registers for public/private provider status.
6. SETA, professional-body, regulator or licensing sources where the career has a practice gate.
7. Provider prospectuses and programme pages for current entry requirements, APS, subject requirements, duration, campus and mode.
8. Current worker interviews, employer documents or sector reports only as supporting context, not as sole proof for regulated claims.

## Claim Gates

These claims remain blocked until the exact profile field has source URL, access date, verification status and confidence score:

- salary figures or salary bands
- demand strength or province-level demand
- APS, subject thresholds or marks
- provider-specific entry requirements
- qualification eligibility or accreditation
- professional registration, licence or right-to-practise claims
- safety/danger claims that imply measured risk

## Workflow

1. `occupation_mapper` maps the route to an official occupation source category.
2. `qualification_accreditation_researcher` or `professional_registration_researcher` verifies the route requirements.
3. `career_reality_researcher` checks day-to-day work, stress, travel and safety wording.
4. `source_evidence_reviewer` confirms evidence metadata and confidence.
5. `learner_safety_editor` rewrites the profile in plain language and removes overclaims.
6. A profile can move from `starter-editorial` to `reviewed` or `source-verified` only when claim-level evidence exists in the database.

## Phase Plan

| Phase | Included careers | Purpose |
|---|---|---|
| `phase_1` | High-priority streams and roles with stronger learner-risk or labour-market importance. | Build the first publishable source-backed profiles. |
| `phase_2` | Medium-priority formal/vocational routes. | Expand qualification and subject-choice depth. |
| `phase_3` | Standard-priority and portfolio/informal routes. | Improve breadth while preserving conservative claim wording. |

## Verification Command

Run:

```bash
npm run check
```

The check must export all generated files, validate the catalog, validate the foundation layer, validate the production evidence and team-workplan gates, then build the frontend.
