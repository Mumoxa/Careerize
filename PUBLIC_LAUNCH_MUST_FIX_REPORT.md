# Careerize Public Launch Must-Fix Report

Date: 2026-06-20

Scope: targeted public-launch readiness pass

Launch framing: exploratory career-intelligence tool with starter guidance

## Public launch verdict

**GO for a scoped exploratory public launch with saved profiles disabled.**

The mounted journey, trust labels, browser smoke test, automated accessibility check, CI/deployment gates, and low-data landing assets now pass. The launch build does not expose browser-only pseudo-accounts.

**NO-GO for enabling public saved profiles until the launch Supabase project passes a two-user RLS, export, and deletion test.** No live project credentials exist in this repository, so local work could not prove the deployed policies. All 344 current pathways remain starter templates. Careerize must not display a `Verified pathway` badge for them.

## Product flows discovered

### 1. Landing and hero

Before this pass, the hero said `Find careers that fit how you think, work and live` and promised to show learners how subjects could take them to a career. The app collected four single-choice discovery answers and interest tags. It did not collect or verify enough information to establish fit, readiness, eligibility, or provider admission.

The new hero says `Explore career and study routes from the signals you choose.` It defines the product as starter exploration and places the admissions/provider boundary above the first CTA.

### 2. Discovery

Learners answer four discovery questions and select interest signals. `rankCareerRoutes` adds shared signal weights. The 344 careers use only 14 distinct scoring signatures, so many routes tie and fall back to title ordering. The result represents signal overlap, not suitability.

Selections now reorder the exploration matches and update the URL, for example `?signals=technology`. Search and career-cluster filters work. The former unconnected `Search interests` control no longer appears.

### 3. Pathway view

Before this pass, result cards changed local React state but did not update the URL, move focus, or open a full detail surface. The mounted pathway showed four short steps. Richer pathway code existed below the mounted app but had no call sites.

Learners can now open a pathway from an exploration card. The URL gains a pathway ID, focus moves to the pathway heading, and the detail shows:

- pathway name and career cluster;
- why the route matched;
- subject relevance and an optional template-risk check;
- qualification types and starter entry notes;
- starter/template/verification labels;
- provider-verification warning; and
- next exploration steps.

### 4. Subject guidance

Every academic pathway comes from a stream-level template. `academicPathwayTemplates.js` assigns `template_linked_needs_provider_verification` to all 344 routes at confidence 45. The repository contains zero provider-specific verified pathways.

The former green result `Route appears open` could imply eligibility. Subject checks now use template-safe labels such as `No template subject gap found`, `Some template subject signals are missing`, and `Provider check needed before subject decisions`.

### 5. Saved profile and persistence

The mounted pre-pass shell did not expose its saved-profile components, but the data layer could create a local pseudo-session when Supabase configuration was absent. The local password had no authentication effect. Anyone with a known email on the same browser could restore that record.

Stored fields included preferred name, stage, location, subjects, Mathematics choice, marks band, notes, answers, signals, latest results, and history. Supabase tables stored a profile, latest discovery, and append-only discovery sessions. The old export omitted history. The old save wrote roughly 1.9 MB of ranked route objects each time. The supplied RLS schema lacked owner DELETE policies.

Production now fails closed when Supabase is absent. Local demo persistence works only in Vite development mode. The public UI does not expose saved profiles. Export includes discovery history, saved results use a compact snapshot, and the schema includes owner DELETE policies. Data deletion reports that the authentication account remains.

### 6. Dead controls

The audit found:

- a visible interest search with no state or handler;
- `View details` buttons that changed selection without navigation or focus;
- a final `Next question` button that could become a no-op; and
- several richer components with no mounted call sites.

The public journey now uses functional controls. The old dead interest search no longer appears. The final question CTA moves to results, and pathway buttons update the URL and open the detail surface.

### 7. Test and release gate

The repository had catalog/pathway validation and a Vite build. It had no Playwright dependency, browser smoke suite, axe test, or browser CI step. Both CI and the Pages deployment could ship after build-only checks.

