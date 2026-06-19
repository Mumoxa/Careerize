# Deployment readiness

## Current status

The app is deployment-ready as a Vite frontend if `npm run check` passes. It includes optional Supabase-backed learner-owned saved profiles. Without Supabase environment variables, it falls back to local-browser demo mode.

It should not be marketed as a complete career platform yet because the catalog is still small and deeper profile, privacy, deletion/correction and testing flows still need expansion.

## Required commands

```bash
npm install
npm run check
```

## Environment variables

No frontend environment variables are required for local demo mode.

To enable real cross-device learner login and saved profiles, configure:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Then run `supabase/schema.sql` and verify row-level security before launch. The current SQL is intended for first setup. If you rerun it after policies already exist, drop or rename duplicate policies first.

## Pre-deployment checklist

- [ ] `npm run validate:catalog` passes.
- [ ] `npm run build` passes.
- [ ] Review the UI on mobile, tablet and desktop.
- [ ] Confirm the saved-profile flow restores profile, answers and route signals.
- [ ] Confirm no copy implies guaranteed outcomes, psychometric certainty, hiring suitability or course/employer promotion.
- [ ] If Supabase is enabled, test row-level security with two separate learner accounts.
- [ ] If analytics are added, document consent and avoid unnecessary learner-level tracking.
