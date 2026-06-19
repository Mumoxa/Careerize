# Full Product QA MVP Assessment

Date: 2026-06-19  
Reviewer role: Senior QA engineer, product analyst, full-stack engineer and release readiness reviewer  
Repository: `/workspace/Careerize`  
Latest reviewed commit before QA fixes: `448a1fd Improve route signals and pathway mapping`  
QA verdict: **Ready only for internal demo; not ready for MVP launch**

---

## 1. Executive Summary

Careerize is currently a single-page Vite/React application for South African learner career discovery. The documented product direction is a **Grade 9-12 subject-choice-to-career pathway engine**, not a candidate marketplace, employer platform, subscription product or assessment marketplace.

The current application is valuable as a prototype/internal demo because it contains:

- 344 generated starter career routes across 15 South African-first macro streams.
- 4 quick discovery questions.
- 25 interest tags.
- Deterministic route scoring.
- A top-10 route signal mind-map style selector.
- Starter career reality cards.
- A newly connected qualification/subject pathway map using academic pathway templates.
- Optional Supabase-backed learner profile/discovery persistence with local-browser fallback.

However, it is **not MVP-ready for a commercial public launch** because the core subject-choice engine is still mostly template-based, provider-specific qualification requirements are not source-verified, there are no dedicated career detail routes, no search/filter, no subject/marks profile risk engine, no POPIA-grade account management flows, no end-to-end tests, no browser automation coverage, and no production-grade auth QA evidence. Many requested areas such as candidate/client/admin/marketplace/subscription/payment/vetting are not part of the documented Careerize MVP and are not implemented.

### Release readiness verdict

**Ready only for internal demo.** It can be shown as a guided prototype if positioned clearly as starter guidance, not definitive career or qualification advice. It should not be marketed as a complete MVP until the P0/P1 issues in this report are addressed.

---

## 2. Documented MVP Scope

The primary source of truth is the README and active product documentation. The README states that Careerize is a free, independent career-intelligence platform for South African learners and that the corrected direction is a **subject-choice-to-career pathway engine for Grade 9-12 learners**.

### Documented MVP/product direction

The product should help learners work backwards from a possible career direction:

1. Career interest.
2. Realistic career picture.
3. Qualification route.
4. Provider-specific entry requirements.
5. Grade 12 marks / APS where available.
6. Grade 10 subject choice.
7. First-work entry point.
8. Career progression and adjacent options.

### Current implemented scope

- Public single-page marketing/discovery app.
- Learner discovery questions and interest tags.
- Deterministic scoring against static starter career routes.
- Starter career reality card.
- Top-10 route signal selector.
- Template-linked academic pathway display.
- Optional Supabase or local-browser saved learner profile.

### Explicitly out of scope or not implemented

The repo does not implement candidate/employer marketplace flows. The following are therefore **not current MVP features** unless the product strategy changes:

- Candidate marketplace.
- Client/employer dashboard.
- Candidate unlocks.
- Subscription/payment checkout.
- Vetting/verification workflow.
- Admin moderation dashboard.
- Timed assessments.
- Hiring scorecards.

---

## 3. Commands Run

| Command | Purpose | Result | Notes / Action Required |
|---|---|---|---|
| `find .. -maxdepth 2 -name AGENTS.md -print` | Locate repo instructions | Passed | Only nested dependency AGENTS files found; no repo-scoped AGENTS.md affecting touched files. |
| `find . -maxdepth 3 -type f \| sed 's#^./##' \| sort \| head -220` | Review repo structure | Passed | Confirmed compact Vite app plus docs/data/scripts/supabase. |
| `rg -n "MVP\|roadmap\|product\|requirements\|TODO\|FIXME\|candidate\|client\|admin\|assessment\|score\|scoring\|marketplace\|subscription\|payment\|checkout\|vetting\|verification\|unlock\|dashboard\|workspace\|auth\|login\|signup\|profile\|settings\|link\|href\|button\|form\|submit\|api\|route\|server action\|mock\|placeholder\|static" README.md docs src supabase data scripts --glob '!node_modules'` | Search MVP/product/action terms | Passed | Confirmed learner pathway MVP; many marketplace/client/admin terms appear in “must not become” or docs, not implementation. |
| `find src -maxdepth 3 -type f -print \| sort` | Identify frontend files | Passed | App has one main React page plus data/lib/component files. |
| `rg -n "<a \|href=\|<button\|onClick=\|<form\|onSubmit=\|type=\"submit\"\|input\|required\|textarea" src --glob '!node_modules'` | Audit links/buttons/forms | Passed | 24 interactive controls/links/forms identified in main app. |
| `npm run dev -- --host 127.0.0.1` | Run local dev server | Passed | Vite served at `http://127.0.0.1:5173/`. |
| `curl -I http://127.0.0.1:5173/` | Verify root route HTTP response | Passed | HTTP 200. |
| `curl -s http://127.0.0.1:5173/ \| head -40` | Inspect served HTML shell | Passed | React shell and metadata served. |
| `curl -I http://127.0.0.1:5173/nonexistent-route` | Check unknown path behavior | Warning | Vite fallback returns HTTP 200 shell; no app-level 404 route exists. |
| `node scripts/validateAcademicPathways.mjs` | Validate new pathway graph coverage | Failed before fix, passed after fix | Found extensionless import issue in `careerPathwayGraph.js`; fixed during QA. |
| `node --experimental-specifier-resolution=node --input-type=module ...` | Spot-check scoring behavior | Passed | Confirmed 344 routes, 4 questions, 25 tags and top-10 slicing. |
| `npm run check` | Main repo quality command | Passed | Runs catalog validation, foundation validation and production build. |

---

## 4. Repo Structure Reviewed

