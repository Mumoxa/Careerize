# Deployment readiness

## Current status

The app is deployment-ready as a static Vite frontend demo if `npm run check` passes. It should not be marketed as a complete authenticated platform yet because auth, persistence, school dashboards, employer dashboards, admin tools, payments, uploads and AI integrations are not wired into the frontend.

## Required commands

```bash
npm ci
npm run check
```

## Environment variables

No frontend environment variables are required for local demo mode. To enable real cross-device learner login and saved results, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, run `supabase/schema.sql`, and verify row-level security before launch. The anon key is public client configuration, not a server secret.

## Pre-deployment checklist

- [ ] `npm run validate:catalog` passes.
- [ ] `npm run build` passes.
- [ ] Review the built UI on mobile, tablet and desktop.
- [ ] Confirm partner contact destination is correct.
- [ ] Confirm no claims imply guaranteed career outcomes, verified employment, automated counselling or hiring suitability.
- [ ] If Supabase is enabled, run `supabase/schema.sql` and manually verify RLS policies with two test users.
- [ ] If analytics are added, document consent and avoid tracking unnecessary learner-level sensitive data.