The repository now includes Playwright smoke and axe suites. CI and deployment install Chromium and run the browser gate before deployment.

### 8. Performance

The mounted app synchronously imported four PNGs totalling about 7.9 MB. Three appeared above the fold. CSS also loaded five Manrope weights from Google Fonts.

The launch app now loads one responsive JPEG image. Its 1280 px version is 115,413 bytes and its 640 px version is 39,132 bytes. The 1280 px derivative is 94.4% smaller than the 2,069,383-byte PNG source. The external font request and unused Framer Motion dependency were removed.

## Must-fix decisions and outcomes

| Area | Product decision | Technical finding | Fix applied | Test or verification | Remaining risk |
|---|---|---|---|---|---|
| Verified guidance boundaries | Treat every current pathway as starter/template guidance. Reserve `Verified pathway` for provider-specific, source-backed records. | All 344 pathways share the `template_linked_needs_provider_verification` status. The old mounted UI discarded that status. | Added `Starter guidance`, `Template guidance`, and `Needs provider verification` at the hero and pathway detail. Added a verified-state code path and a learner-facing explanation that no current route qualifies. Added the provider warning next to detail content. | Public-copy validator passed. Browser journey confirmed all three current labels and the admissions disclaimer. Academic pathway validation confirmed 344 template-linked routes. | No current route supports provider-specific eligibility or admission claims. |
| Recommendation honesty | Present ranked results as exploration matches based on selected signals. | Scoring sums shared tag weights and cannot establish readiness, feasibility, or best fit. | Rewrote hero/results copy, removed percentage-style recommendation framing, and added `Why this route` signal explanations plus an admissions disclaimer. Expanded unsafe-language validation. | Catalog validation and unsafe/safe copy regressions passed. Browser check showed results reorder after selecting `Digital tools`. | Within-cluster ordering remains coarse. Labels must stay visible until scoring gains stronger evidence. |
| Mounted core journey | Require a linkable landing-to-pathway journey with no dead ends. | The old app used anchors and local selection only. Richer components were unmounted. | Added linkable signal and pathway query state, working route search/filter, result list, focus management, subject-risk check, qualification cards, warnings, and next steps. Removed the dead interest search. | Playwright smoke passed. Manual browser verification produced `?signals=technology&pathway=ai-product-specialist`, moved focus to the detail heading, and logged no console warnings/errors. | Deep links restore signals/pathway, but discovery-question answers remain session-only. |
| Browser release gate and accessibility | Block CI and deployment on build, smoke, and axe checks. | No browser/a11y tooling existed. | Added Playwright, axe, config, smoke suite, accessibility suite, package scripts, CI step, and deployment step. | Full browser gate: 2 passed in 2.1 minutes. Axe found zero automated WCAG A/AA violations on landing and post-selection pathway states. | Automated axe does not replace screen-reader, full keyboard, or multi-browser testing. |
| Privacy and persistence | Launch exploration without saved accounts unless real Supabase auth is configured and tested. | Production could fall back to impersonable local pseudo-auth. Export omitted history. RLS lacked deletes. Saves duplicated about 1.9 MB. Account deletion was not implemented. | Limited local mode to development, blocked production fallback, compacted saved results to about 1.9 KB in the measured sample, added history export, added owner DELETE policies, verified deletion rows, and returned `auth_account_deleted: false`. Public saved-profile UI stays off. | Static production-mode check blocked pseudo-sign-in. Build passed. Schema check found three owner DELETE policies. Browser showed no account/pseudo-login surface. | Live two-user Supabase RLS/delete/export testing and actual auth-account deletion remain unverified. Do not enable saved profiles yet. |
| Low-data performance | Keep the first journey light and remove third-party font weight. | Four mounted PNGs totalled about 7.9 MB. Google Fonts added a network dependency. | Replaced mounted photos with responsive 640/1280 JPEGs, set dimensions/sizes/async decoding, removed Google Fonts and Framer Motion, and removed dead component code from the bundle. | Production build emitted only the 39 KB and 115 KB learner images. JS is 228.47 KB uncompressed / 72.28 KB gzip; CSS is 22.75 KB / 5.08 KB gzip. | Four large source PNGs remain in the repository but do not ship. Archive or remove them after asset ownership is confirmed. |

