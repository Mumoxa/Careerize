# Careerize

Careerize is a free, independent career-intelligence platform for South African learners, school leavers, parents, teachers and advisors who need to understand how school subjects connect to qualifications, training routes and real work.

The product direction is a **subject-choice-to-career pathway engine** for Grade 9-12 learners, not a static career list and not a course marketplace.

## Current Status

Careerize is at **expanded public guidance SPA + pathway-engine foundation** stage.

The live public app is a Vite/React single-page application. It currently supports account-free exploration, deterministic route ranking, career-reality sliders, subject-risk prompts and pathway template guidance.

The catalog covers **2,676 starter career routes** across **18 South African-first macro streams**. This breadth is useful for exploration, but exact provider requirements, APS thresholds, salary data, accreditation status and labour-market claims remain marked for source verification before they can be treated as facts.

## Core Product Idea

Careerize works backwards from a possible career direction:

```text
Career interest
-> Realistic career picture
-> Qualification route
-> Provider-specific entry requirements
-> Grade 12 marks / APS where available
-> Grade 10 subject choice
-> First-work entry point
-> Career progression and adjacent options
```

A learner should be able to ask:

- What subjects should I keep if I want this career?
- What doors close if I drop Mathematics or Physical Sciences?
- What routes remain open with Mathematical Literacy?
- Is this route university, TVET, trade, learnership, professional-body, vendor-certification or workplace based?
- What qualification do I need, what is the NQF level, and what entry criteria must I verify?
- What junior job can I realistically enter first?

## Current Stack

- Vite
- React
- Tailwind CSS
- Lucide React icons
- Playwright and axe accessibility checks
- Optional Supabase schema and persistence helpers for a future saved-profile flow

## Current Product Surface

The current app includes:

- South African-first landing page and learner guidance boundaries.
- Simple discovery questions.
- Interest tags.
- Career reality sliders for earning ambition, travel/movement, stress tolerance and safety/danger tolerance.
- Deterministic career-route signals.
- Transparent recommendation explanations showing matched signals, missing signals, confidence and next step.
- 2,676 structured starter career routes across 18 macro streams.
- Structured starter career profiles with day-in-life, tasks, subjects, qualification/pathway notes, misconceptions, best/worst parts and uncertainty states.
- Source registry and confidence display for starter content.
- Qualitative earning-potential insights instead of detailed salary information.
- Demand sections that clearly show when source-verified data is not yet available.
- Low-data mode toggle.
- URL-state sharing for selected interest signals and the open pathway.
- South African pathway readiness across NSC, university, TVET, learnership, apprenticeship, short-course, work and pivot routes.

Supabase schema and persistence helpers exist, but the public UI does not currently expose account creation, login or saved profiles.

## Local Development

Use Node from `.node-version` / `.nvmrc`, then install dependencies:

```bash
npm ci
npm run dev
```

The Vite dev server prints the local URL, usually `http://localhost:5173`.

## Environment Variables

The current public app does not require environment variables.

Optional future Supabase configuration:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The Supabase anon key is public frontend configuration, not a server secret. Do not commit `.env` files. Before enabling account UX, test row-level security with at least two separate learner accounts and verify export/delete flows.

## Test And Build Commands

Run the full local production check:

```bash
npm run check
```

This runs catalog validation, OFO/source validation, SA foundation validation, academic-pathway validation, public launch copy checks, MVP flow guardrails and the production build.

Run browser smoke and accessibility checks:

```bash
npm run test:browser
```

Run dependency vulnerability checks:

```bash
npm run audit:deps
```

The browser suite uses Playwright. If Chromium is not installed locally, run:

```bash
npx playwright install chromium
```

## Production Build

```bash
npm run build
```

The production artifact is written to `dist/`.

## Deployment

Production hosting is Cloudflare Pages. GitHub Pages is not used.

Cloudflare Pages should track the `main` branch with:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `.node-version` / `.nvmrc`

GitHub Actions CI is the release gate before production changes are merged or pushed. The app also ships `public/_redirects` so Cloudflare Pages serves the React app for direct links such as `/careers` and routed pathway pages.

