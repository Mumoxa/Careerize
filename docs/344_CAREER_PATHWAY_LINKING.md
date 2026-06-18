# 344 Career Academic Pathway Linkage

This records the next Careerize product layer: every existing starter career route must have an academic pathway plan from Grade 10 subject choice to Grade 12 gate, qualification route and first-work entry.

The implementation lives in:

```text
src/data/academicPathwayTemplates.js
src/data/careerPathwayGraph.js
scripts/validateAcademicPathways.mjs
```

## What is now linked

The existing `CAREER_ROUTES` catalogue contains 344 starter career routes across 15 South African-first streams. The new pathway graph imports those routes and generates one academic pathway record per route.

Each academic pathway record includes:

- career ID
- career title
- stream
- pathway template kind
- Grade 10 subject plan
- subjects to protect from Grade 10 onward
- Mathematics gate
- science gate
- Grade 12 exit target
- qualification route options
- intake gates
- first-work entry roles
- Grade 10-to-work timeline
- trade route flag where relevant
- regulated/professional route flag where relevant
- verification status

## Product rule

Careerize must not tell a learner that a career is open or closed from one generic subject rule.

The product should say:

1. These subjects keep the route open.
2. These subjects may close or narrow the route.
3. This route may need Bachelor admission, Diploma admission, Higher Certificate admission, TVET, NCV, NATED, occupational training, apprenticeship, learnership, professional registration, vendor certification, portfolio evidence, workplace evidence or extra provider checks.
4. Exact APS, subject percentages, provider availability, accreditation and intake dates must be verified.

## Why templates first

A fully provider-verified qualification map for all 344 careers is a large research build. The template layer gives the app a correct learner-facing scaffold now, while keeping all exact admission claims marked as requiring verification.

This avoids the dangerous product mistake of inventing APS scores, subject percentages, accreditation claims or provider requirements.

## Template coverage

The pathway template engine covers:

- Technology, data and AI
- Finance, admin and business operations
- Skilled trades, construction and engineering
- Health, care and social services
- Education, training and youth development
- Agriculture, food and environment
- Logistics, transport and supply chain
- Law, public service and public safety
- Creative, media and design
- Sales, marketing and customer work
- Hospitality, tourism, sport and events
- Manufacturing, mining and energy
- Informal, entrepreneurship and community economy
- Science, research and frontier careers
- Arts, culture, heritage and society

## Validation

The repo now includes:

```bash
node scripts/validateAcademicPathways.mjs
```

The validation confirms:

- every catalogue career has a pathway record
- the count matches the 344-route coverage summary
- every pathway has Grade 10 subject guidance
- every pathway has qualification routes
- every pathway has a Grade 10-to-work timeline
- every pathway remains marked as template-linked until provider verification is done

## Next data build

The next phase should turn the template routes into source-backed qualification rows.

Recommended order:

1. Top 100 priority career routes.
2. Provider-specific qualification names.
3. NQF levels and credits where available.
4. APS and subject thresholds.
5. Professional-body and statutory registration gates.
6. QCTO/SETA/trade-test gates.
7. Vendor certification validity and retired certification replacements.
8. Source URL and date checked per row.

The pathway graph is now ready for frontend display once the UI adds a `Subject Choice and Qualification Route` panel.
