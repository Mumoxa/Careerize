# Deployment readiness

## Current status

The app is deployment-ready as a static Vite frontend if `npm run check` passes. Pushes to `main` run the CI/CD deploy workflow, upload `dist`, and deploy to GitHub Pages. It supports browser-only local demo records without environment variables. It supports real cross-device learner login, profile metadata and saved discovery records only when Supabase Auth/Postgres is configured and the RLS-backed schema has been installed. It should not be marketed as a full career platform yet because school dashboards, employer dashboards, admin tools, payments, uploads and AI integrations are not implemented.

## Required commands

```bash
npm ci
npm run check
```

## Automated CI/CD

- Pull requests and pushes to `main` run `.github/workflows/ci.yml` for locked install, catalog validation and build.
- Pushes to `main` and manual `workflow_dispatch` runs also execute `.github/workflows/deploy.yml`, which repeats `npm ci` and `npm run check`, uploads `dist`, and deploys to GitHub Pages.
- Vite uses a relative asset base so the generated static build can run from GitHub Pages project paths or another static host.

## Environment variables

No frontend environment variables are required for local demo mode. To enable real cross-device learner login and saved results, copy `.env.example` to `.env.local`, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, run the latest `supabase/schema.sql`, and verify row-level security before launch. The schema includes the required authenticated-role grants as well as RLS policies; re-run it if Supabase reports `permission denied for table careerize_profiles`. The anon key is public client configuration, not a server secret.

## Pre-deployment checklist

- [ ] `npm run validate:catalog` passes.
- [ ] `npm run build` passes.
- [ ] Review the built UI on mobile, tablet and desktop.
- [ ] Confirm partner contact destination is correct.
- [ ] Confirm no claims imply guaranteed career outcomes, verified employment, automated counselling or hiring suitability.
- [ ] If Supabase is enabled, run the latest `supabase/schema.sql` and manually verify sign up, login, save, logout and restore with two separate test users.
- [ ] If analytics are added, document consent and avoid tracking unnecessary learner-level sensitive data.