| Area | Files / Folders Reviewed | Notes |
|---|---|---|
| App shell | `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css` | Single-page React app mounted at root. |
| Components | `src/components/MarketInsightUpgrade.jsx` | Additional static component rendered below app. |
| Data | `src/data/careerCatalog.js`, `src/data/academicPathwayTemplates.js`, `src/data/careerPathwayGraph.js` | Static generated catalog and template-linked academic pathway layer. |
| Logic | `src/lib/scoring.js`, `src/lib/savedDiscovery.js` | Deterministic scoring and optional Supabase/local persistence. |
| Backend schema | `supabase/schema.sql` | SQL schema and RLS policies for learner-owned profile/discovery data and public career tables. |
| Validation scripts | `scripts/validateCatalog.mjs`, `scripts/validateSaFoundation.mjs`, `scripts/validateAcademicPathways.mjs` | Catalog/foundation/pathway checks exist; academic pathway check is not currently in `npm run check`. |
| Docs | `README.md`, `docs/*.md`, `data/sa-foundation/README.md` | Product direction, gap audit, source policy and deployment notes reviewed. |
| CI/CD | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | CI runs install/check; deploy workflow exists. |

---

## 5. Framework and App Structure

| Item | Current State | QA Notes |
|---|---|---|
| Framework | Vite + React 18 | No router library is used. |
| Styling | Tailwind CSS | Single-page responsive utility styling. |
| Animation | Framer Motion | Used for hero and active card transitions. |
| Icons | Lucide React | Used throughout UI. |
| Backend | Supabase optional | Only learner profile/discovery persistence is wired. |
| Local fallback | LocalStorage | Demo-mode auth/session and persistence stored in browser localStorage. |
| Routing | Hash anchors only | No distinct pages or protected route system. |
| Tests | Validation scripts only | No unit tests, e2e tests, accessibility tests or browser tests. |

---

## 6. Available Routes / Pages

The application has **one public app route** with hash-anchor sections. There are no React Router routes, API routes or server-rendered pages.

### Route Audit

| Route | Page/Purpose | Access Level | Expected Behaviour | Current Behaviour | Links From | Links To | Status | Issues | Priority |
|---|---|---|---|---|---|---|---|---|---|
| `/` | Main Careerize single-page app | Public | Load landing, discovery, reality, pathway and trust sections | HTTP 200 and Vite app shell served | Browser direct | `#top`, `#discover`, `#reality`, `#pathway`, `#trust` | Working | Needs browser/e2e visual QA before public release | High |
| `/#top` | Home/top anchor | Public | Scroll to top | Anchor target exists as `main id="top"` | Logo, footer back link | Page top | Working | None found | Low |
| `/#discover` | Discovery section | Public | Scroll to discovery questions, interest tags, account panel | Anchor section exists | Nav, Try demo, Start discovery | Buttons/forms in discovery | Working | No deep-link restoration tests | Medium |
| `/#reality` | Career reality/route signals | Public | Scroll to top-10 route signal map and active career card | Anchor section exists | Nav, See reality checks | RouteMindMap buttons | Working | Route map is visual-only; no dedicated career URL | Medium |
| `/#pathway` | Pathway section | Public | Scroll to pathway steps and qualification map | Anchor section exists | Nav | No outbound links | Working | Template claims need source verification; no provider drill-down | High |
| `/#trust` | Trust/privacy/independence section | Public | Scroll to trust cards | Anchor section exists | Nav, Read principles, footer Privacy/Independence | None | Partially Working | Privacy/Independence links both point to generic trust section, not policies | Medium |
| `/nonexistent-route` | Unknown route | Public | Should show 404 or redirect to `/` | Vite dev fallback returns HTTP 200 shell; no app-level 404 | Direct URL only | None | Partially Working | No not-found handling | Medium |
| `/login` | Auth route | N/A | Not in documented MVP as separate page | Missing | None | None | Out of Scope | Auth is embedded in AccountPanel | Low |
| `/candidate`, `/client`, `/admin`, `/marketplace`, `/checkout`, `/assessment` | Candidate/client/admin/marketplace/payment/assessment pages | Role based if ever introduced | Not part of documented current MVP | Missing | None | None | Out of Scope | If commercial model changes, these are major missing modules | Low |

Routes checked: **12 route/path categories**.

---

## 7. MVP Feature Checklist

