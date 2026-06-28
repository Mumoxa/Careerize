# SA Foundation Workspace Import Review

Date: 15 June 2026  
Repository: `Mumoxa/Careerize`  
Imported workspace: `workspace-019ecb13-0c77-7745-a113-fb583a056bfa.zip`

## Executive decision

The uploaded workspace should not be pasted into the live React catalog. It should become a dedicated South African foundation-data layer.

The reason is simple: the current app catalog solves breadth with 461 mapped routes, while the workspace solves depth through OFO/OIHD mapping, qualification-pathway matrices, registration dependencies, specialisations, graph exports, the 461-row research queue and Top 100 enrichment queues. Mixing the two without claim gates would create duplication and could accidentally publish unverified labour-market claims.

## What the workspace adds

| Area | Imported learning | Repo decision |
|---|---|---|
| OIHD/OFO backbone | 350 OIHD occupations, family mapping, priority scores and production queue. | Preserve as foundation data; use to enrich and prioritise profiles. |
| Qualification graph | Qualification seed, qualification-to-career bridge and pathway matrix. | Preserve as future pathway data source, not frontend copy. |
| Registration gates | Practice-gate and professional-body dependencies. | Use for profile warnings and route gates after verification. |
| Top 100 queue | Clear order for source-backed profile build-out. | Use as enrichment backlog. |
| Graph model | Nodes and edges covering careers, qualifications, regulators, provinces, specialisations and OIHD occupations. | Treat as the starting point for Careerize's knowledge graph. |
| Province notes | Province and metro concentration notes. | Keep as working notes until source-verified demand claims are available. |
| Salary tracker | Salary verification workflow. | Keep for internal verification only; do not publish salary bands now. |
| Specialisations | 151 specialisation rows. | Use to split broad profiles into real sub-career variants. |

## Product correction

Careerize must become graph-first, not only profile-first. The live 344-route catalog is useful for exploration, but the durable product moat is the relationship layer:

- career to qualification
- qualification to many careers
- career to registration gate
- career to specialisation
- career to province pattern
- career to official OFO/OIHD occupation
- career to source and confidence state

## What was added to the repo

A new folder now exists:

```text
data/sa-foundation/
```

It contains the imported foundation-data workbench plus an inventory file. This deliberately keeps source/backbone data separate from the live frontend catalog.

## What was not duplicated

The imported workspace overlaps with the current catalog in career titles, but it is not the same layer. The existing `CAREER_ROUTES` catalog remains the learner-facing starter layer. The imported foundation pack becomes the source-backed operational layer for staged enrichment.

No salary figures were wired into the public product. The imported salary file remains a verification tracker only.

## Required next build sequence

1. Add database tables or migrations for qualifications, career-qualification edges, registration gates, specialisations and official occupation mapping.
2. Build a seed/import script from `data/sa-foundation/`.
3. Use the Top 100 queue to enrich profiles in priority order.
4. Add profile sections for registration gates, specialisations and verified qualification pathways.
5. Keep demand and earning-potential language qualitative until public source verification is complete.

## Risk controls

- Do not treat `starter_unverified` rows as final advice.
- Do not publish salary bands from tracker files.
- Do not collapse OIHD and Critical Skills List into the same flag.
- Do not duplicate the 344 route titles into another frontend array.
- Do not claim qualification eligibility without a source URL, access date and confidence score.

## Bottom line

The repo now has two complementary layers:

1. **Learner-facing breadth:** 461 mapped routes in `src/data/careerCatalog.js`.
2. **Operational depth:** SA foundation data in `data/sa-foundation/`.

That is the right architecture for Careerize.
