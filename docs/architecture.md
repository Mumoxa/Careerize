# Careerize architecture review

## Current architecture

Careerize is currently a Vite React single-page application styled with Tailwind CSS. The main application logic lives in `src/App.jsx`, career data lives in `src/data/careerCatalog.js`, and deterministic scoring utilities live in `src/lib/scoring.js`.

There is no active backend runtime in the app. A Supabase SQL schema exists in `supabase/schema.sql` for future authenticated learner profiles, latest result snapshots and discovery-session history. The schema enables row-level security policies so users can only access their own records.

## Current product surface

- Public landing page and interactive demo in one React route.
- Learner discovery questions and interest tags.
- Deterministic career-route ranking.
- Saved learner discovery views through Supabase Auth when configured, with a labelled local-browser demo fallback when Supabase env vars are absent.
- Career reality cards with day-to-day work, tools, stress, remote potential, growth, best and worst parts.
- Sponsor/partner section.
- No employer dashboard, admin dashboard, payment flow, email flow, file upload or AI integration currently implemented.

## Key risks found

| Severity | Risk | Impact | Status |
| --- | --- | --- | --- |
| High | The UI could imply a career match is a verdict. | Learners may over-trust a simple signal model. | Mitigated with clearer copy, signal language and trust section. |
| High | Supabase schema exists but frontend persistence/auth are not wired. | Product may appear more complete than it is if undocumented. | Documented as future architecture, not live functionality. |
| Medium | Most UI and business logic live in one component. | Harder to scale into auth, school, employer and admin surfaces. | Acceptable for current demo; should be split before larger features. |
| Medium | No automated interaction tests. | Regressions in discovery flow could be missed. | Build/catalog validation exists; add component/E2E tests next. |
| Medium | No environment variable documentation. | Future Supabase setup can be misconfigured. | Add deployment env docs when auth is wired. |

## Target architecture

1. **Frontend domains**
   - `features/discovery`: questions, interest tags, scoring display and next actions.
   - `features/catalog`: route catalog cards, pathway content and validation.
   - `features/trust`: privacy, consent and AI transparency surfaces.
   - `features/partners`: school, funder and employer conversion surfaces.

2. **Backend domains when activated**
   - `profiles`: learner-owned editable profile data.
   - `results`: latest deterministic result snapshot.
   - `sessions`: immutable discovery history for learner reflection and aggregate analysis.
   - `organizations`: schools, NGOs and employers with explicit roles and access policies.
   - `audit`: append-only records for privacy, consent and important state changes.

3. **AI boundary**
   - AI may draft explanations, suggest reflective questions and summarise learner-entered evidence.
   - AI must not silently reject, rank for hiring, infer protected traits or produce unsupported psychometric claims.
   - Every AI output should be labelled, reversible and explainable.

## Changes made in this pass

- Clarified product positioning around evidence, safety and learner agency.
- Added a trust architecture section to the UI.
- Reframed match copy as transparent signal strength rather than a verdict.
- Added next-best-action guidance so the learner leaves with a small experiment, not just a label.
- Documented product strategy, current architecture, risks and target architecture.

## Recommended next architecture work

- Split `src/App.jsx` into feature components before adding auth or persistence.
- Add a small test suite for scoring and discovery interactions.
- Add account deletion/correction and profile-edit flows before wider school rollout.
- Add organization and role tables before building school/employer dashboards.
