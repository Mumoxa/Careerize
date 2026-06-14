# Careerize architecture review

## Current architecture

Careerize is a Vite React single-page application styled with Tailwind CSS. The main application logic lives in `src/App.jsx`, career data lives in `src/data/careerCatalog.js`, deterministic scoring utilities live in `src/lib/scoring.js`, and learner-owned persistence lives in `src/lib/savedDiscovery.js`.

## Current product surface

- Public landing page and interactive discovery demo.
- Learner discovery questions and interest tags.
- Deterministic career-route signals.
- Learner-owned saved profile and discovery-result persistence through Supabase Auth when configured.
- Local-browser demo fallback when Supabase environment variables are absent.
- Career reality cards with day-to-day work, tools, stress, remote potential, growth, best and worst parts.
- Trust section explaining privacy, independence and no commercial influence.
- No employer dashboard, payment flow, CV upload, recruitment workflow, course sales or commercial partner pipeline.

## Supabase domain boundary

Supabase may support:

- `profiles`: learner-owned editable profile memory.
- `results`: latest deterministic result snapshot.
- `sessions`: discovery history for learner reflection and product improvement.
- `privacy`: future consent, correction and deletion requests.

Supabase must not support employer access, CV unlocks, hiring workflows, recruitment pipelines, payment records or sponsor targeting.

## Key risks

| Severity | Risk | Mitigation |
| --- | --- | --- |
| High | Route signals could be mistaken for a verdict. | Use transparent signal language and caveats. |
| High | Saved profiles could drift into CV or candidate records. | Keep fields lightweight and learner-owned; prohibit CV/recruitment use. |
| Medium | Supabase requires careful RLS setup. | Run and verify `supabase/schema.sql` with two test users before launch. |
| Medium | Main UI is still one large component. | Split into feature components before adding deeper flows. |
| Medium | No interaction tests yet. | Add component or E2E tests for discovery, saving and restore flows. |

## AI boundary

AI may draft explanations, summarise learner notes, suggest reflective questions and recommend safe next experiments.

AI must not silently reject, rank for hiring, infer protected traits, make admissions decisions, produce unsupported psychometric claims or hide why a suggestion was made.

## Recommended next architecture work

- Split `src/App.jsx` into discovery, account, trust and career-card components.
- Add tests for scoring, save/restore and local fallback.
- Add account deletion and profile correction flows.
- Add explicit privacy copy before collecting more learner data.
- Keep any institutional/school features separate from career profile content and route scoring.