Deployment checklist:

- `npm ci`
- `npm run check`
- `npm run test:browser`
- Confirm `dist/` was generated by the Cloudflare Pages build.
- Confirm public copy still says starter guidance, template guidance and provider verification where needed.
- Confirm no `.env` file or private secret is committed.
- If Supabase is enabled in a future release, verify RLS with two separate learner accounts before launch.

Rollback is currently handled in Cloudflare Pages by redeploying a previous successful deployment, or by reverting the faulty `main` commit and letting the Cloudflare Pages Git integration deploy again.

## SA Foundation Data Layer

The repo includes a separate South African foundation-data workbench:

```text
data/sa-foundation/
```

This folder is not duplicate frontend catalog content. It preserves source/backbone data and now includes structures for subject-choice, qualification-pathway and research-archive alignment.

Key files:

```text
data/sa-foundation/README.md
data/sa-foundation/careerize_sa_repository_manifest.csv
data/sa-foundation/careerize_sa_top100_build_queue.csv
data/sa-foundation/careerize_sa_research_alignment.csv
data/sa-foundation/careerize_sa_starter_route_research_links.csv
data/sa-foundation/careerize_sa_starter_route_research_gaps.csv
data/sa-foundation/careerize_sa_research_graph_nodes.csv
data/sa-foundation/careerize_sa_research_graph_edges.csv
data/sa-foundation/qualification_pathway_schema.csv
data/sa-foundation/subject_choice_rules_seed.csv
data/sa-foundation/accreditation_source_registry.csv
```

Research-link coverage as of the current generated layer:

- 1,702 canonical research careers imported from the source archive.
- 589 of 2,676 live starter routes have a direct, suggestion or curated research link.
- 461 live starter routes are tracked in `data/sa-foundation/careerize_sa_starter_route_research_gaps.csv`.
- The Top 100 enrichment backlog is fully linked in `data/sa-foundation/careerize_sa_top100_research_gaps.csv`, which is intentionally header-only.

Regenerate the research layer with:

```bash
npm run generate:foundation-research
```

## Current Career Coverage

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

For the full coverage note, see `docs/CAREER_COVERAGE_MANIFEST.md`.

## Architecture Notes

Career data lives in:

```text
src/data/careerCatalog.js
src/data/masterCareerList.js
src/data/streams/
```

Scoring logic lives in:

```text
src/lib/scoring.js
```

Academic pathway template generation lives in:

```text
src/data/academicPathwayTemplates.js
src/data/careerPathwayGraph.js
```

Optional saved learner profile persistence helpers live in:

```text
src/lib/savedDiscovery.js
supabase/schema.sql
```

These helpers are not currently exposed in the public UI.

## Content Rules

- Every route ID must be unique.
- Every route must include required display fields.
- Every route must reference source records and confidence metadata.
- Careerize should not display detailed salary information in the starter product.
- Use qualitative earning-potential guidance such as high upside, steady earning path, variable by route, or stronger with scarce skills.
- Do not display salary numbers, salary bands, demand rankings or qualification eligibility claims without a source URL, access date and confidence score.
- Do not invent qualification names, APS scores, subject thresholds, accreditation status or provider availability.
- If entry requirements vary by institution, say `varies by institution`.
- If an APS score is not available, say `not publicly confirmed`.
- Career content must be honest, plain-English and useful to an uninformed learner.
- Personalised guidance must explain options and next steps; it must not tell users what they must do.
- Avoid overclaim phrases such as `perfect match`, `guaranteed` or `100% accurate`.

## Known Limitations

- This is not yet a fully provider-verified career intelligence graph.
- Account UX, Supabase RLS verification with real test users, admin content tooling, bulk import, real demand heatmaps, PWA/offline support and i18n are still future work.
- 461 live starter routes still need stronger research alignment.
- Detailed salary data is intentionally deferred.
- Subject-choice and qualification-pathway data are schema/seed/template layers and still need source-backed provider imports.
