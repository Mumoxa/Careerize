# Careerize SA Foundation Data Import

Date: 15 June 2026  
Source workspace: `workspace-019ecb13-0c77-7745-a113-fb583a056bfa.zip`  
Status: imported foundation layer, not public claims layer.

## Purpose

This folder preserves the high-value South African career intelligence tables from the supplied workspace without duplicating the live frontend catalog in `src/data/careerCatalog.js`.

The live app catalog currently provides breadth: 344 starter career routes. This foundation layer provides the next depth layer: OFO/OIHD mapping, qualification bridges, graph structure, Top 100 enrichment queue, registration dependencies, specialisations, province notes and source-verification workflow.

## Important product rule

These files are **not** permission to publish detailed salary, demand or qualification eligibility claims. They are working data. Careerize must keep salary as qualitative earning-potential guidance until the founding team explicitly decides otherwise and the relevant claim has a source URL, access date and confidence score.

## Imported files currently committed

| File | Why it matters |
|---|---|
| `careerize_sa_repository_manifest.csv` | Human-readable file manifest from the workspace. |
| `careerize_sa_top100_build_queue.csv` | First 100 careers to convert from starter profiles into deeper source-backed profiles. |
| `careerize_sa_graph_summary.csv` | Summary counts for graph seed nodes/edges. |

## Full workspace assets represented in the manifest

The source zip included a broader pack than the files committed in this pass:

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
2. Use the qualification and registration files from the workspace to build proper pathway sections.
3. Use the specialisation layer to split broad profiles into real-world variants.
4. Keep salary and demand fields in verification workflow until ready.

## Next implementation move

The next serious build should convert this folder into a database seed/import layer, not more hand-coded frontend objects.