## Copy and language changes

Launch framing now states:

> Careerize helps you explore possible study and career routes based on the signals you choose. This is starter guidance, not an admissions decision. Check subject and entry requirements with each provider.

The pass removed or blocked language that implies:

- qualification or eligibility;
- a best route or recommended career;
- provider-verified subject requirements; or
- a probability/readiness percentage.

The copy validator rejects `you qualify`, direct eligibility claims, `best route for you`, `recommended career`, `route appears open`, `perfect match`, and guarantee language. It allows provider-verification warnings and safe recommended-subject descriptions.

## Privacy and persistence changes

- Production/no-config mode returns no local session and blocks local pseudo-sign-in.
- Development can still use explicitly labelled local demo persistence.
- The launch UI does not mount saved-profile controls.
- Compact snapshots store route ID, title, stream, score, overlap, and matched signals for a small top subset.
- Export returns profile, latest discovery, and `discovery_history`.
- Local demo history is append-only within the local record.
- Supabase history export reads all owner rows in created order.
- Owner DELETE policies cover profile, latest results, and discovery sessions.
- Delete re-queries all three tables before claiming success.
- Delete returns `auth_account_deleted: false`; it does not pretend to delete the Supabase auth account.

## Accessibility results

`tests/e2e/accessibility.spec.js` scans the landing state and a selected pathway state with axe tags for WCAG 2 A/AA and WCAG 2.1 A/AA.

Result: **PASS, zero automated violations**.

Source-level improvements include a skip link, visible focus styles, reduced-motion support, semantic landmarks/headings, labelled search/filter controls, pressed states, live status text, pathway focus management, explicit button types, and non-colour trust labels.

## Performance changes

| Asset or bundle | Before | After | Launch effect |
|---|---:|---:|---|
| Learner collaboration image | 2,069,383 B PNG | 115,413 B at 1280 px; 39,132 B at 640 px | Responsive image, 94.4% smaller large variant |
| Mounted image set | About 7.9 MB across four PNGs | One responsive source pair | Three hero images removed from initial load |
| Font network | Google Fonts CSS plus five Manrope weights | System font stack | No third-party font request |
| JS output | About 322 KB plus a 195 KB secondary chunk in the audited build | 228.47 KB / 72.28 KB gzip | Dead UI and Framer Motion removed from launch bundle |
| CSS output | Not used as gate evidence | 22.75 KB / 5.08 KB gzip | Small launch stylesheet |

Large files that remain but do not ship:

- `src/assets/data-learner.png`: 2,230,921 bytes;
- `src/assets/environment-learner.png`: 2,042,213 bytes;
- `src/assets/learners-collaborating.png`: 2,069,383 bytes;
- `src/assets/software-learner.png`: 1,731,665 bytes; and
- `qa-comparison.png`: 2,466,846 bytes, QA-only root artifact.

Next action: confirm source-asset ownership, then archive or remove unused PNG/QA sources outside the production repository.

## Tests added

- `tests/e2e/public-launch.smoke.spec.js`
  - loads landing;
  - enters discovery;
  - selects `Digital tools`;
  - verifies selected state and URL change;
  - verifies exploration matches;
  - opens a pathway;
  - verifies pathway URL, trust labels, and admissions warning; and
  - confirms the dead interest search is absent.
- `tests/e2e/accessibility.spec.js`
  - axe scan on landing; and
  - axe scan after discovery and pathway selection.
- `scripts/validatePublicLaunchCopy.mjs`
  - required trust labels and warnings;
  - banned learner-facing claims;
  - dead interest-search guard;
  - mounted PNG import guard; and
  - Google Fonts guard.
- Expanded `scripts/validateMvpFlows.mjs` and `scripts/validateCatalog.mjs` for safe subject-risk language and overclaim rejection.

