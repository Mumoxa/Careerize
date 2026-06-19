# Careerize Repo Assessment

Assessment date: 2026-06-15
Repository: `Mumoxa/Careerize`

## Tech stack

- Framework: Vite single-page app.
- UI: React 18.
- Styling: Tailwind CSS with custom colours and display font.
- Motion: Framer Motion.
- Icons: Lucide React.
- Persistence/auth: Supabase Auth and Row Level Security when configured, with local-browser fallback when not configured.
- Database: Supabase Postgres schema in `supabase/schema.sql`.
- Package manager: npm. No lockfile observed in the existing README notes.

## Existing app structure inspected

- `src/App.jsx` - main application, landing page, discovery flow, saved profile panel, career route cards, pathway/trust sections.
- `src/main.jsx` - React app bootstrap.
- `src/index.css` - Tailwind imports and base styling.
- `src/data/careerCatalog.js` - static career routes, discovery questions and interest signals.
- `src/lib/scoring.js` - deterministic scoring helpers.
- `src/lib/savedDiscovery.js` - Supabase/local storage persistence layer.
- `scripts/validateCatalog.mjs` - catalog validation.
- `supabase/schema.sql` - learner-owned saved profiles/results/sessions with RLS.
- `docs/strategy-and-repo-scope.md` - strategic boundaries.
- `README.md` - product scope, stack and run instructions.

## Current product surface before update

The app already included:

- Simple discovery questions.
- Interest tags.
- Deterministic career-route scoring.
- Saved learner profile and discovery persistence.
- Local demo fallback.
- Career reality cards.
- Generic entry/growth pathway prompts.
- Independence and trust principles.

## Strengths preserved

- Clear South African learner focus.
- Strong anti-marketplace and anti-recruitment boundary.
- No employer unlock, CV database, payment or course marketplace features.
- Deterministic scoring rather than black-box AI.
- Plain-English career reality tone.
- Supabase RLS for learner-owned saved records.

## Gaps found

- Career catalog had only five route records and no source registry.
- No per-profile confidence or last-updated metadata.
- Salary and demand sections were not structured.
- SA pathway logic was generic rather than NSC/NQF/TVET/learnership/apprenticeship aware.
- Recommendation scoring did not expose matched signals, missing signals or confidence explanation.
- No architecture table for public career/source records.
- No low-data mode.
- No admin/content operations model beyond learner records.
- No formal market-insights decision log.
- Tests were limited to catalog validation and build via `npm run check`.

## Deployment configuration

- Vite build script exists.
- No CI workflow was found through inspected known paths.
- README states deployment should trigger from `main`.

## High-level readiness view

Careerize is a strong early product concept and demo surface, but not yet a full career intelligence platform. The update therefore prioritised architecture, source/confidence scaffolding, South African pathway structure and UI credibility over fake breadth.
