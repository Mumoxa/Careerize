# Careerize

Careerize is a free, independent career-intelligence platform for South African learners, school leavers, jobseekers, parents and advisors who need to understand real work before choosing subjects, qualifications, training routes or first-work options.

The product compares careers honestly: day-to-day work, tools, environment, stress, lifestyle impact, routes in, routes up, earning-potential insight, demand uncertainty, growth limits, worst parts, best parts, related careers and next safe experiments.

## Current status

Careerize is now at **expanded starter taxonomy** stage.

The live catalog currently covers **344 starter career routes** across **15 South African-first macro streams**.

This is not yet a fully source-verified 344-career knowledge graph. The breadth now exists in the app catalog; the next step is staged enrichment of the first 100 priority careers with source-backed South African pathway detail.

## Current stack

- Vite
- React
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase Auth and Row Level Security when configured

## Current product surface

The current app includes:

- South African-first landing page and audience segmentation.
- Simple discovery questions.
- Interest tags.
- Deterministic career-route signals.
- Transparent recommendation explanations showing matched signals, missing signals, confidence and next step.
- 344 structured starter career routes across 15 macro streams.
- Structured starter career profiles with day-in-life, tasks, subjects, qualification/pathway notes, misconceptions, best/worst parts and uncertainty states.
- Source registry and confidence display for starter content.
- Qualitative earning-potential insights instead of detailed salary information.
- Demand sections that clearly show when source-verified data is not yet available.
- Low-data mode toggle.
- Learner-owned saved profile and discovery-result persistence through Supabase when configured.
- Local-browser demo fallback when Supabase environment variables are absent.
- South African pathway readiness across NSC, university, TVET, learnership, apprenticeship, short-course, work and pivot routes.

## SA foundation data layer

The repo now includes a separate South African foundation-data workbench:

```text
data/sa-foundation/
```

This folder is not duplicate frontend catalog content. It preserves source/backbone data from the supplied workspace for the next build phase: OFO/OIHD mapping, qualification-pathway logic, graph summaries, Top 100 enrichment sequence and verification workflow.

Key files:

```text
data/sa-foundation/README.md
data/sa-foundation/careerize_sa_repository_manifest.csv
data/sa-foundation/careerize_sa_top100_build_queue.csv
data/sa-foundation/careerize_sa_graph_summary.csv
docs/SA_FOUNDATION_IMPORT_REVIEW.md
```

## Current career coverage

The 344 starter routes are spread across:

| Macro stream | Starter routes |
|---|---:|
| Technology, data and AI | 36 |
| Skilled trades, construction and engineering | 30 |
| Finance, admin and business operations | 28 |
| Creative, media and design | 26 |
| Health, care and social services | 25 |
| Science, research and frontier careers | 25 |
| Agriculture, food and environment | 24 |
| Manufacturing, mining and energy | 22 |
| Informal, entrepreneurship and community economy | 20 |
| Law, public service and public safety | 20 |
| Sales, marketing and customer work | 20 |
| Hospitality, tourism, sport and events | 18 |
| Logistics, transport and supply chain | 18 |
| Arts, culture, heritage and society | 16 |
| Education, training and youth development | 16 |
| **Total** | **344** |

For the full coverage note, see:

```text
docs/CAREER_COVERAGE_MANIFEST.md
```

## Documentation

```text
docs/CAREER_COVERAGE_MANIFEST.md
docs/SA_FOUNDATION_IMPORT_REVIEW.md
docs/FULL_OVERVIEW_REVIEW.md
docs/market-insights-decision-log.md
docs/REPO_ASSESSMENT.md
docs/PRODUCT_GAP_AUDIT.md
docs/SOURCES.md
```

`docs/FULL_OVERVIEW_REVIEW.md` is the active alignment note for the consolidated overview. It keeps the full strategy direction but amends salary-band recommendations into qualitative earning-potential guidance for the active product.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run check
```

`npm run check` validates the career catalog, validates the SA foundation workbench and then builds the app.

## Supabase saved-profile setup

The app works without Supabase in local demo mode. To enable cross-device learner login and saved learner profiles:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Set these frontend environment variables:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The anon key is public frontend configuration, not a server secret. Do not commit `.env` files.

## Career catalog structure

Career data lives in:

```text
src/data/careerCatalog.js
```

Scoring logic lives in:

```text
src/lib/scoring.js
```

Saved learner profile and discovery persistence lives in:

```text
src/lib/savedDiscovery.js
```

The current catalog is generated from macro-stream seed groups plus shared field templates. This creates the broad exploration universe now while keeping the content marked as starter/editorial until deeper source-backed enrichment is added.

## Content rules

- Every route ID must be unique.
- Every route must include required display fields.
- Every route must reference source records and confidence metadata.
- Careerize should not display detailed salary information in the starter product.
- Use qualitative earning-potential guidance such as high upside, steady earning path, variable by route, or stronger with scarce skills.
- Do not display salary numbers, salary bands, demand rankings or qualification eligibility claims without a source URL, access date and confidence score.
- Career content must be honest, plain-English and useful to an uninformed learner.
- Content must explain jargon and avoid assuming a university-bound, privileged or already-informed user.
- Content must include the unglamorous reality of the work, not just the attractive parts.
- Personalised guidance must explain options and next steps; it must not tell users what they must do.
- Avoid overclaim phrases such as “perfect match”, “guaranteed” or “100% accurate”.

## Deployment

Deployment trigger: latest aligned frontend should deploy from `main`.

## Known technical debt

- A `package-lock.json` should be generated from a clean local install and committed. Until that is done, CI uses `npm install` instead of `npm ci`.
- Full admin content tooling, bulk import, real demand heatmaps, PWA/offline support, i18n files, accessibility tests and e2e tests are still future work.
- Detailed salary data is intentionally deferred. Careerize should stay with qualitative earning-potential insight unless there is a strong source-backed product reason to add salary detail later.
