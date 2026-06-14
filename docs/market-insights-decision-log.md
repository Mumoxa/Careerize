# Document Insight vs Careerize Current State vs Decision

This file records the temporary comparison table requested before implementation. It was created from the uploaded market insights report and the current `Mumoxa/Careerize` repository state inspected on 2026-06-15.

| Area | Document insight | Careerize current state before this update | Decision | Implement now |
|---|---|---|---|---|
| Product positioning | Careerize should be a free, source-cited, South African-first career intelligence engine, not a job board, course directory or black-box AI wrapper. | Already clearly positioned as independent, free, not a marketplace, not a recruitment tool and not a personality-test product. | Preserve and sharpen. | Yes |
| Career profile structure | Profiles should include real work, day-in-life, tasks, subjects, routes, salary/demand status, risks, misconceptions, sources and confidence. | Route cards had summary, day, tools, environment, stress, remote, growth, worst and best. | Adapt. Extend starter profiles into structured career intelligence records. | Yes |
| Source transparency | Every claim should have source URL, access date and confidence score; unknown salary/demand must not be faked. | No source registry in career catalog. No per-profile confidence score. | Replace weak area. Add source registry, confidence fields and visible unknown-data states. | Yes |
| SA localisation | Careerize needs NSC, NQF, TVET, learnership, apprenticeship, short-course, work and pivot pathways. | A generic 3-step pathway existed in UI. | Replace with SA pathway readiness layer. | Yes |
| Recommendation logic | No black-box recommendations; explain what matched, did not match, confidence and next step. | Deterministic scoring existed, but explanation detail was limited. | Preserve deterministic scoring and add explanations. | Yes |
| Visualisation | Pathway maps, salary bars, demand heatmaps, skill gaps and confidence indicators should answer real user questions. | Visuals were attractive but not yet data/decision visualisations. | Prepare high-value indicators now; defer misleading charts until source data exists. | Partial |
| Mobile and low-data | SA product should be mobile-first and low-data friendly. | Responsive Vite/Tailwind UI existed, but no low-data control. | Add low-data mode toggle and reduce visual weight when enabled. | Yes |
| Admin/content operations | Future platform needs content status, source registry and confidence management. | Supabase only stored learner profiles and discovery history. | Add foundational public-read career/source tables; full admin UI deferred. | Partial |
| International expansion | Architecture must support country abstraction later, but content remains SA-first. | Static catalog was implicitly SA-first without data abstraction. | Add country fields and `careerize_countries` table with ZA launch country. | Yes |
| Business model/trust | Free consumer surface and no pay-for-placement are non-negotiable. | Already present in README and strategy docs. | Preserve unchanged. | Yes |

## Implemented priority logic

Highest-impact implementation was limited to changes that improve credibility and future scalability without pretending the product already has complete labour-market data.

Implemented now:

1. Structured source registry and confidence metadata in the static catalog.
2. Richer career profile blueprint in the frontend.
3. Explainable route scoring with matched/missing signals.
4. SA pathway readiness across eight route types.
5. Clear salary/demand unknown states to avoid fake claims.
6. Low-data mode for mobile-first South African access.
7. Supabase schema expansion for career/source data foundations.
8. Documentation of repo assessment, product gaps, sources and implementation decisions.

Deferred:

1. Real salary numbers until source-verified data is loaded.
2. Real demand heatmaps until source-verified provincial data is loaded.
3. Full admin CMS and bulk import tooling.
4. International content beyond ZA abstraction.
5. AI-generated recommendations beyond deterministic explainable scoring.