| MVP Feature | Expected Behaviour | Current Implementation | Status | Evidence | Gap | Priority | Recommendation |
|---|---|---|---|---|---|---|---|
| South African learner landing page | Explain product and route learners to discovery | Single-page hero with CTAs | Working | `src/App.jsx` hero and nav | Needs sharper Grade 9-12 subject-choice framing | Medium | Update hero copy and visual hierarchy around subject decisions. |
| Discovery questions | Learner answers simple questions that affect scoring | 4 questions, each with 4 options | Working | `DISCOVERY_QUESTIONS` in `careerCatalog.js`; `choose()` updates answers | No persistence until save; no “required completion” flow | Medium | Add progress guidance and optional subject/grade questions. |
| Interest tags | Selected tags affect route ranking | 25 tags; scoring receives `selectedSignals`; derived signals added for remote/hands-on | Working | `toggleInterestSignal`, `rankCareerRoutes`, `getSelectedSignals` | Only some tags are weighted by each route; impact may be subtle | Medium | Show before/after ranking explanation and add tests for tag impact. |
| Route signals | Show strongest route suggestions without clutter | Top 10 visible, mind-map selector | Partially Working | `visibleRoutes = ranked.slice(0, 10)`, `RouteMindMap` | Layout not browser-automated; no mobile screenshot verification | Medium | Add Playwright visual/e2e checks and refine mobile layout. |
| Career reality card | Show real work, tools, stress, remote, growth, worst/best | Active career card displays these fields | Working | `CareerCard` | No dedicated detail page, bookmarking or comparison | High | Build career detail route or modal with stable URL. |
| Qualification route map | Show school-to-work path for active route | PathwayMap uses template graph | Partially Working | `PathwayMap`, `careerPathwayGraph.js` | Template-only; no provider-specific source-backed claims | Critical | Add source-backed qualification records and verification states per claim. |
| Subject choice guidance | Explain Grade 10 subject implications | Shows keep/helpful/avoid dropping from template | Partially Working | `PathwayMap` subject cards | No learner’s actual subjects/marks or green/amber/red risk logic | Critical | Build subject profile and traffic-light engine. |
| Grade 12/APS guidance | Explain Grade 12 target/entry gates | Generic Grade 12 target displayed | Partially Working | `grade12ExitTarget` | No APS or provider-specific requirements; intentionally not verified | Critical | Add verified provider requirements table and claim validator. |
| First-work entry | Show realistic junior/assistant entry | First-work entries displayed in pathway ladder | Partially Working | `pathway.firstWorkEntry` | Template only; not job-market/source verified | High | Source first-work entries and map to profile levels. |
| Career progression | Show route upward | Uses route growth text | Partially Working | `route.growth` | Generic progression, no adjacent career graph in UI | Medium | Surface adjacent/similar careers and progression milestones. |
| Saved learner profile | Sign in and save profile/discovery | Supabase if configured; localStorage fallback otherwise | Partially Working | `savedDiscovery.js`, `AccountPanel` | No password reset, email verification UX, delete/export/correction | Critical | Add account management and POPIA-oriented profile controls. |
| Local demo fallback | Work without Supabase env vars | Local pseudo-session and localStorage record | Working | `hasSupabaseConfig` conditional logic | Demo auth can be mistaken for real auth | Medium | Label demo mode more prominently and gate production builds. |
| Source transparency | Avoid overclaiming salary/demand/requirements | Starter content has confidence/source metadata; caution copy | Partially Working | Catalog validators and pathway cautions | User-facing source details not deeply exposed | High | Add source drawer per claim and verified/unverified tags. |
| Search/filter | Learner finds careers by title/stream/subject | Not implemented | Missing | No search component/route | Hard to explore 344 routes beyond top recommendations | High | Add career search/filter with subject and stream filters. |
| Comparison | Compare routes side-by-side | Not implemented | Missing | No compare state or UI | Learners cannot compare alternatives deeply | Medium | Add top-three compare view. |
| Low data/accessibility mode | Reduce effects and support low bandwidth | README mentions low-data mode, but no visible toggle found in app | Missing | `rg` did not find implemented toggle UI | Documentation overstates current surface | Medium | Either implement toggle or update README. |
| Admin/content tooling | Govern and update source-backed content | SQL foundation only; no UI | Missing | Docs list future work | Cannot manage real verified data | High | Build admin import/review tooling after claim model. |
| Analytics/audit logs | Track changes and safety events | Discovery session history table only | Partially Working | `careerize_discovery_sessions` | No admin/audit visibility; no event logs | Medium | Add audit/event table and review tooling. |
| Payments/subscriptions/marketplace | Commercial employer/customer flows | Not part of documented MVP | Out of Scope | README says not course marketplace and no commercial influence | N/A | Low | Keep out unless strategy changes. |
| Candidate/client/admin roles | Hiring platform roles | Not part of documented MVP | Out of Scope | No routes or role schema | N/A | Low | Do not build unless product pivots. |

---

## 8. Link / Button / Form Audit

Interactive elements checked: **24**.

| Screen/Component | Link/Button/Form | Current Target/Handler | Expected Action | Works? | Issue | Required Fix | Priority |
|---|---|---|---|---|---|---|---|
| Header | Logo link | `href="#top"` | Return to top | Yes | None | None | Low |
| Header desktop nav | Discovery | `href="#discover"` | Scroll to section | Yes | None | None | Low |
| Header desktop nav | Reality Check | `href="#reality"` | Scroll to section | Yes | None | None | Low |
| Header desktop nav | Pathway | `href="#pathway"` | Scroll to section | Yes | None | None | Low |
| Header desktop nav | Trust | `href="#trust"` | Scroll to section | Yes | None | None | Low |
| Header CTA | Try demo | `href="#discover"` | Scroll to demo/discovery | Yes | None | None | Low |
| Header CTA | Read principles | `href="#trust"` | Scroll to trust | Yes | None | Could link to dedicated principles/policy page later | Low |
| Mobile header | Menu button | `setOpen()` | Open/close mobile nav | Likely yes by code | Not browser-automated | Add e2e test | Medium |
| Mobile nav | Section links | `href="#..."` and `setOpen(false)` | Scroll and close menu | Likely yes by code | Not browser-automated | Add e2e test | Medium |
| Hero CTA | Start discovery | `href="#discover"` | Scroll to discovery | Yes | None | None | Low |
| Hero CTA | See reality checks | `href="#reality"` | Scroll to reality | Yes | None | None | Low |
| Discovery | Reset button | `reset()` | Clear answers/tags/active route | Yes by code | Does not clear saved server/local record until user saves | Clarify “reset current view” vs “delete saved profile” | Medium |
| Discovery questions | 16 answer buttons | `choose(question.id, option.value)` | Update answer and rerank | Yes by code | No visible per-answer explanation | Add scoring explanation feedback | Medium |
| Interest tags | 25 tag buttons | `toggleInterestSignal(signal.value)` | Toggle tag and rerank | Yes by code | Impact is still not obvious enough for all tags | Add “matched in top route” badges | Medium |
| Route signals | 10 route buttons | `onSelect(route.id)` | Change active career/pathway | Yes by code | Only top 10 accessible; no search for others | Add search/full list route | High |
| AccountPanel | Login/create form | `onSignIn(form)` | Sign in via Supabase or local fallback | Partially | No confirm-password, no password reset, no email verification guidance beyond thrown error | Add full auth UX and validations | Critical |
| AccountPanel | Email input | HTML required email | Validate email | Partially | Browser validation only | Add explicit error text | Medium |
| AccountPanel | Password input | `required minLength=6` | Validate password | Partially | Browser validation only; no strength/help text | Improve validation and messages | Medium |
| AccountPanel | Learner name input | Optional local state | Save/display name | Partially | Name only affects initial local/session/signup metadata; not required | Clarify optional | Low |
| AccountPanel signed-in | Preferred name input | `onProfileChange` | Update in memory | Yes | Not saved until Save clicked | Good enough; show unsaved indicator | Medium |
| AccountPanel signed-in | Stage input | `onProfileChange` | Update in memory | Yes | Free text; no grade validation | Add grade/stage options | Medium |
| AccountPanel signed-in | Town/suburb input | `onProfileChange` | Update in memory | Yes | No location suggestions/privacy note | Add privacy copy | Low |
| AccountPanel signed-in | Subjects/interests input | `onProfileChange` | Update in memory | Partially | Free-text subjects are not used by scoring/pathway risk | Connect to subject engine | Critical |
| AccountPanel signed-in | Notes textarea | `onProfileChange` | Update in memory | Yes | No autosave, export/delete | Add account data controls | High |
| AccountPanel signed-in | Save learner profile | `onSave` | Persist profile/results | Partially | Requires session; Supabase unverified in this QA due no env | Add integration test with Supabase project | Critical |
| AccountPanel signed-in | Log out | `onSignOut` | End Supabase/local session | Yes by code | No confirmation; local saved data remains | Add delete data option | Medium |
| Footer | Privacy | `href="#trust"` | Privacy information | Partially | Not a privacy policy | Create dedicated privacy page/section | High |
| Footer | Independence | `href="#trust"` | Independence info | Partially | Generic trust section only | Add dedicated independence/principles page | Medium |
| Footer | Back to top | `href="#top"` | Scroll top | Yes | None | None | Low |

