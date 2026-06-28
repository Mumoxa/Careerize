# Deployment readiness

## Current status

The app is deployment-ready as a Vite frontend if `npm run check` passes. It includes optional Supabase-backed learner-owned saved profiles. Without Supabase environment variables, it falls back to local-browser demo mode.

It can be marketed as a broad South African career intelligence and subject-choice decision-support platform only if the launch copy is honest that detailed demand, salary, APS and provider-entry claims remain locked until source-verified. The catalog is now broad enough for exploration, but the 461-route research queue still needs staged verification.

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

The schema includes production evidence tables:

- `careerize_claim_verifications` for claim-level source evidence, review status, confidence and published-claim evidence constraints.
- `careerize_research_queue` for the 461-career editorial/source-verification queue.
- `careerize_research_team_workplan` for lane, phase, role, evidence-review and learner-safety QA assignments.

## Pre-deployment checklist

- [ ] `npm run validate:catalog` passes.
- [ ] `npm run validate:foundation` passes after regenerating qualification coverage and the career research queue.
- [ ] `npm run validate:production` passes and confirms the generated 461-row files match the live route IDs.
- [ ] `npm run validate:recommendations` passes and confirms learner-intent scenarios do not route to unrelated careers.
- [ ] `npm run build` passes.
- [ ] Review the UI on mobile, tablet and desktop.
- [ ] Confirm the saved-profile flow restores profile, answers, route signals and reality preference sliders.
- [ ] Confirm no copy implies guaranteed outcomes, psychometric certainty, hiring suitability, source-verified demand, salary figures or course/employer promotion.
- [ ] If Supabase is enabled, test row-level security with two separate learner accounts.
- [ ] If analytics are added, document consent and avoid unnecessary learner-level tracking.

## Production gate added 2026-06-28

`npm run check` now performs:

```bash
npm run export:qualification-coverage
npm run export:career-research-queue
npm run export:research-team-workplan
npm run validate:catalog
npm run validate:foundation
npm run validate:production
npm run validate:recommendations
npm run build
```

The product is allowed to be broad before it is fully source-verified only because the UI and validators keep high-risk claims blocked. Do not remove the proof ledger, evidence-state display, research queue or production validator unless there is a replacement content-governance workflow.

The recommendation validator protects against high-income preference being treated as finance/accounting interest. It also checks route links, similar-career links and generated CSV route IDs.
