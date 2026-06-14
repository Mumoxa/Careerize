# Careerize

Careerize is an independent, free career-intelligence platform for South African Grade 10 learners, school leavers and early-career explorers who need to understand what real work looks like before they choose subjects, studies, training routes or first-work options.

The product exists to show careers honestly: day-to-day work, tools, environment, stress, lifestyle impact, routes in, routes up, earnings reality, growth limits, worst parts, best parts and related careers learners may not know exist.

## Strategic boundary

Careerize is not a marketplace, job board, recruitment tool, course directory, employer pipeline, personality test or black-box AI career advisor. It must not sell jobs, sell courses, collect CVs for employers, broker introductions, run placements, or allow commercial partners to influence career content.

Personalised guidance is allowed when it serves the learner. The platform may save learner-owned profiles, discovery answers, interests, notes, route comparisons and exploration history so the user can return later and receive better guidance. This saved layer must never become a CV database, employer unlock system, hiring funnel, advertising profile, payment store or commercial marketplace.

The repository must only contain what is necessary to build and maintain the independent career-intelligence platform.

Do not commit:

- Client, employer, recruiter, sponsor or marketplace account data.
- Learner CVs, job applications, candidate records or recruitment records.
- Payment records, invoices, billing logs, card details, bank details or payment credentials.
- Marketing lists, lead lists or unrelated contact data.
- API keys, secrets, access tokens or private credentials.
- Any feature that implies automated suitability decisions, hiring decisions, admissions decisions or psychometric certainty.

Allowed learner-owned records:

- Account authentication identifiers needed for login.
- Lightweight learner profile fields used for guidance context.
- Discovery answers, selected interests, saved route comparisons and notes.
- Discovery-session history used for learner reflection and product improvement.
- Consent, privacy and deletion/correction records when those flows are added.

For the full product boundary, see:

```text
docs/strategy-and-repo-scope.md
```

## Current stack

- Vite
- React
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase Auth and Row Level Security when configured

## Current product surface

The current app includes:

- Simple discovery questions.
- Interest tags.
- Deterministic career-route signals.
- Learner-owned saved profile and discovery-result persistence through Supabase when configured.
- Local-browser demo fallback when Supabase environment variables are absent.
- Career reality cards.
- Entry and growth pathway prompts.
- Independence and trust principles.

There is no payment flow, employer dashboard, course sales, CV upload, recruitment workflow or commercial partner pipeline.

## Run locally

```bash
npm install
npm run dev
```

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

## Production build

```bash
npm run check
```

`npm run check` validates the career catalog and then builds the app.

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

This separation is intentional. Future career routes should be added to the catalog without changing the main UI logic. Route suggestions are guidance signals only, not suitability verdicts.

## Adding a new career route

Add a new object to `CAREER_ROUTES` with:

- `id`
- `title`
- `stream`
- `signalWeights`
- `summary`
- `day`
- `tools`
- `environment`
- `stress`
- `remote`
- `growth`
- `worst`
- `best`

Then run:

```bash
npm run validate:catalog
npm run build
```

## Content rules

- Every route ID must be unique.
- Every signal weight must reference a known question option or interest signal.
- Every route must include all display fields.
- Signal weights must be positive numbers.
- Career content must be honest, plain-English, and useful to an uninformed learner.
- Content must explain jargon and avoid assuming a university-bound, privileged or already-informed user.
- Content must include the unglamorous reality of the work, not just the attractive parts.
- Personalised guidance must explain options and next steps; it must not tell users what they must do.

## Deployment

Deployment trigger: latest aligned frontend should deploy from `main`.

## Known technical debt

A `package-lock.json` should be generated from a clean local install and committed. Until that is done, CI uses `npm install` instead of `npm ci`.