---

## 9. User Journey QA

### Public visitor flow

| Step | Expected | Current Result | Status | Notes |
|---|---|---|---|---|
| Visit homepage | App loads | HTTP 200 shell; app builds successfully | Working | Browser interaction not automated due no e2e setup. |
| Navigate product sections | Anchor nav works | All anchors exist in App | Working | No route-level pages. |
| Click CTAs | Move to discovery/reality/trust | Anchor targets valid | Working | No signup redirect because auth is inline. |
| Sign up/log in | Account created or local demo session | Local fallback works by code when env absent; Supabase not tested against live env | Partially Working | Needs integration QA in configured environment. |
| Routed afterward | User stays on page with account panel state | Inline auth flow, no redirect | Working for current design | No return URL requirements. |

### Learner flow

| Step | Expected | Current Result | Status | Gap |
|---|---|---|---|---|
| Learner onboarding | Capture grade, subjects, location, interests | Optional free-text profile fields plus questions/tags | Partially Working | No structured grade/subjects/marks. |
| Career discovery | Answer questions/tags and see ranked routes | Implemented | Working | Needs more explainability and tests. |
| View route signals | Max 10 signals, gamified map | Implemented | Partially Working | Visual not e2e tested. |
| Career reality | See real job profile | Implemented | Working | No deep profile page. |
| Subject/qualification pathway | See subject, Grade 12, qualification, first-work, progression | Template map implemented | Partially Working | Not personalised to learner subjects/marks. |
| Save profile | Persist profile/results | Implemented via Supabase/local | Partially Working | Supabase not verified live; local fallback is not real account system. |
| Return/restore | Saved profile restored | Implemented by session restore | Needs Manual Verification | Needs browser/Supabase e2e tests. |

### Candidate flow

| Step | Expected | Current Result | Status |
|---|---|---|---|
| Candidate signup/login | Dedicated candidate account | Not implemented; only learner profile | Out of Scope |
| Candidate onboarding/profile | Candidate profile | Not implemented | Out of Scope |
| Assessment access/start/submit | Timed hiring/skills assessment | Not implemented | Out of Scope |
| Score/result generation | Candidate scorecard | Not implemented beyond career route scoring | Out of Scope |
| Candidate dashboard/workspace | Candidate portal | Not implemented | Out of Scope |
| Marketplace visibility | Candidate listing | Not implemented | Out of Scope |

### Client/employer flow

| Step | Expected | Current Result | Status |
|---|---|---|---|
| Client signup/login | Employer account | Not implemented | Out of Scope |
| Client workspace | Employer dashboard | Not implemented | Out of Scope |
| Marketplace candidate viewing | Browse candidates | Not implemented | Out of Scope |
| Save/shortlist/unlock | Commercial actions | Not implemented | Out of Scope |
| Subscription/payment/checkout | Paid access | Not implemented | Out of Scope |
| Vetting/verification | Client vetting | Not implemented | Out of Scope |

### Admin flow

| Step | Expected | Current Result | Status |
|---|---|---|---|
| Admin login/dashboard | Admin controls | Not implemented | Out of Scope / Future Work |
| Candidate/client management | Manage marketplace users | Not implemented | Out of Scope |
| Assessment management | Manage tests | Not implemented | Out of Scope |
| Content/source management | Manage careers/sources/claims | Not implemented | Missing for future production content MVP |
| Audit logs/reports | View event/history | Not implemented except raw DB session rows | Missing |

### Assessment and scoring flow

| Step | Expected | Current Result | Status | Notes |
|---|---|---|---|---|
| Career discovery assessment | Quick question/tag inputs rank career routes | Implemented | Working | This is not a psychometric or hiring assessment. |
| Timed assessment | Timer and timed submission | Not implemented | Out of Scope | Not documented MVP. |
| Answer storage | Store discovery answers | Save flow stores answers when signed/local | Partially Working | Manual save required. |
| Scoring trigger | Ranking recalculates on answers/tags | Implemented with `useMemo` | Working | No automated tests for all permutations. |
| Result generation | Best match and ranked list | Implemented | Working | Top 10 visible in UI, full ranked saved. |
| Sensitive answer exposure | Learner-owned only | RLS policies restrict saved rows by `user_id` | Needs Manual Verification | Must verify in live Supabase with two accounts. |

---

## 10. Latest Additions Review

