# Careerize Architecture Review

## Current Architecture

Careerize is a Vite React single-page application styled with Tailwind CSS. The current production surface is a static frontend deployed from `dist/`.

Main runtime areas:

- `src/App.jsx` - public app shell, discovery flow, route filters, pathway detail and trust copy.
- `src/data/careerCatalog.js` - generated learner-facing route catalog.
- `src/data/masterCareerList.js` and `src/data/streams/` - OFO-linked source route groups.
- `src/data/academicPathwayTemplates.js` and `src/data/careerPathwayGraph.js` - pathway templates and generated route-to-pathway records.
- `src/lib/scoring.js` - deterministic ranking, preference scoring and guidance-language guardrails.
- `src/lib/subjectRisk.js` - template-based subject-risk prompts.
- `src/lib/savedDiscovery.js` - optional Supabase/local persistence helpers for a future saved-profile feature.
- `supabase/schema.sql` - optional learner-owned data schema with RLS.

## Current Product Surface

- Public landing page and interactive discovery flow.
- Learner discovery questions, interest tags and career-reality sliders.
- Deterministic career-route ranking.
- Route search and macro-stream filtering.
- Academic pathway template guidance for every starter route.
- Subject-risk prompts with provider-verification limits.
- Trust section explaining account-free public launch boundaries.
- No employer dashboard, payment flow, CV upload, recruitment workflow, course sales or commercial partner pipeline.

The public UI does not currently expose account creation, login, saved profiles or cross-device persistence.

## Supabase Domain Boundary

Supabase may support a future saved-profile release:

- `profiles`: learner-owned editable profile memory.
- `results`: latest deterministic result snapshot.
- `sessions`: discovery history for learner reflection.
- `privacy`: future consent, correction, export and deletion flows.

Supabase must not support employer access, CV unlocks, hiring workflows, recruitment pipelines, payment records or sponsor targeting.

Before enabling account UX, verify `supabase/schema.sql` with two separate learner accounts and test export/delete flows.

## Key Risks

| Severity | Risk | Mitigation |
|---|---|---|
| High | Route signals could be mistaken for a verdict. | Keep transparent signal language, starter labels and provider-verification caveats. |
| High | Broad catalog could be mistaken for verified labour-market fact. | Keep demand and salary claims qualitative until source-backed. |
| High | Saved-profile helpers could be exposed before privacy/RLS verification. | Keep account UX disabled until Supabase RLS, export/delete and privacy copy are tested. |
| Medium | Main UI is still one large component. | Split into feature components before adding account, admin or deeper pathway flows. |
| Medium | Research alignment is incomplete for 461 routes. | Keep the generated gap file visible and validate coverage counts. |
| Medium | No production monitoring is configured. | Add error reporting/analytics only after consent and privacy decisions are documented. |

## AI Boundary

AI may draft explanations, summarise learner notes, suggest reflective questions and recommend safe next experiments.

AI must not silently reject, rank for hiring, infer protected traits, make admissions decisions, produce unsupported psychometric claims or hide why a suggestion was made.

## Recommended Next Architecture Work

- Split `src/App.jsx` into discovery, route-results, pathway-detail and trust components.
- Add component-level tests once the UI is split.
- Add account UX only after privacy copy, RLS verification and deletion/export tests exist.
- Add a governed content-admin workflow for source-backed career data.
- Keep school/institution features separate from career profile content and route scoring.
