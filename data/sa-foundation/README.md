# Careerize SA Foundation Data Import

Date: 18 June 2026  
Source workspace: `workspace-019ecb13-0c77-7745-a113-fb583a056bfa.zip` plus 2026-06-18 product update  
Status: imported foundation layer and pathway-engine scaffold, not public claims layer.

## Purpose

This folder preserves the high-value South African career intelligence tables from the supplied workspace without duplicating the live frontend catalog in `src/data/careerCatalog.js`.

The live app catalog currently provides breadth: 1,050 starter career routes. This foundation layer provides the next depth layer: OFO/OIHD mapping, qualification bridges, graph structure, Top 100 enrichment queue, registration dependencies, specialisations, province notes, source-verification workflow, subject-choice rules and qualification-pathway schema.

## Important product rule

These files are **not** permission to publish detailed salary, demand, APS, entry-requirement or qualification eligibility claims.

They are working data. Careerize must keep public learner guidance conservative until each claim has a source URL, access date, provider/awarding body, verification status and confidence score.

## Corrected product priority

The next build is the subject-choice-to-career engine.

The product must work backwards:

```text
career interest
→ career reality
→ qualification route
→ entry requirements
→ Grade 12 marks / APS where available
→ Grade 10 subject choice
→ first-work entry point
→ growth and adjacent careers
```

The full qualification database is a long-term target. The immediate learner value is helping Grade 9-12 learners understand which subjects keep routes open and which choices may limit future options.

## Imported files currently committed

| File | Why it matters |
|---|---|
| `careerize_sa_repository_manifest.csv` | Human-readable file manifest from the workspace. |
| `careerize_sa_top100_build_queue.csv` | First 100 careers to convert from starter profiles into deeper source-backed profiles. |
| `careerize_sa_graph_summary.csv` | Summary counts for graph seed nodes/edges. |
| `qualification_pathway_schema.csv` | Spreadsheet-ready schema for verified qualification rows. |
| `subject_choice_rules_seed.csv` | First conservative subject-to-pathway rules for Grade 10-12 planning. |
| `accreditation_source_registry.csv` | Source registry for SAQA, DHET, CHE, QCTO, Umalusi, SETA, professional body and vendor checks. |
| `career_qualification_coverage.csv` | Generated 1,050-row reconciliation showing every live career route and its conservative qualification-family association. Exact provider programmes remain source-verification work. |
| `career_research_queue.csv` | Generated 1,050-row source-verification work queue. Every live career has required source categories and high-risk fields blocked until evidence is attached. |
| `career_research_team_workplan.csv` | Generated 1,050-row research-team execution plan assigning every route to a lane, phase, primary role, evidence reviewer and learner-safety QA reviewer. |
| `career_claim_evidence.csv` | Generated claim-level evidence layer covering all 1,050 live career routes. It includes occupation-recognition rows, blocked-field limitation rows, promoted source-backed demand signposts where supported, and review-needed research-archive rows. |

## 27 June 2026 research archive integration

Careerize now also carries a second imported research archive:

- source archive: `workspace-019f0ad1-5c85-71b9-ba8f-c25183c5f379.zip`
- raw research rows imported into the foundation layer: 1,775
- canonical title-deduped careers generated from those rows: 1,702
- duplicate title groups surfaced for review: 47

The archive itself is not the learner-facing catalog. It is a research-source layer that has been normalised and linked back into the current Careerize structure.

### Generated research-layer files