| Latest Addition | Files/Components | Intended Purpose | Connected to Product Flow? | Works? | Missing Links/Logic | Priority | Recommendation |
|---|---|---|---|---|---|---|---|
| Top-10 route signal cap | `src/App.jsx` | Prevent route list clutter | Yes | Yes by code | No full-list/search fallback | High | Add search and “explore all routes” affordance. |
| Mind-map route presentation | `RouteMindMap` in `src/App.jsx` | More gamified route selection | Yes | Partially | No browser visual regression; can still be long on small devices | Medium | Add Playwright mobile/desktop screenshots and tune layout. |
| Active tag display | `HeroCard` in `src/App.jsx` | Make selected tags visibly reflected | Yes | Yes | Shows raw signal keys, not friendly labels | Medium | Map signal values to labels for user-facing display. |
| Pathway map | `PathwayMap` in `src/App.jsx`, `careerPathwayGraph.js` | Show subjects, qualification entry, first work, progression | Yes | Partially | Template-only; no source-backed provider entries; no learner subject matching | Critical | Build verified qualification records and subject risk engine. |
| Derived scoring signals | `src/lib/scoring.js` | Make remote/hands-on choices affect weighted routes | Yes | Yes | No tests; only two derivations | Medium | Add unit tests for scoring impact and expand synonym map intentionally. |
| Academic pathway graph import fix | `src/data/careerPathwayGraph.js` | Let Node validation import the module | Yes | Yes after QA fix | `validateAcademicPathways` still not in `npm run check` | High | Add academic pathway validation to `check`. |

---

## 11. Backend / API / Data QA

There are no API routes or server actions in this Vite app. Backend functionality is client-side calls to Supabase when configured, otherwise localStorage.

| Backend Function | Used By | Expected Behaviour | Current Behaviour | Data Written/Read | Status | Issues | Priority |
|---|---|---|---|---|---|---|---|
| Supabase client initialization | `savedDiscovery.js` | Create client only when env vars exist | Dynamic import and config check | Reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Working | No runtime env validation UI beyond demo copy | Medium |
| Current session | App restore | Return Supabase/local session | `getCurrentSession()` implemented | Supabase auth session or localStorage | Partially Working | Supabase not tested live in this QA | High |
| Learner sign in | AccountPanel | Sign in existing user | Supabase `signInWithPassword`; local fallback creates pseudo-session | Auth session/localStorage | Partially Working | No password reset/account recovery | Critical |
| Learner signup | AccountPanel | Create learner | Attempts sign in first, then Supabase signup | Supabase auth user or local pseudo-session | Partially Working | Email confirmation flow not polished; no confirm password | Critical |
| Learner profile load | App restore | Load saved profile | Reads `careerize_profiles` or local record | Profile JSON | Partially Working | No schema-level validation for profile shape | Medium |
| Discovery load | App restore | Load saved answers/results | Reads `careerize_results` or local record | Answers, signals, ranked results, best match | Partially Working | Saved ranked results may become stale after catalog changes | Medium |
| Discovery save | Save button | Persist profile/latest result/session history | Upserts profile/result and inserts discovery session | Supabase tables or localStorage | Partially Working | No retry/offline queue; no automatic conflict handling | Medium |
| Career catalog | App | Display 344 routes | Static generated JS data | Static only | Mock/Static Only | Starter/editorial content; not DB-backed | High |
| Academic pathway graph | PathwayMap | Show career-to-subject/qualification route | Static template graph | Static only | Mock/Static Only | Needs source-backed provider data | Critical |
| Public career DB schema | Future content | Store public career profiles/sources | SQL tables/policies exist only | None used by frontend | Partially Working | Frontend does not read DB career tables | Medium |
| Candidate creation/update | Candidate marketplace | Not documented current MVP | Not implemented | None | Out of Scope | N/A | Low |
| Client creation/update | Employer marketplace | Not documented current MVP | Not implemented | None | Out of Scope | N/A | Low |
| Candidate unlocks/shortlists | Marketplace | Not documented current MVP | Not implemented | None | Out of Scope | N/A | Low |
| Subscriptions/payments | Commercial platform | Not documented current MVP | Not implemented | None | Out of Scope | N/A | Low |
| Vetting submissions | Commercial platform | Not documented current MVP | Not implemented | None | Out of Scope | N/A | Low |
| Admin review actions | Content governance | Needed eventually for verified claims | Not implemented | None | Missing | No content moderation/import UI | High |
| Audit logs | Compliance/review | Track data and content events | Discovery session history only | `careerize_discovery_sessions` | Partially Working | No visible audit UI | Medium |
| Notifications | Account/comms | Notify user of account actions | Not implemented | None | Missing | No email flows except Supabase built-in auth | Medium |

---

## 12. Role-Based Access QA

| Role | Should Access | Should Be Blocked From | Current Behaviour | Issues | Priority |
|---|---|---|---|---|---|
| Anonymous visitor | Public landing/discovery, starter career/pathway content, local demo sign-in | Saved Supabase data for other users | Can access entire single-page app; local demo mode available without Supabase | Local demo auth can be confused with real identity; no production gating | Medium |
| Learner | Own saved profile/discovery | Other learners' saved rows | Supabase RLS policies use `auth.uid() = user_id`; localStorage records isolated by browser/email key only | RLS not live-tested; localStorage not secure across shared devices | Critical |
| Candidate | N/A under documented MVP | N/A | No candidate role | Out of scope unless strategy changes | Low |
| Client/employer | N/A under documented MVP | Learner private data and route steering | No client role | Good alignment with “no commercial influence” principle | Low |
| Subscribed client | N/A | N/A | No subscription role | Out of scope | Low |
| Vetted client | N/A | N/A | No vetting role | Out of scope | Low |
| Admin | Future content/source tooling | Public learner app only for now | No admin role or protected admin route | Missing if source-backed content operations are required for MVP | High |
| Super admin | Future governance | Public learner app only for now | No super-admin role | Missing for production operations | Medium |

---

## 13. UI / UX QA

