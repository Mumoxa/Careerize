# Deployment readiness

## Current status

The app is deployment-ready as a static Vite frontend demo if `npm run check` passes. It should not be marketed as a complete authenticated platform yet because auth, persistence, school dashboards, employer dashboards, admin tools, payments, uploads and AI integrations are not wired into the frontend.

## Required commands

```bash
npm ci
npm run check
```

## Environment variables

No frontend environment variables are required for the current static demo.

Future Supabase work should document any `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` usage, ensure anon keys are not treated as secrets, and verify row-level security before launch.

## Pre-deployment checklist

- [ ] `npm run validate:catalog` passes.
- [ ] `npm run build` passes.
- [ ] Review the built UI on mobile, tablet and desktop.
- [ ] Confirm partner contact destination is correct.
- [ ] Confirm no claims imply guaranteed career outcomes, verified employment, automated counselling or hiring suitability.
- [ ] If Supabase is enabled, run `supabase/schema.sql` and manually verify RLS policies with two test users.
- [ ] If analytics are added, document consent and avoid tracking unnecessary learner-level sensitive data.
