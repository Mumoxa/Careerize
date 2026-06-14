# Careerize

Careerize is an independent, free career-intelligence platform for South African Grade 10 learners, school leavers and early-career explorers who need to understand what real work looks like before they choose subjects, studies, training routes or first-work options.

The product exists to show careers honestly: day-to-day work, tools, environment, stress, lifestyle impact, routes in, routes up, earnings reality, growth limits, worst parts, best parts and related careers learners may not know exist.

## Strategic boundary

Careerize is not a marketplace, job board, recruitment tool, course directory, employer pipeline, personality test or AI career advisor. It must not sell jobs, sell courses, collect CVs for employers, broker introductions, run placements, or allow commercial partners to influence career content.

The repository must only contain what is necessary to build and maintain the independent career-intelligence platform.

Do not commit:

- Client, employer, recruiter, sponsor or marketplace account data.
- Learner CVs, job applications, candidate records or recruitment records.
- Payment records, invoices, billing logs, card details, bank details or payment credentials.
- Marketing lists, lead lists or unrelated contact data.
- API keys, secrets, access tokens or private credentials.
- Any feature that implies automated suitability decisions, hiring decisions, admissions decisions or psychometric certainty.

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

## Current product surface

The current app is a static frontend discovery demo. It includes:

- Simple discovery questions.
- Interest tags.
- Deterministic career-route signals.
- Career reality cards.
- Entry and growth pathway prompts.
- Independence and trust principles.

There is no active backend, no learner login, no saved learner records, no payment flow, no employer dashboard, no course sales and no recruitment workflow.

## Run locally

```bash
npm install
npm run dev
```

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

## Deployment

Deployment trigger: latest aligned frontend should deploy from `main`.

## Known technical debt

A `package-lock.json` should be generated from a clean local install and committed. Until that is done, CI uses `npm install` instead of `npm ci`.
