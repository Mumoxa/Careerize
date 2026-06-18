# Careerize Product Gap Audit

Assessment date: 2026-06-15

Update note: product refinement on 2026-06-15 changed the compensation approach. Careerize should avoid detailed salary information for now and use qualitative earning-potential insight instead.

Full overview note: `docs/FULL_OVERVIEW_REVIEW.md` is the current alignment file for the consolidated strategy/product/Codex overview. It confirms the broad strategy and records the salary-band amendment.

| Gap area | Status before update | Action taken | Remaining status |
|---|---|---|---|
| Missing career intelligence features | Partial | Added richer profile fields, day-in-life, tasks, subjects, qualifications, misconceptions, earning-potential insight and data states. | Improved; still needs real source-backed data at scale. |
| Weak career profile pages | Partial | Upgraded career card blueprint into a structured profile-style view. | Improved; next step is a dedicated career profile component/page. |
| Poor data structure | Partial | Added country, status, lastUpdated, dataConfidence, sourceIds, pathways and source registry fields. | Improved; future DB ingestion still needed. |
| Weak source tracking | Missing | Added `SOURCE_REGISTRY`, source IDs and confidence display. | Improved; external public source loading still needed. |
| Weak SA localisation | Partial | Added 8 SA pathway types and mapped starter routes. Added the NSC subject framework, statutory minimum admission levels and HEQSF/NQF qualification types plus common degrees in `src/data/saQualifications.js`. | Improved; framework and common-degree data now present. Per-institution programme detail and current-year SAQA/TVET/SETA verification still to load. |
| Weak earning-potential guidance | Missing | Replaced salary-field direction with qualitative earning-potential insights. | Improved; detailed salary deliberately deferred. |
| Weak visualisation | Partial | Added confidence badges, route readiness and explicit demand unknown states. | Improved; demand heatmaps deferred until data exists. Salary charts are out of scope for now. |
| Weak search/discovery | Partial | Preserved discovery questions and interest tags; added audience segmentation and explainability. Added a two-way subject-to-qualification-to-career linkage (study-path panel on every career profile plus a Subjects explorer). | Improved; subject-to-career map now present. Full search/filter page still needed. |
| Weak recommendation transparency | Partial | Added matched/missing signals, confidence labels and next-step explanations. | Improved; should expand into action plans next. |
| Weak mobile UX | Partial | Added low-data mode toggle and reduced visual effects when enabled. | Improved; PWA/offline still needed. |
| Weak admin/content tooling | Missing | Added schema foundation for public career profiles and sources. | Partial; admin UI deferred. |
| Weak architecture | Partial | Added ZA country abstraction and public read-only content tables. | Improved; full normalised knowledge graph still future work. |
| Weak test coverage | Partial | Expanded catalog validation. | Improved slightly; unit/e2e/accessibility tests still needed. |
| Broken routes/flows | Not observed in inspected files | No route bug fixed. | Needs browser regression after deployment. |
| Placeholder content | Present | Marked starter/demo states clearly and avoided detailed salary/demand claims. | Safer, but still starter content. |
| Over-generic copy | Partial | Updated hero, trust and section copy to be more specific. | Improved. |
| AI overclaims | Risk | Added guidance language validator for banned overclaim phrases. | Improved. |
| Compliance/privacy risks | Partial | Preserved learner-owned memory and RLS; added stronger copy. | Improved; full POPIA export/delete/correction flows still needed. |
| Parent/advisor support | Missing | Identified as a high-priority journey in the full overview review. | Still missing; should be built after the career profile component. |
| Multilingual/i18n | Missing | Identified as a platform-level requirement. | Still missing; start with UI string scaffold before translating all content. |
| Action plans | Missing | Identified as a high-value decision-support module. | Still missing; next logical product module. |
