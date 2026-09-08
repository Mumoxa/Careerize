# Careerize Career Coverage Manifest

Date: 28 June 2026
Status: Expanded starter taxonomy with claim-level evidence coverage
Country focus: South Africa
Salary policy: qualitative earning-potential insight only; no detailed salary bands or salary figures.

## Why This Exists

Careerize needs broad coverage because South African learners are often shown a narrow set of career options. This manifest records the current live catalog coverage and the boundary between starter exploration content and source-verified career intelligence.

The catalog is no longer a small demo. It now contains a broad starter taxonomy that can support discovery, comparison and future source-backed profile enrichment.

## Current Live Catalog Coverage

The live `CAREER_ROUTES` catalog generates **2,676 starter career routes** across **18 macro streams**.

| Macro stream | Starter routes |
|---|---:|
| Technology, data and AI | 89 |
| Skilled trades, construction and engineering | 83 |
| Informal, entrepreneurship and community economy | 81 |
| Manufacturing, mining and energy | 74 |
| Finance, admin and business operations | 72 |
| Health, care and social services | 69 |
| Management, strategy and leadership | 66 |
| Sales, marketing and customer work | 57 |
| Agriculture, food and environment | 54 |
| Creative, media and design | 54 |
| Hospitality, tourism, sport and events | 52 |
| Law, public service and public safety | 50 |
| Logistics, transport and supply chain | 44 |
| Education, training and youth development | 43 |
| Elementary and entry-level work | 43 |
| Arts, culture, heritage and society | 42 |
| Armed forces and security services | 39 |
| Science, research and frontier careers | 38 |
| **Total** | **2,676** |

## Claim Evidence Coverage

Careerize now includes a generated claim-evidence file:

```text
data/sa-foundation/career_claim_evidence.csv
```

That file currently covers all **2,676 live career routes** with **5,940 claim evidence rows**. The evidence layer includes:

- one occupation-recognition row for every live route
- one source-limitation row for every live route
- promoted high-demand or critical-skill signposts only where imported source evidence supports that claim type
- research-archive rows marked as review-needed working data, not automatically published facts

This is not permission to present every career as fully verified. Exact salary, APS/marks, provider-specific entry requirements, accreditation status, province-level demand and guaranteed employment outcomes remain blocked until source-specific rows are added and reviewed.

## What Each Starter Route Includes

Each generated starter route includes:

- route id and title
- macro stream / cluster
- interest-signal weights for the discovery engine
- qualitative career-reality signals
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

## Research Alignment Coverage

The imported research foundation currently contains:

- 1,775 raw research records.
- 1,702 canonical title-deduped research careers.
- 589 live starter routes with a direct, suggestion or curated research link.
- 461 live starter routes still tracked as research-link gaps.
- 145 canonical-career links covering the Top 100 build queue.
- 5,940 generated claim-evidence rows covering all 2,676 live routes.

The research gap file is:

```text
data/sa-foundation/careerize_sa_starter_route_research_gaps.csv
```

## Active Constraints

The expanded catalog is intentionally marked as starter/editorial taxonomy, not verified labour-market fact.

Careerize must still avoid:

- detailed salary figures
- unsupported demand claims
- overconfident matching language
- pretending starter profiles are fully researched profiles
- employer or course-provider pay-for-placement
- becoming a job board or recruitment platform

## South African Pathway Model Preserved

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

## Next Enrichment Step

This starter taxonomy solves breadth. The next serious product step is depth.

Priority enrichment order:

1. Keep `career_claim_evidence.csv` regenerated and validated whenever catalog or research data changes.
2. Close the 461 starter-route research-link gaps.
3. Convert the Top 100 priority careers from starter profiles into source-backed profiles.
4. Add verified NSC/NQF/TVET/SETA/university route details.
5. Add province-level demand status only where sourced.
6. Keep earning potential qualitative until the team deliberately decides otherwise.
7. Add parent/advisor-friendly explanations and action plans.
8. Build governed admin/content tooling so the catalog can keep expanding without editing code by hand.

## Product Interpretation

Careerize now has a broad career universe for exploration and a claim-evidence layer for every route. It is not yet a fully verified 2,676-career knowledge graph.

Breadth exists now. Claim-level evidence governance exists now. Deep verified guidance still needs staged editorial and source work.