| Screen | Desktop Status | Mobile Status | Empty State | Loading State | Error State | UX Issues | Priority |
|---|---|---|---|---|---|---|---|
| Landing/hero | Likely usable by code; build passes | Responsive classes present | Active route defaults to first ranked route | N/A | N/A | Could better lead with Grade 9-12 subject choice | Medium |
| Header/nav | Desktop and mobile markup present | Mobile menu state present | N/A | N/A | N/A | Needs browser e2e click test | Medium |
| Account panel logged out | Form present | Responsive grid | N/A | Submit button disabled while loading | Error notice from thrown errors | No password reset/confirm password; demo mode could mislead | Critical |
| Account panel logged in | Profile inputs and save/logout present | Responsive grid | “No saved profile yet” copy | Save disabled while saving/loading | Error notice | No unsaved-change indicator, delete/export/correction | High |
| Discovery questions | Simple two-column choices | Collapses via responsive grid | No-answer state is default | N/A | N/A | No explanation of how answers changed routes | Medium |
| Interest tags | Toggle buttons | Responsive grid | None selected is allowed | N/A | N/A | Raw tag impact not obvious; selected tags shown as raw keys in hero | Medium |
| Route signals mind map | Gamified two-sided map on md+ | Single stacked list on small screens | No matched signal copy fallback | N/A | N/A | Visual density still needs device QA; only top 10 accessible | High |
| Career card | Structured reality sections | Responsive card grid | Active defaults to top route | Motion transition | N/A | No source/caution detail per field | Medium |
| Pathway map | Shows subject/qualification/first-work ladder | Responsive grid | Hidden only if no pathway | N/A | Caution copy shown | Could be mistaken for verified advice despite caution | Critical |
| Trust section | Cards present | Responsive grid | N/A | N/A | N/A | Privacy link not a real policy | High |
| Footer | Simple links | Flex layout responsive | N/A | N/A | N/A | Privacy/Independence both generic anchors | Medium |
| Unknown route | Vite fallback | Same | N/A | N/A | No 404 | Direct invalid URLs return shell | Medium |

---

## 14. Test Command Results

| Command | Result | Errors/Warnings | Action Required |
|---|---|---|---|
| `npm run check` | Passed | npm warning: unknown env config `http-proxy`; not app failure | None for app, but CI/env config can be cleaned. |
| `node scripts/validateAcademicPathways.mjs` | Failed before small fix, passed after fix | Before fix: Node ESM could not resolve extensionless imports from `careerPathwayGraph.js` | Fixed imports and added academic pathway validation to `npm run check`. |
| `npm run dev -- --host 127.0.0.1` | Passed | None app-related | Add automated browser smoke tests. |
| `curl -I http://127.0.0.1:5173/` | Passed | HTTP 200 | None. |
| `curl -I http://127.0.0.1:5173/nonexistent-route` | Warning | HTTP 200 fallback, no not-found handling | Add app-level 404 if introducing routes. |
| `npm test -- --runInBand` | Failed | No `test` script exists | Add unit/e2e test scripts. |

---

## 15. Bugs Found

Issue count: **32 total**

| ID | Issue | Area | Severity | Priority | Evidence / Notes |
|---|---|---|---|---|---|
| BUG-001 | Academic pathway validation script failed because `careerPathwayGraph.js` used extensionless imports under Node ESM | Data/validation | Major | P1 | Fixed during QA. |
| BUG-002 | `validateAcademicPathways` was not included in `npm run check` | CI/quality | Major | P1 | Fixed during QA by adding `validate:academic-pathways` and including it in `check`. |
| BUG-003 | No real 404/not-found behavior for unknown paths | Routing | Minor | P2 | Vite returns app shell for `/nonexistent-route`. |
| BUG-004 | Privacy footer link points to generic trust anchor, not a privacy policy | Legal/trust | Major | P1 | Public product should have real privacy policy. |
| BUG-005 | Independence footer link points to generic trust anchor | Trust | Minor | P2 | Needs dedicated principles page/section. |
| BUG-006 | README mentions low-data mode toggle, but no implementation found | Docs/product consistency | Major | P2 | Documentation overstates current app surface. |
| BUG-007 | Free-text subjects profile field is not used by scoring/pathway risk | Subject engine | Critical | P0 | Core MVP requires subject-choice guidance. |
| BUG-008 | Pathway map shows template qualification options, not provider/source-verified records | Qualification data | Critical | P0 | Exact claims must be verified before public advice. |
| BUG-009 | No green/amber/red subject risk engine | Subject engine | Critical | P0 | Required by product docs. |
| BUG-010 | No provider-specific entry requirements, APS or NQF detail in UI | Qualification data | Critical | P0 | Core pathway engine incomplete. |
| BUG-011 | No search/filter across 344 careers | Discovery UX | Major | P1 | Learners can only interact with top-ranked routes. |
| BUG-012 | No dedicated career detail URL/page | Routing/content | Major | P1 | Cannot share/bookmark a career profile. |
| BUG-013 | Saved ranked results can become stale after catalog/scoring changes | Data consistency | Major | P2 | No version reconciliation on restore. |
| BUG-014 | No password reset or account recovery | Auth | Critical | P1 | Required for public auth. |
| BUG-015 | No confirm-password or strong validation UX | Auth/forms | Major | P2 | Browser validation only. |
| BUG-016 | Supabase RLS not covered by automated tests | Security | Critical | P0 | Must verify two-account isolation. |
| BUG-017 | Local demo auth could be mistaken for secure auth | Security/UX | Major | P2 | Needs stronger demo labeling/production guard. |
| BUG-018 | No delete/export/correction data controls | Privacy/POPIA | Critical | P0 | Public learner data handling gap. |
| BUG-019 | No admin/source-review tooling for verified career/qualification data | Operations | Major | P1 | Production content cannot be governed. |
| BUG-020 | No audit/event log visibility | Compliance/ops | Major | P2 | Raw discovery history exists but no review UI. |
| BUG-021 | No e2e/browser automation tests | QA | Major | P1 | Critical interactions unverified in browser. |
| BUG-022 | No unit tests for scoring/tag effects | Scoring | Major | P1 | Latest scoring changes can regress silently. |
| BUG-023 | No accessibility testing | QA/accessibility | Major | P1 | Learner-facing product needs a11y baseline. |
| BUG-024 | No mobile visual regression screenshots | QA/mobile | Major | P1 | Mind-map responsiveness unverified. |
| BUG-025 | Active tag display uses raw signal keys | UX | Minor | P3 | Should show labels like “Digital tools”, not `technology`. |
| BUG-026 | Top-10 cap hides other 334 routes with no full exploration path | Discovery UX | Major | P1 | Needs search/all-routes fallback. |
| BUG-027 | No subject/marks structured onboarding | Learner profile | Critical | P0 | Core MVP depends on grade/subjects/marks. |
| BUG-028 | No clear distinction between template guidance and verified advice in every pathway field | Content safety | Critical | P0 | Caution exists, but field-level status missing. |
| BUG-029 | No source drawer/citations for learner-facing route/pathway claims | Source transparency | Major | P1 | Source registry not surfaced deeply. |
| BUG-030 | Account restore/save flow not tested against real Supabase env | Backend QA | Critical | P0 | Needs staging env validation. |
| BUG-031 | No package-lock committed despite known debt | Build reproducibility | Major | P2 | CI uses npm install; dependencies less deterministic. |
| BUG-032 | No marketplace/client/admin/payment/vetting features | Commercial platform | N/A | P3 | Out of documented MVP, but missing if stakeholder expects those flows. |

