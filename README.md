# Careerize

Careerize is a free, independent career-intelligence platform for South African learners, school leavers, parents, teachers and advisors who need to understand how school subjects connect to qualifications, training routes and real work.

The corrected product direction is a **subject-choice-to-career pathway engine** for Grade 9-12 learners, not a static career list and not a course marketplace.

## Current status

Careerize is at **expanded starter taxonomy + pathway-engine design** stage.

The live catalog currently covers **344 starter career routes** across **15 South African-first macro streams**. The breadth exists in the app catalog, but the next serious build is not more generic career dumping. The priority is to connect careers to Grade 10 subject decisions, Grade 12 exit requirements, NQF-aware qualification routes, provider-specific entry criteria, accreditation checks and first-work entry points.

## Core product idea

Careerize works backwards from a possible career direction:

```text
Career interest
→ Realistic career picture
→ Qualification route
→ Provider-specific entry requirements
→ Grade 12 marks / APS where available
→ Grade 10 subject choice
→ First-work entry point
→ Career progression and adjacent options
```

A learner should be able to ask:

- What subjects should I keep if I want this career?
- What doors close if I drop Mathematics or Physical Sciences?
- What routes remain open with Mathematical Literacy?
- Is this route university, TVET, trade, learnership, professional-body, vendor-certification or workplace based?
- What qualification do I need, what is the NQF level, and what entry criteria must I verify?
- What junior job can I realistically enter first?

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

## New pathway-engine documentation

```text
docs/SUBJECT_TO_CAREER_ENGINE.md
docs/QUALIFICATION_PATHWAY_DATA_MODEL.md
docs/BUILD_SEQUENCE_SUBJECT_CHOICE_ENGINE.md
```

These files define the updated product direction: Grade 9-12 subject choice first, then qualification mapping, then source-backed career enrichment.

## SA foundation data layer

The repo includes a separate South African foundation-data workbench:

```text
data/sa-foundation/
```

This folder is not duplicate frontend catalog content. It preserves source/backbone data and now includes the first explicit structures for subject-choice and qualification-pathway mapping.

Key files:

```text
data/sa-foundation/README.md
data/sa-foundation/careerize_sa_repository_manifest.csv
data/sa-foundation/careerize_sa_top100_build_queue.csv
data/sa-foundation/careerize_sa_graph_summary.csv
data/sa-foundation/qualification_pathway_schema.csv
data/sa-foundation/subject_choice_rules_seed.csv
data/sa-foundation/accreditation_source_registry.csv
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
docs/SUBJECT_TO_CAREER_ENGINE.md
docs/QUALIFICATION_PATHWAY_DATA_MODEL.md
docs/BUILD_SEQUENCE_SUBJECT_CHOICE_ENGINE.md
docs/CAREER_COVERAGE_MANIFEST.md
docs/SA_FOUNDATION_IMPORT_REVIEW.md
docs/FULL_OVERVIEW_REVIEW.md
docs/market-insights-decision-log.md
docs/REPO_ASSESSMENT.md
docs/PRODUCT_GAP_AUDIT.md
docs/SOURCES.md
```

`docs/SUBJECT_TO_CAREER_ENGINE.md` is the active product direction file for the corrected Careerize strategy.

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

## Qualification and subject-choice rules

Careerize must support the following route types:

- university route
- university of technology route
- TVET route
- trade route
- occupational route
- learnership route
- workplace route
- professional body route
- vendor certification route
- self-study route
- portfolio route
- bridging route

Careerize must support more than degrees:

- Higher Certificates
- Diplomas
- Advanced Diplomas
- Bachelor's Degrees
- Extended Degrees
- Occupational Certificates
- National Certificate Vocational programmes
- NATED / Report 191 routes
- Learnerships
- Apprenticeships
- Trade Tests
- Professional Certificates and designations
- Vendor certificates
- Short courses
- Bridging programmes
- Portfolio and workplace routes

## Content rules

- Every route ID must be unique.
- Every route must include required display fields.
- Every route must reference source records and confidence metadata.
- Careerize should not display detailed salary information in the starter product.
- Use qualitative earning-potential guidance such as high upside, steady earning path, variable by route, or stronger with scarce skills.
- Do not display salary numbers, salary bands, demand rankings or qualification eligibility claims without a source URL, access date and confidence score.
- Do not invent qualification names, APS scores, subject thresholds, accreditation status or provider availability.
- If entry requirements vary by institution, say `varies by institution`.
- If an APS score is not available, say `not publicly confirmed`.
- If a qualification or vendor certification is retired, mark it as `retired_or_discontinued` and store the current replacement route if verified.
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
- The new subject-choice and qualification-pathway files are schema/seed layers. They still need frontend components, validation scripts and source-backed provider imports.