## Commands run

Investigation and static audit:

```powershell
rg --files src scripts .github supabase docs data
rg -n -i "career|careers|careerize|learner|pathway|pathways|route|routes|subject|subjects|grade|matric|marks|recommendation|recommendations|match|matches|eligibility|provider|verification|verified|template|starter|guidance|interest|search|discovery|tag|tags|profile|saved|localStorage|sessionStorage|auth|pseudo|delete|export|history|privacy|accessibility|a11y|playwright|test|e2e|smoke|ci|image|png|font|network|hero|landing|dashboard|TODO|FIXME|mock|placeholder" ...
Get-Content package.json, App.jsx, library, data, workflow, schema and documentation files
Get-Item src/assets/*.png, src/assets/*.jpg
```

Dependencies, assets, and browser:

```powershell
npm.cmd install --save-dev @playwright/test @axe-core/playwright
npm.cmd uninstall framer-motion --no-audit
npx.cmd playwright install chromium
$env:NODE_OPTIONS='--use-system-ca'; npx.cmd playwright install chromium
# PowerShell System.Drawing JPEG resize/encode in the performance subtask
```

Validation:

```powershell
npm.cmd test
npm.cmd run validate:catalog
npm.cmd run validate:foundation
npm.cmd run validate:academic-pathways
npm.cmd run validate:public-copy
npm.cmd run build
npm.cmd run check
npx.cmd playwright test tests/e2e/public-launch.smoke.spec.js --workers=1 --reporter=line
npx.cmd playwright test tests/e2e/accessibility.spec.js --workers=1 --reporter=line
npm.cmd run test:browser -- --workers=1 --reporter=line
```

No lint or typecheck script exists. The codebase uses JavaScript rather than TypeScript. This pass did not add a linter because launch trust, browser coverage, accessibility, privacy, and performance had higher risk.

## Test results

| Command | Result |
|---|---|
| `npm.cmd run check` | PASS |
| Catalog validation | PASS, 344 routes / 4 questions / 25 signals / 8 pathway types / 3 sources |
| SA foundation validation | PASS |
| Academic pathway validation | PASS, all 344 routes linked to templates |
| Public copy validation | PASS |
| MVP flow and language tests | PASS |
| Vite production build | PASS |
| Playwright smoke | PASS, 35.3 seconds in isolated run |
| Playwright axe | PASS, zero automated A/AA violations |
| Full browser gate | PASS, 2 tests in 2.1 minutes |
| Manual in-app browser journey | PASS, URL/state/focus/trust labels/no console errors |

The first local Playwright attempts exposed two environment issues: the browser cache required Windows system CAs for download, and Playwright expected a separate headless-shell binary. The final config uses Playwright's installed full Chromium channel and invokes Vite directly for reliable server cleanup. The final full suite passed.

## Files inspected

The team searched the full repository and inspected these launch-relevant groups:

- app shell and styles: `src/App.jsx`, `src/main.jsx`, `src/index.css`, `index.html`, `tailwind.config.js`, `vite.config.js`;
- guidance and pathway data: `src/data/careerCatalog.js`, `src/data/academicPathwayTemplates.js`, `src/data/careerPathwayGraph.js`;
- logic: `src/lib/scoring.js`, `src/lib/subjectRisk.js`, `src/lib/savedDiscovery.js`;
- other UI: `src/components/MarketInsightUpgrade.jsx`;
- validation and release: `scripts/*.mjs`, `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`;
- persistence: `supabase/schema.sql`, `.env.example`;
- source/policy documentation: `README.md`, `docs/SOURCES.md`, `docs/SUBJECT_TO_CAREER_ENGINE.md`, `docs/QUALIFICATION_PATHWAY_DATA_MODEL.md`, `docs/BUILD_SEQUENCE_SUBJECT_CHOICE_ENGINE.md`, `docs/architecture.md`, `docs/deployment-readiness.md`, strategy/audit documents, and `data/sa-foundation/*`; and
- production and QA image assets in `src/assets/` and the repository root.

