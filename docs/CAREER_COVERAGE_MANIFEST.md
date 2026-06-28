# Careerize Career Coverage Manifest

Date: 15 June 2026
Status: Production-safety taxonomy with research queue
Country focus: South Africa
Salary policy: qualitative earning-potential insight only; no detailed salary bands or salary figures.

## Why this exists

The earlier live catalog had only 5 career routes. That contradicted the Careerize project history, which has consistently aimed at a broad South African career universe covering traditional, modern, informal, technical, professional, creative, frontier and uncommon career routes.

This manifest records the repo-level correction: the catalog is no longer a five-career demo. It now contains a broad starter taxonomy that can support discovery, comparison and future source-backed profile enrichment.

## Current live catalog coverage

The live `CAREER_ROUTES` catalog now generates **461 mapped career routes** across **15 macro streams**. Every route is usable for exploration, but is still marked with evidence status so unsupported salary, demand, provider-entry and qualification claims remain locked until source records are attached.

| Macro stream | Mapped routes |
|---|---:|
| Technology, data and AI | 48 |
| Skilled trades, construction and engineering | 40 |
| Finance, admin and business operations | 36 |
| Creative, media and design | 34 |
| Health, care and social services | 34 |
| Agriculture, food and environment | 32 |
| Science, research and frontier careers | 32 |
| Manufacturing, mining and energy | 30 |
| Informal, entrepreneurship and community economy | 28 |
| Law, public service and public safety | 28 |
| Sales, marketing and customer work | 27 |
| Logistics, transport and supply chain | 25 |
| Hospitality, tourism, sport and events | 24 |
| Education, training and youth development | 23 |
| Arts, culture, heritage and society | 20 |
| **Total** | **461** |

## What each starter route includes

Each generated starter route includes:

- route id and title
- macro stream / cluster
- interest-signal weights for the discovery engine
- plain-English summary
- day-to-day work description
- tool examples written for uninformed learners
- likely work environment
- stress and remote-work framing
- growth direction
- best and worst parts
- qualitative earning-potential insight
- day-in-life blocks
- key tasks
- subject suggestions
- qualification notes
- pathway entries using the 8 South African pathway types where relevant
- common misconceptions
- fit warnings
- related career suggestions
- demand status marked as not source-verified
- source registry references and confidence metadata

## Active constraints

The expanded catalog is intentionally marked as starter/editorial taxonomy, not verified labour-market fact.

Careerize must still avoid:

- detailed salary figures
- unsupported demand claims
- overconfident matching language
- pretending starter profiles are fully researched profiles
- employer or course-provider pay-for-placement
- becoming a job board or recruitment platform

## South African pathway model preserved

The catalog continues to use the 8-route SA pathway model:

1. NSC subject route
2. University route
3. TVET route
4. Learnership route
5. Apprenticeship route
6. Short-course route
7. Work-experience route
8. Career-pivot route

Not every career uses every route. The route mix is based on the role family and must be refined with verified SA qualification data later.

## Next enrichment step

This starter taxonomy solves breadth. The next serious product step is depth.

Priority enrichment order:

1. Pick the first 100 highest-priority SA learner careers.
2. Convert those from starter profiles into source-backed profiles.
3. Add verified NSC/NQF/TVET/SETA/university route details.
4. Add province-level demand status only where sourced.
5. Keep earning potential qualitative until the team deliberately decides otherwise.
6. Add parent/advisor-friendly explanations and action plans.
7. Build an admin/content workflow so the catalog can keep expanding without editing code by hand.

## Product interpretation

This change means Careerize now has a broad career universe for exploration. It is not yet a fully verified 461-career knowledge graph. The difference matters:

- **Breadth exists now.**
- **Deep verified guidance still needs staged editorial and source work.**

That is the correct foundation for a South African-first career intelligence platform.
## 2026-06-28 production-safety update

The catalog has been expanded from 344 to 461 career routes and the full generated qualification coverage export now contains 461 career-to-qualification rows. This is a broader South African career universe for learners, parents and advisors, not a claim that all 461 profiles are fully researched.

Each route now carries:

- evidence state for profile, qualification, demand and earning guidance
- qualitative career-reality dimensions for earning ambition, travel/movement, stress and safety/danger tolerance
- source IDs that separate internal editorial scaffolding from official-source categories
- a research-queue status until DHET, SAQA, QCTO, CHE, DHET institution registers, provider pages or professional-body records support the exact claim

Production rule: Careerize can launch as a decision-support platform only if unverified claims stay visibly marked and the app continues to avoid salary figures, demand strength, APS and provider-entry requirements until the relevant source record is attached.

## 2026-06-28 research-queue gate

The repo now generates `data/sa-foundation/career_research_queue.csv`, a 461-row source-verification queue matching every live `CAREER_ROUTES` id. It records required source categories and the high-risk claim types blocked until evidence is attached.

The repo also generates `data/sa-foundation/career_research_team_workplan.csv`, a 461-row execution plan assigning every route to a research lane, phase, primary researcher role, evidence reviewer and learner-safety QA reviewer.

`npm run check` now exports and validates both generated files:

- `career_qualification_coverage.csv`
- `career_research_queue.csv`
- `career_research_team_workplan.csv`

The production validator cross-checks all generated files against the live route IDs, research queue, source registry and Supabase evidence/team-workplan schema.