---

## 16. Small Fixes Applied

| Fix | File | Reason | Verification |
|---|---|---|---|
| Added `.js` extensions to local imports in `careerPathwayGraph.js` | `src/data/careerPathwayGraph.js` | `node scripts/validateAcademicPathways.mjs` failed under Node ESM due extensionless imports | `node scripts/validateAcademicPathways.mjs` passed after fix. |
| Added `validate:academic-pathways` and included it in `npm run check` | `package.json` | Prevent the pathway graph from regressing while the normal check stays green | `npm run check` now runs the academic pathway validator before build. |

No large product rebuilds were attempted during this QA pass.

---

## 17. Recommended Engineering Tickets

| Ticket ID | Title | Description | Affected Area | Severity | Priority | Acceptance Criteria | Suggested Files | Testing Required |
|---|---|---|---|---|---|---|---|---|
| QA-P0-001 | Build structured learner subject profile | Replace free-text subject field with grade, current subjects, marks bands and uncertainty inputs. | Learner onboarding | Blocker | P0 | Learner can enter grade/subjects/marks; data is saved/restored; inputs drive pathway risk. | `src/App.jsx`, new `src/data/subjectRules.js`, `savedDiscovery.js`, Supabase schema migration | Unit + e2e + Supabase integration |
| QA-P0-002 | Implement green/amber/red subject-choice risk engine | Compare learner subjects against career pathway requirements and show clear risk state. | Subject engine | Blocker | P0 | Active route shows green/amber/red subject risk with next action and caveat. | `src/lib/scoring.js`, new `src/lib/subjectRisk.js`, `academicPathwayTemplates.js` | Unit tests for key routes |
| QA-P0-003 | Add source-backed qualification data model to UI | Display provider-specific requirements only when verified; otherwise show unknown/varies. | Qualification pathway | Blocker | P0 | Every qualification claim has status/source/access date/confidence or remains explicitly unverified. | `data/sa-foundation`, new import/data module, `PathwayMap` | Validation script + UI tests |
| QA-P0-004 | Verify Supabase RLS in staging | Test two learner accounts cannot read/write each other's profile/results. | Security | Critical | P0 | Automated or documented staging test passes for select/insert/update isolation. | `supabase/schema.sql`, test harness | Integration/security tests |
| QA-P0-005 | Add learner data rights controls | Add export, correction guidance and delete account/profile data flow. | Privacy/POPIA | Critical | P0 | Learner can export and delete local/Supabase profile/discovery data; privacy copy exists. | `savedDiscovery.js`, `App.jsx`, `supabase/schema.sql` | E2E + Supabase integration |
| QA-P1-001 | Add career search/filter/all-routes view | Allow exploration beyond top 10. | Discovery | Major | P1 | Search by title/stream/subject; click result sets active route; mobile usable. | `App.jsx`, new components | E2E + accessibility |
| QA-P1-002 | Add dedicated career detail route or shareable state | Support bookmark/share for a selected career. | Routing/content | Major | P1 | Direct URL opens selected career/pathway; unknown career handles gracefully. | Add router or URL search params | E2E routing tests |
| QA-P1-003 | Add scoring unit tests | Cover tag effects, derived signals, ranking tie-breaks and explanations. | Scoring | Major | P1 | Tests fail if interest tags stop affecting ranking. | `src/lib/scoring.js`, new test setup | Unit tests |
| QA-P1-004 | Include academic pathway validation in `npm run check` | Prevent pathway graph regressions. | CI | Major | P1 | `npm run check` runs catalog, foundation, academic pathway validation and build. | `package.json` | CI run |
| QA-P1-005 | Build real privacy and independence pages/sections | Replace generic footer anchors. | Trust/legal | Major | P1 | Footer links open dedicated policy/principles content. | `App.jsx`, docs/legal content | Link tests |
| QA-P1-006 | Add browser e2e smoke suite | Verify nav, questions, tags, route map, save local mode and mobile menu. | QA | Major | P1 | Playwright/Cypress suite runs in CI. | New e2e config/tests | E2E |
| QA-P1-007 | Add accessibility baseline | Run axe/lighthouse checks and fix keyboard/contrast/labels. | Accessibility | Major | P1 | No critical axe violations on main flows. | App components/CSS | Axe tests |
| QA-P1-008 | Improve auth UX | Add password reset, confirm password, email verification handling and explicit validation errors. | Auth | Critical | P1 | Public auth flow handles common failures without raw errors. | `AccountPanel`, `savedDiscovery.js` | E2E + Supabase |
| QA-P2-001 | Add source/caution drawer to career and pathway fields | Show confidence/source status field-by-field. | Content safety | Major | P2 | User can inspect source status for any displayed claim. | `CareerCard`, `PathwayMap`, data modules | UI tests |
| QA-P2-002 | Add package lock | Improve reproducible installs. | Build | Major | P2 | `package-lock.json` committed and CI uses `npm ci`. | `package-lock.json`, workflows | CI |
| QA-P2-003 | Add stale saved-result migration | Recalculate or invalidate saved ranked results when scoring/catalog version changes. | Data consistency | Major | P2 | Old saved results do not show obsolete ranking silently. | `savedDiscovery.js`, version metadata | Unit/integration |
| QA-P2-004 | Implement 404 or known-route redirect policy | Avoid silent unknown route 200 shell if router added. | Routing | Minor | P2 | Invalid paths show not-found or redirect with message. | App/router | E2E |
| QA-P3-001 | Map raw signal keys to human labels in hero | Improve polish. | UX | Cosmetic | P3 | Active tags show friendly labels. | `App.jsx`, `careerCatalog.js` | Unit/snapshot |
| QA-P3-002 | Resolve low-data toggle doc mismatch | Either implement toggle or remove README claim. | Docs/UX | Minor | P3 | README matches app. | `README.md` or `App.jsx` | Manual review |