| File | Why it matters |
|---|---|
| `careerize_sa_research_archive_manifest.csv` | Provenance list for the imported research archive files and row counts. |
| `careerize_sa_research_raw_master.csv` | Canonical raw-ID layer: one row per imported research `Career ID`, with Batch 009 enrichment folded back into the base rows. |
| `careerize_sa_research_canonical_careers.csv` | Title-deduped operational layer for cross-batch career normalisation. |
| `careerize_sa_research_duplicate_groups.csv` | Review layer showing where multiple raw records collapse into one canonical title. |
| `careerize_sa_research_alignment.csv` | Links every canonical research career to a Careerize stream, pathway template and starter-route match or suggestion where safe. |
| `careerize_sa_research_reality_profiles.csv` | Qualitative earning, travel, stress and danger prompt signals derived for each canonical research career so the archive can align with the current Careerize reality-slider model. |
| `careerize_sa_starter_route_research_links.csv` | Reverse-link layer: one row per live starter route showing which canonical research careers link back directly, by suggestion or by curated manual route-family linkage. |
| `careerize_sa_starter_route_research_gaps.csv` | Starter-route coverage gaps where the live route still has no safe research alignment after the direct, suggestion and curated-link pass. |
| `careerize_sa_top100_research_gaps.csv` | Shows the Top 100 backlog rows that still need manual title normalisation or deeper matching after automated alignment. |
| `careerize_sa_research_graph_nodes.csv` | Unified graph nodes for canonical research careers, starter routes, streams, pathway templates and backlog markers. |
| `careerize_sa_research_graph_edges.csv` | Unified graph edges linking canonical careers to categories, streams, pathway templates, starter routes, related careers and Top 100 backlog status. |
| `careerize_sa_research_graph_summary.csv` | Summary counts for the generated research graph layer. |

### What is linked now

- Every canonical research career is linked to one current Careerize macro stream.
- Every canonical research career is linked to one current academic pathway template.
- The live Careerize catalog now contains 1,050 starter routes across 18 streams after the newer OFO-linked catalog expansion was restored and re-aligned.
- 284 canonical research careers have a direct starter-route title alignment.
- 1,350 additional starter-route suggestion edges are recorded as suggestions only, not final equivalence claims.
- 145 canonical-career links now cover all 100 Top 100 backlog items directly in the research layer.
- `careerize_sa_top100_research_gaps.csv` is now intentionally empty after the final manual normalisation pass closed the remaining backlog links.
- 1,702 canonical research careers now have a qualitative reality profile aligned to Careerize's earning, travel, stress and danger discussion model.
- 589 live starter routes now have a direct, suggestion or curated research link.
- 283 live starter routes currently have at least one direct research match.
- 268 live starter routes currently rely on suggestion-only links.
- 38 live starter routes currently rely on curated manual route-family links where no safe direct or suggestion match existed yet.
- `careerize_sa_starter_route_research_gaps.csv` currently contains 461 uncovered starter routes, which surfaced once the larger 1,050-route catalog was merged back in and now acts as the explicit follow-on research-link backlog.

## Full workspace assets represented in the manifest

The source zip included a broader pack than the files committed in the first pass:

- all-career-path universe and path ladders
- OFO major group universe and family mapping
- OIHD 350 seed, family map, profile queue, priority scoring and qualification bridge
- qualification seed, qualification fanout and occupation bridge
- graph nodes, graph edges and graph summary
- registration dependencies
- public/private/informal modes
- province demand notes
- salary verification tracker
- top-100 build queue and source verification tracker
- specialisation seed layer
- phase roadmap and repository dashboard notes
- extracted text versions of the 2023 Critical Skills list and 2024 OIHD gazette

The full file list is preserved in `careerize_sa_repository_manifest.csv`.

## Deliberate non-duplication decision

I did not merge these tables into the generated `CAREER_ROUTES` array directly. Doing that would duplicate route titles, blur starter content with verification data, and risk displaying unverified claims.

Instead, this folder is the source-backed workbench for future phases:

1. Use `careerize_sa_top100_build_queue.csv` to pick the next profiles to enrich.
2. Use `subject_choice_rules_seed.csv` to build the first Grade 10-12 subject warning engine.
3. Use `qualification_pathway_schema.csv` as the import shape for verified qualification rows.
4. Use `accreditation_source_registry.csv` to decide which source type must support each claim.
5. Use the qualification and registration files from the workspace to build proper pathway sections.
6. Use the specialisation layer to split broad profiles into real-world variants.
7. Keep salary and demand fields in verification workflow until ready.

## Next implementation move

Convert this folder into a database seed/import layer and add validation scripts that reject public qualification claims without source URL, access date, verification status and confidence score.

Do not add more hand-coded frontend career objects until the subject-choice, research-queue, research-team workplan, claim-evidence and qualification-pathway structures are wired into the app.
