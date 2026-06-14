# Careerize

Careerize is a trusted career discovery experience for South African Grade 10 learners and school leavers who need to compare real work patterns, stress, tools, entry routes and growth paths before making subject, study or first-work decisions.

## Current stack

- Vite
- React
- Tailwind CSS
- Framer Motion
- Lucide React icons

## Run locally

```bash
npm ci
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

This separation is intentional. Future career routes should be added to the catalog without changing the main UI logic. Route suggestions are deterministic guidance signals, not automated suitability decisions.

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

## Data rules

- Every route ID must be unique.
- Every signal weight must reference a known question option or interest signal.
- Every route must include all display fields.
- Signal weights must be positive numbers.

## Product and architecture docs

- `docs/product-strategy.md` explains the 2030-ready product thesis and trust principles.
- `docs/architecture.md` documents the current frontend architecture, Supabase boundary and target architecture.
- `docs/deployment-readiness.md` lists deployment checks and current platform limitations.

## Deployment

Deployment trigger: latest optimized frontend should deploy from `main`. CI installs dependencies with `npm ci` from the committed lockfile, validates the catalog, and builds the app.