---

## 18. MVP Readiness Verdict

### Final verdict

**Ready only for internal demo. Not ready for MVP launch.**

### Top 10 blockers / launch blockers

1. No structured learner subject/marks profile.
2. No green/amber/red subject-choice risk engine.
3. Qualification and entry pathways are template-only, not provider/source verified.
4. No provider-specific APS/NQF/entry-requirement data in UI.
5. Supabase RLS and save/restore flows not verified in staging with two accounts.
6. No learner data export/delete/correction controls.
7. No full search/filter/all-routes exploration path for 344 careers.
8. No dedicated career detail/shareable route.
9. No e2e/browser/mobile/accessibility test coverage.
10. No real privacy policy link/page.

### Top 10 high-priority fixes

1. Add structured grade/subject/marks onboarding.
2. Add subject risk engine and warnings.
3. Add verified qualification/source data model in frontend.
4. Add search/filter and all-routes exploration.
5. Add scoring and pathway validation to CI.
6. Add Playwright/Cypress smoke tests.
7. Add Supabase integration/RLS tests.
8. Add privacy and data-rights flows.
9. Add dedicated career detail route or URL state.
10. Add field-level source/caution display.

### Features that work

- App builds successfully.
- Main root route serves successfully.
- Anchor navigation targets exist.
- Discovery answer state updates rankings by code inspection.
- Interest tags are connected to scoring by code inspection.
- Top-10 route cap is implemented.
- Mind-map selector changes active route by code inspection.
- Career card displays starter reality content.
- Pathway map is connected to academic pathway graph.
- Local/Supabase save code paths exist.
- RLS policies are defined in SQL.

### Features that are static/mock/template only

- Career catalog content.
- Qualification pathways.
- Subject recommendations.
- First-work entries.
- Growth/progression statements.
- Demand indicators.
- Earning-potential guidance.
- Source confidence metadata.

### Features missing from documented learner MVP

- Structured subject/marks profile.
- Personalised subject risk analysis.
- Verified provider-specific requirements.
- Career search/filter.
- Dedicated career pages.
- Compare view.
- Data export/delete/correction.
- Browser/e2e/a11y tests.
- Admin content verification tooling.

### Features missing but out of current documented scope

- Candidate dashboard.
- Client/employer dashboard.
- Marketplace.
- Unlocks/shortlists.
- Subscriptions/payments.
- Vetting.
- Hiring assessments.
- Admin marketplace controls.

### Security risks

- Supabase RLS policies are defined but not verified in this QA against a live project.
- Local demo mode uses localStorage and should not be mistaken for secure cross-device auth.
- No account deletion/export/correction controls.
- No privacy policy page.
- No audit UI for profile/discovery changes.

### Data risks

- Template pathway content may be interpreted as verified advice.
- Provider-specific qualification requirements are absent.
- Saved ranked results can become stale as scoring/catalog changes.
- No formal source-backed import/validation for public qualification claims.

### Recommended next sprint plan

1. Keep `validateAcademicPathways` in `npm run check` and CI.
2. Add scoring unit tests for tags/derived signals/top-10 behavior.
3. Build structured subject profile inputs.
4. Implement first version of green/amber/red risk engine from existing templates.
5. Add search/filter/all-routes exploration.
6. Add dedicated privacy/data rights section.
7. Set up Playwright smoke tests for desktop/mobile nav, discovery, tags, route map and local save/restore.
8. Run Supabase staging RLS tests with two accounts.
9. Add field-level “template/unverified/verified” labels in PathwayMap.
10. Create backlog for source-backed provider qualification import.

---

## 19. Final Launch Checklist

| Checklist Item | Status | Notes |
|---|---|---|
| `npm run check` passes | Passed | Build and existing validators pass. |
| Academic pathway validation passes | Passed after QA fix | Added to `npm run check`. |
| Root page serves locally | Passed | HTTP 200. |
| Unknown routes handled | Not Ready | No app-level 404. |
| All public links valid | Partially Ready | Anchors valid; privacy/independence are generic. |
| Core learner discovery works | Partially Ready | Code-connected; no e2e tests. |
| Interest tags affect scoring | Partially Ready | Code-connected; needs tests and clearer UI explanations. |
| Route signals max 10 | Passed | Implemented. |
| Pathway map connected | Partially Ready | Connected to template graph, not verified data. |
| Subject-choice engine | Not Ready | No structured subject inputs or risk engine. |
| Supabase save/restore | Needs Manual Verification | Code exists; no live env test. |
| RLS security | Needs Manual Verification | Policies exist; no two-account test. |
| Privacy/data rights | Not Ready | No policy/export/delete/correction. |
| Mobile QA | Needs Manual Verification | Responsive classes exist, no browser test. |
| Accessibility QA | Not Ready | No automated a11y testing. |
| Unit tests | Not Ready | No test script. |
| E2E tests | Not Ready | No e2e setup. |
| Production content governance | Not Ready | No admin/source workflow. |

