# Careerize Full Overview Review

Assessment date: 2026-06-15
Source reviewed: uploaded `Pasted text.txt` consolidated strategy, product concept and Codex build plan.

## Review outcome

The full overview confirms the same strategic direction as the earlier market-insights document: Careerize should be a free, South African-first, source-cited, decision-support career-intelligence platform, not a job board, course marketplace, static list, generic blog, freemium AI wrapper or black-box personality test.

The current repo is aligned with the core strategic boundary, but it is still an early Vite/React product rather than the complete knowledge-graph platform described in the overview.

## Strategic amendment from founder feedback

The uploaded overview repeatedly recommends salary bands, salary charts and salary APIs as part of the long-term target architecture. The product decision has changed.

Careerize should avoid detailed salary information for now. The correct product pattern is qualitative earning-potential insight:

- high earning potential once skill and proof are strong
- steady earning path with progression
- variable earning potential depending on route, trust, scarce skill and seniority
- uncertain earning potential where the route is informal, entrepreneurial or poorly sourced

Detailed salary numbers, salary bands, salary charts and salary filters are not part of the active build unless the founding team later approves a source-backed salary product. This avoids false precision, constant maintenance, regional disputes and unsupported learner expectations.

## Document Insight vs Careerize Current State vs Decision

| Area | Full overview insight | Current Careerize state | Decision | Implement now |
|---|---|---|---|---|
| Product positioning | Free, source-cited, South African-first career intelligence; not a job board, blog or AI wrapper. | Strongly aligned in README and product boundary. | Preserve. | Already done |
| Commercial boundary | No employer/course-provider pay-for-placement; no freemium gate. | Strongly aligned. No job, course, CV, employer or payment workflow. | Preserve. | Already done |
| Career profile structure | Standardised profile with real work, routes, tasks, tools, stories, confidence and next steps. | Starter catalog now has day-in-life, tasks, tools, subjects, pathways, misconceptions, best/worst, earning-potential insight, source IDs and confidence. | Adapt and keep enriching. | Partially done |
| Salary / compensation | Overview recommends salary bands, charts and salary route APIs. | Repo now deliberately uses qualitative earning-potential insight and validation rejects salary fields. | Replace with earning-potential insight. | Done |
| Demand | Overview wants province-level demand and heatmaps. | Repo uses explicit demand-not-verified states. | Preserve uncertainty; defer heatmaps until verified data exists. | Partial |
| Source registry | Every claim should have source URL, access date and confidence score. | Static source registry exists; Supabase source table foundation exists. | Continue. Add external public sources later. | Partial |
| Confidence scoring | Per-field confidence and visible confidence badges. | Catalog has `dataConfidence`; scoring has explanation confidence; source records have confidence. | Continue. Move toward per-field confidence later. | Partial |
| SA pathways | 8 SA routes: NSC, university, TVET, learnership, apprenticeship, short course, work and pivot. | `PATHWAY_TYPES` and starter route mappings exist. | Preserve and scale with real data. | Partial |
| School subject journey | Subject-to-career is a primary learner journey. | Starter routes include relevant subjects; no dedicated subject map yet. | Build next. | No |
| Skills matcher | Competency-based matcher should complement interests. | Deterministic interest/signal scoring exists; no full skills matcher UI. | Build after catalog structure is stable. | No |
| Recommendations | Explain matched signals, mismatches, confidence, missing info and next step. | Scoring now returns matched/missing signals, confidence label and next step. | Preserve; expand when quiz grows. | Partial |
| Action plans | This week / month / year checklist. | Not implemented beyond next-step copy. | Build as next high-value module. | No |
| Parent/advisor view | First-generation decision support for parents/advisors. | Not implemented as dedicated routes/views. | High priority after profile structure. | No |
| Practitioner stories | Real SA stories with consent. | Not implemented; source model can support later. | Defer until consent workflow exists. | No |
| Admin/content operations | Career CRUD, source registry, confidence management, bulk import, freshness alerts. | Schema foundation exists; no admin CMS. | Defer heavy admin, but keep schema ready. | Partial |
| Multilingual | English, Afrikaans, isiZulu and isiXhosa scaffold from day one. | Not implemented as i18n files. | High priority; start with UI string scaffold before translating content. | No |
| Mobile / low-data | Mobile-first, low-data, offline/PWA. | Low-data toggle exists; no service worker/PWA/offline cache yet. | Continue. | Partial |
| Accessibility | WCAG 2.2 AA minimum, keyboard, contrast, labels, error states. | Basic semantic React/Tailwind app; no automated accessibility testing. | Add axe/manual checklist later. | No |
| Testing / CI | Lint, typecheck, unit, e2e, build and deployment checks. | `npm run check` validates catalog and builds. No lint/typecheck/e2e scripts. | Add test scripts before scaling content. | Partial |
| International readiness | Country abstraction now, international content later only. | Country fields and ZA launch country exist. | Preserve. Do not add non-SA content yet. | Partial |

## What should remain unchanged

- Free consumer surface.
- No employer or course-provider pay-for-placement.
- No job board, CV database, employer unlock, recruitment pipeline or payment flow.
- Deterministic explainable matching instead of black-box AI.
- South African-first content focus.
- Honest plain-language tone for uninformed learners.
- Salary-detail avoidance unless there is a deliberate future product decision.

## What the full overview adds beyond the earlier implementation

The full overview adds more explicit pressure around:

1. A proper subject-to-career journey for Grade 9/10/12 subject decisions.
2. A dedicated Skills Matcher, not only interest/signal scoring.
3. Parent and advisor views.
4. Action plans that turn exploration into next steps.
5. Admin/content operations for scaling source-cited career records.
6. i18n scaffolding before the content base becomes too large.
7. Accessibility and CI as production-quality requirements.

## Revised build priority after full overview review

### P0 — protect trust and product boundary

1. Keep salary detail out; use earning-potential insight only.
2. Keep all recommendations explainable and non-final.
3. Keep source/confidence fields mandatory for every starter profile.
4. Keep demand as unknown unless verified source data exists.
5. Keep the free, independent, non-marketplace boundary visible.

### P1 — next product work

1. Convert the current route-card experience into a fuller career-profile component.
2. Add subject-to-career exploration using the existing `subjects` arrays.
3. Add an action-plan checklist per career and learner stage.
4. Add a parent/advisor-friendly explanation panel.
5. Add first i18n scaffolding for UI strings.
6. Add a simple content-status model in the UI: starter, reviewed, published, flagged.

### P2 — next architecture work

1. Add proper content migration/seed workflow for career profiles and sources.
2. Add admin CMS screens only after the career profile schema stabilises.
3. Add formal skill entities and competency matcher.
4. Add accessibility tests and e2e regression tests.
5. Add PWA/offline cache and WhatsApp-friendly sharing.

### Deferred deliberately

1. Detailed salary data, salary filters, salary charts and salary APIs.
2. Province-level demand heatmaps until verified data exists.
3. International content before SA product depth is proven.
4. AI-generated advice beyond explainable deterministic guidance.
5. Employer/course provider promotional surfaces.

## Implementation conclusion

The full overview does not require a strategic reset. It confirms the direction but needs one major amendment: salary-band thinking must be replaced by earning-potential insight for the active product.

The repo should now be treated as a trusted starter foundation. The next meaningful build should deepen the career profile and user journey rather than add broad, shallow features.
