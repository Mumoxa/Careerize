# Careerize Product Gap Audit

Assessment date: 2026-06-15

| Gap area | Status before update | Action taken | Remaining status |
|---|---|---|---|
| Missing career intelligence features | Partial | Added richer profile fields, day-in-life, tasks, subjects, qualifications, misconceptions and data states. | Improved; still needs real source-backed data at scale. |
| Weak career profile pages | Partial | Upgraded career card blueprint into a structured profile-style view. | Improved. |
| Poor data structure | Partial | Added country, status, lastUpdated, dataConfidence, sourceIds, pathways and source registry fields. | Improved; future DB ingestion still needed. |
| Weak source tracking | Missing | Added `SOURCE_REGISTRY`, source IDs and confidence display. | Improved; external source loading still needed. |
| Weak SA localisation | Partial | Added 8 SA pathway types and mapped starter routes. | Improved; still needs real NSC/NQF/SAQA/TVET/SETA data. |
| Weak visualisation | Partial | Added confidence badges, route readiness and explicit salary/demand unknown states. | Improved; salary bars/demand heatmaps deferred until data exists. |
| Weak search/discovery | Partial | Preserved discovery questions and interest tags; added audience segmentation and explainability. | Improved; full search/filter page still needed. |
| Weak recommendation transparency | Partial | Added matched/missing signals, confidence labels and next-step explanations. | Improved. |
| Weak mobile UX | Partial | Added low-data mode toggle and reduced visual effects when enabled. | Improved; PWA/offline still needed. |
| Weak admin/content tooling | Missing | Added schema foundation for public career profiles and sources. | Partial; admin UI deferred. |
| Weak architecture | Partial | Added ZA country abstraction and public read-only content tables. | Improved; full normalised knowledge graph still future work. |
| Weak test coverage | Partial | Expanded catalog validation. | Improved slightly; unit/e2e/accessibility tests still needed. |
| Broken routes/flows | Not observed in inspected files | No route bug fixed. | Needs browser regression after deployment. |
| Placeholder content | Present | Marked starter/demo states clearly and avoided salary/demand claims. | Safer, but still starter content. |
| Over-generic copy | Partial | Updated hero, trust and section copy to be more specific. | Improved. |
| AI overclaims | Risk | Added guidance language validator for banned overclaim phrases. | Improved. |
| Compliance/privacy risks | Partial | Preserved learner-owned memory and RLS; added stronger copy. | Improved; full POPIA flows still needed. |
