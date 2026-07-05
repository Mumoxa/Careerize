# Production Readiness Review

Date: 28 June 2026
Scope: Careerize public Vite/React app, validation scripts, CI/CD, documentation and optional Supabase foundation.

## Current Launch Shape

Careerize is currently suitable as an account-free public guidance SPA when the validation suite passes. It is not yet suitable to market as a fully provider-verified career intelligence graph or as a saved-profile account platform.

Current production surface:

- 1,050 starter career routes across 18 South African-first macro streams.
- Discovery questions, interest signals and career-reality sliders.
- Deterministic ranking with transparent guidance boundaries.
- Academic pathway template guidance for every starter route.
- Source and confidence guardrails for starter content.
- Playwright smoke and axe accessibility tests against the production build.

## Audit Findings Addressed

- Public copy still referenced the older 344-route catalog.
- README and deployment docs described saved profiles as live public behavior even though the UI does not expose account creation or login.
- README listed Framer Motion even though it is not a dependency.
- Node version files and deploy workflow were inconsistent.
- Browser tests could pass but hang because Playwright did not always return cleanly after starting the dev server.
- Public-copy validation did not catch stale route counts, mojibake or documentation overclaims.
- Dependency audit was not available as a repeatable repo command.

## Changes Made

- App hero route count now renders from `CAREER_COVERAGE_SUMMARY`.
- Subject selected state now uses the existing Lucide check icon instead of an encoding-sensitive glyph.
- README, architecture notes, coverage manifest and deployment-readiness docs now describe the real current platform state.
- CI and deploy workflows now run dependency audits.
- Node version handling now uses `.node-version` consistently.
- `npm run audit:deps` runs `npm audit --audit-level=moderate` with system CAs.
- `npm run test:browser` now builds the app, serves `dist/` with `vite preview`, runs Playwright, and reliably shuts down the server.
- Validation now checks coverage-summary counts, launch-doc route counts, mojibake, stale 344-route app copy and saved-profile overclaims.
- MVP flow validation now covers lifestyle preference scoring metadata and ensures sliders do not inflate signal match percentages.

## Verification

Commands run successfully:

```bash
npm run check
npm run test:browser
npm run audit:deps
git diff --check
```

Browser QA covered:

- Public discovery and pathway journey.
- Automated WCAG A/AA axe scan on landing and pathway states.

Security checks covered:

- Dependency audit reports 0 moderate-or-higher vulnerabilities.
- No secrets are required for the current public app.
- Supabase anon key guidance is documented as public frontend config only.
- Saved-profile launch is explicitly blocked on future RLS and privacy-flow verification.

## Remaining Risks

- Supabase saved-profile UX is not production-ready until RLS is verified with two real learner accounts and export/delete/privacy copy are tested.
- 461 live starter routes still need stronger research alignment.
- Career content is broad starter guidance, not provider-verified qualification advice.
- No production monitoring or analytics are configured.
- `src/App.jsx` is still a large component and should be split before adding account, admin or deeper pathway flows.
- No Dockerfile is needed for the current static Cloudflare Pages deployment, but one may be useful if the app moves to a container host.

## Launch Assessment

Go for a public starter-guidance launch if CI passes and the product is framed as account-free exploratory guidance with provider-verification limits.

No-go for claims that Careerize is fully provider-verified, salary-verified, demand-verified, account-enabled or ready for school-wide learner-data storage.
