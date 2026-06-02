# Careerize

Careerize is a gamified career discovery experience for South African Grade 10 learners and school leavers who do not yet know what real work looks like.

## Current stack

- Vite
- React
- Tailwind CSS
- Framer Motion
- Lucide React icons

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

This separation is intentional. Future career routes should be added to the catalog without changing the main UI logic.

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

## Deployment

Deployment trigger: latest optimized frontend should deploy from `main`.

## Known technical debt

A `package-lock.json` should be generated from a clean local install and committed. Until that is done, CI uses `npm install` instead of `npm ci`.