## Files changed

- `src/App.jsx`
- `src/index.css`
- `index.html`
- `tailwind.config.js`
- `src/assets/learners-collaborating-640.jpg`
- `src/assets/learners-collaborating-1280.jpg`
- `src/lib/scoring.js`
- `src/lib/subjectRisk.js`
- `src/lib/savedDiscovery.js`
- `scripts/validateCatalog.mjs`
- `scripts/validateMvpFlows.mjs`
- `scripts/validatePublicLaunchCopy.mjs`
- `supabase/schema.sql`
- `package.json`
- `package-lock.json`
- `playwright.config.js`
- `tests/e2e/public-launch.smoke.spec.js`
- `tests/e2e/accessibility.spec.js`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `PUBLIC_LAUNCH_MUST_FIX_REPORT.md`

## Launch gate checklist

| Launch Gate | Status | Evidence | Notes |
|---|---|---|---|
| Guidance labels added | PASS | Hero and pathway show starter/template/provider labels | Verified label remains reserved |
| Eligibility overclaims removed | PASS | Copy validator and subject-risk regressions | All current pathways stay unverified |
| Recommendations reframed | PASS | `Exploration matches` and why-this-route copy | Ranking uses selected signals only |
| Hero copy aligned | PASS | Hero states starter exploration and provider check | No fit/admission claim |
| Core journey works | PASS | Playwright and manual browser journey | URL updates for signals/pathway |
| Dead controls hidden/removed | PASS | Old interest search absent | Route search/filter works |
| Playwright smoke test added | PASS | `public-launch.smoke.spec.js` | Chromium pass |
| Accessibility check added | PASS | axe suite in CI/deploy | Zero automated A/AA violations |
| Privacy/persistence reviewed | PASS for scoped launch | Production fallback blocked; UI scoped off | Supabase live test remains |
| Delete/export semantics fixed or scoped | PASS for data layer | History export, DELETE policies, explicit account flag | Auth account deletion unsupported |
| Large images compressed | PASS for shipped app | 39 KB/115 KB responsive JPEGs | Original PNG sources remain unshipped |
| Build passes | PASS | `npm run check` | 228 KB JS output |
| Tests pass | PASS | Full browser gate 2/2 | No lint/typecheck scripts |
| Remaining risks documented | PASS | This report | See next section |

## Remaining risks

1. No current pathway contains provider-specific verified admission data. The product must keep template labels and warnings visible.
2. Saved profiles require a live two-user Supabase test covering ownership isolation, full export, delete-and-requery, signup confirmation, and wrong-password behaviour.
3. Careerize cannot delete a Supabase authentication account from the current frontend. Keep account creation off until a secure server-side deletion flow and learner-facing policy exist.
4. The repository does not document a full POPIA/minor consent, retention, correction, or support workflow. The scoped launch avoids account collection.
5. Signal ranking remains coarse and alphabetically resolves many ties. It supports exploration only.
6. Axe covered automated Chromium checks. Manual screen-reader, complete keyboard, mobile layout, and additional browser testing remain.
7. Large unused PNG/QA source assets remain in the repository, although Vite does not ship them.

## Safe-to-defer items

- Provider-level depth across the full catalogue. Start with a verified subset later.
- Location-aware guidance, marks modelling, and richer personalization.
- Full account lifecycle, admin tools, correction workflows, and privacy self-service while saved profiles remain off.
- Broad browser regression coverage beyond the launch smoke and axe gate.
- Documentation consolidation beyond this report and the active pathway-engine sources.
- Dead-code/component refactors unrelated to the mounted launch journey.
- Archiving unused source/QA images after ownership review.

## Recommended next ticket

**Verify and launch a small provider-backed pathway subset.**

Choose 5 to 10 high-interest pathways. Store provider name, official source URL, access date, qualification, campus, accreditation reference, APS/subject thresholds, additional gates, intake date, and review owner. Add a two-user Supabase integration test for export/delete isolation. Only then enable the `Verified pathway` badge and saved-profile surface for that tested subset.
