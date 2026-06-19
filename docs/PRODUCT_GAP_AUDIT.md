# Careerize Product Gap Audit

Assessment date: 2026-06-15  
Updated: 2026-06-18

## Current alignment note

Product refinement on 2026-06-18 corrected the main product direction. Careerize should be treated as a **Grade 9-12 subject-choice-to-career pathway engine**, not only a broad career list.

The platform should work backwards from a career to:

```text
career reality
→ qualification route
→ provider-specific entry criteria
→ Grade 12 marks / APS where available
→ Grade 10 subject choices
→ first-work entry point
→ progression and adjacent careers
```

The 2026-06-15 compensation rule still stands: Careerize should avoid detailed salary information for now and use qualitative earning-potential insight unless a future source-backed product decision changes that.

## Gap audit

| Gap area | Status before update | Action taken | Remaining status |
|---|---|---|---|
| Missing career intelligence features | Partial | Added richer profile fields, day-in-life, tasks, subjects, qualifications, misconceptions, earning-potential insight and data states. | Improved; still needs real source-backed data at scale. |
| Weak career profile pages | Partial | Upgraded career card blueprint into a structured profile-style view. | Improved; next step is a dedicated career profile component/page. |
| Poor data structure | Partial | Added country, status, lastUpdated, dataConfidence, sourceIds, pathways and source registry fields. | Improved; future DB ingestion still needed. |
| Weak source tracking | Missing | Added `SOURCE_REGISTRY`, source IDs and confidence display. | Improved; external public source loading still needed. |
| Weak SA localisation | Partial | Added 8 SA pathway types and mapped starter routes. | Improved; now needs NQF, SAQA, DHET, CHE, TVET, SETA and QCTO-backed qualification data. |
| Missing subject-choice engine | Missing | Added `docs/SUBJECT_TO_CAREER_ENGINE.md` and `data/sa-foundation/subject_choice_rules_seed.csv`. | New priority; frontend component and validation still missing. |
| Missing qualification data model | Missing | Added `docs/QUALIFICATION_PATHWAY_DATA_MODEL.md` and `data/sa-foundation/qualification_pathway_schema.csv`. | Schema exists; source-backed import and validation still missing. |
| Missing accreditation guidance | Partial | Added `data/sa-foundation/accreditation_source_registry.csv` and expanded `docs/SOURCES.md`. | Needs learner-facing accreditation checker. |
| Weak earning-potential guidance | Missing | Replaced salary-field direction with qualitative earning-potential insights. | Improved; detailed salary deliberately deferred. |
| Weak visualisation | Partial | Added confidence badges, route readiness and explicit demand unknown states. | Improved; demand heatmaps deferred until data exists. Salary charts are out of scope for now. |
| Weak search/discovery | Partial | Preserved discovery questions and interest tags; added audience segmentation and explainability. | Improved; full search/filter page and subject-to-career map still needed. |
| Weak recommendation transparency | Partial | Added matched/missing signals, confidence labels and next-step explanations. | Improved; should expand into learner action plans and pathway-risk explanations. |
| Weak mobile UX | Partial | Added low-data mode toggle and reduced visual effects when enabled. | Improved; PWA/offline still needed. |
| Weak admin/content tooling | Missing | Added schema foundation for public career profiles and sources. | Partial; admin UI and bulk import tooling deferred. |
| Weak architecture | Partial | Added ZA country abstraction and public read-only content tables. | Improved; full normalised knowledge graph still future work. |
| Weak test coverage | Partial | Expanded catalog validation. | Improved slightly; unit/e2e/accessibility tests and qualification-claim validation still needed. |
| Broken routes/flows | Not observed in inspected files | No route bug fixed. | Needs browser regression after deployment. |
| Placeholder content | Present | Marked starter/demo states clearly and avoided detailed salary/demand claims. | Safer, but still starter content. |
| Over-generic copy | Partial | Updated hero, trust and section copy to be more specific. | Improved; should now be sharpened further around Grade 9-12 subject decisions. |
| AI overclaims | Risk | Added guidance language validator for banned overclaim phrases. | Improved. |
| Compliance/privacy risks | Partial | Preserved learner-owned memory and RLS; added stronger copy. | Improved; full POPIA export/delete/correction flows still needed. |
| Parent/advisor support | Missing | Identified as a high-priority journey in the full overview review. | Still missing; should be built after the subject-choice engine. |
| Multilingual/i18n | Missing | Identified as a platform-level requirement. | Still missing; start with UI string scaffold before translating all content. |
| Action plans | Missing | Identified as a high-value decision-support module. | Still missing; next logical product module. |

## Immediate next build recommendation

1. Build a learner subject-profile component.
2. Import `subject_choice_rules_seed.csv` into a usable data module.
3. Add route-risk logic: green, amber, red.
4. Build one detailed pathway view using Data Scientist as the reference example.
5. Add validation that rejects public qualification rows without source URL, access date and verification status.
