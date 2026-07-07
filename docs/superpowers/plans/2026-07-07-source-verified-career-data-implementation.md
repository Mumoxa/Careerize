# Source-Verified Career Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full 1,050-route claim-level evidence coverage without inventing unsupported career facts.

**Architecture:** Generate `career_claim_evidence.csv` from existing live routes, OFO-backed master career data and the imported research archive. Validate the generated file with strict allowed value, source class and promotion rules, then expose coverage counts to production readiness checks.

**Tech Stack:** Node.js ESM scripts, existing CSV utilities, Vite/Vitest, existing Careerize static data modules.

## Global Constraints

- Do not invent salary ranges, APS scores, subject thresholds, provider entry requirements, province-level demand, accreditation status, professional registration requirements or employment outcomes.
- A claim may be learner-facing only when it has a source URL, source name, source type, access date, verification status and confidence score.
- Unknowns must remain unknown.
- Cover all 1,050 live `CAREER_ROUTES`.
- Keep unrelated `.superpowers/` and `debug.log` untracked.

---

### Task 1: Evidence Validator

**Files:**
- Create: `scripts/validateCareerClaimEvidence.mjs`
- Modify: `package.json`
- Test: command-line validator run before and after fixture generation

**Interfaces:**
- Consumes: `data/sa-foundation/career_claim_evidence.csv`, `src/data/careerCatalog.js`
- Produces: validation gate `npm run validate:claim-evidence`

- [x] **Step 1:** Write the validator to fail when the evidence CSV is missing.
- [x] **Step 2:** Run `node scripts/validateCareerClaimEvidence.mjs` and confirm it fails on the missing CSV.
- [x] **Step 3:** Add `validate:claim-evidence` to `package.json` and include it in `npm run check`.

### Task 2: Full Evidence Importer

**Files:**
- Create: `scripts/exportCareerClaimEvidence.mjs`
- Create: `data/sa-foundation/career_claim_evidence.csv`
- Modify: `package.json`

**Interfaces:**
- Consumes: `CAREER_ROUTES`, `MASTER_CAREER_LIST`, `careerize_sa_starter_route_research_links.csv`, `careerize_sa_research_canonical_careers.csv`
- Produces: one or more evidence rows for every live route, including source-limitation rows for blocked fields

- [x] **Step 1:** Write importer that produces all required columns.
- [x] **Step 2:** Generate full 1,050-route evidence CSV.
- [x] **Step 3:** Run validator and fix any row-shape failures.

### Task 3: Production Readiness Integration

**Files:**
- Modify: `scripts/validateProductionReadiness.mjs`
- Modify: `docs/CAREER_COVERAGE_MANIFEST.md`
- Modify: `docs/deployment-readiness.md`

**Interfaces:**
- Consumes: validated evidence CSV
- Produces: production readiness checks that enforce full evidence coverage

- [x] **Step 1:** Add evidence coverage checks to production readiness validation.
- [x] **Step 2:** Document the evidence file and blocked-claim policy.
- [x] **Step 3:** Run `npm run validate:production`.

### Task 4: Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: all modified scripts/data/docs
- Produces: verified local build state

- [x] **Step 1:** Run `npm run validate:claim-evidence`.
- [x] **Step 2:** Run `npm run check`.
- [x] **Step 3:** Commit implementation.
