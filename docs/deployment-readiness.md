# Deployment Readiness

## Current Status

Careerize is deployable today as a static Vite/React frontend when `npm run check` and `npm run test:browser` pass.

The current public launch surface is account-free. It does not expose Supabase login, saved profiles or cross-device persistence in the UI. Supabase schema and persistence helpers exist for a future release, but that flow needs RLS verification and user-facing privacy UX before launch.

The public catalog currently contains 2,676 starter career routes across 18 macro streams.

This should be marketed as a starter career-guidance and pathway-exploration platform with claim-evidence governance, not as a fully provider-verified career intelligence graph yet.

## Required Commands

```bash
npm ci
npm run audit:deps
npm run export:claim-evidence
npm run validate:claim-evidence
npm run check
npm run test:browser
```

## Environment Variables

No frontend environment variables are required for the current public app.

Future optional Supabase configuration:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The Supabase anon key is public frontend configuration, not a server secret. Do not commit `.env` files.

Before enabling saved profiles:

- Run `supabase/schema.sql`.
- Verify row-level security with at least two separate learner accounts.
- Verify export/delete flows.
- Add visible privacy copy before collecting learner data.

## Cloudflare Pages Deployment

Production hosting is Cloudflare Pages. GitHub Pages is not used.

Cloudflare Pages should track the `main` branch with:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `.node-version` / `.nvmrc`

GitHub Actions CI is the release gate for validation, browser smoke and accessibility checks. The app includes `public/_redirects` so Cloudflare Pages can serve the React single-page app for direct route loads such as `/careers` and pathway detail URLs.

Release checklist:

- `npm ci` completes.
- `npm run audit:deps` reports no moderate-or-higher vulnerabilities.
- `npm run check` passes.
- `npm run test:browser` passes.
- `data/sa-foundation/career_claim_evidence.csv` covers all 2,676 live careers.
- GitHub Actions CI and Cloudflare Pages use the same Node version file.
- Public copy still uses starter/template/provider-verification language.
- No `.env` file, service-role key, private API key or token is committed.
- The generated research-layer data is in sync with `npm run generate:foundation-research` when data changes.
- The generated claim-evidence data is in sync with `npm run export:claim-evidence` when catalog or research data changes.
- `data/sa-foundation/careerize_sa_starter_route_research_gaps.csv` is reviewed if the catalog changes.

## Rollback

Rollback is currently commit-based:

1. Revert the faulty commit or redeploy a previous known-good commit.
2. Let the Cloudflare Pages Git integration rebuild and publish `dist/`.
3. Re-run smoke checks against the public URL.

## Production Gaps

- No backend runtime health endpoint is required for the current static app.
- No production database is required for the current public UI.
- Monitoring, analytics and error reporting are not configured yet.
- Saved-profile launch requires Supabase RLS verification and privacy UX.
- Provider-verified career data ingestion still needs governed admin tooling.
- Salary figures, APS/marks, provider-specific entry requirements, accreditation status, province-level demand and employment outcomes remain blocked until source-specific evidence rows are reviewed.
