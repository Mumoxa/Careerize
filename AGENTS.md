# Coding Agent Instructions for this Mumoxa repo

Before making any change in this repository, every coding agent must read this repository's `AGENTS.md` and then read and follow the canonical Mumoxa instructions in `Mumoxa/agent-instructions/AGENTS.md`.

Canonical source of truth:

`Mumoxa/agent-instructions/AGENTS.md`

Do not use `Mumoxa/ai-agent-squad` as the canonical source for agent instructions.

Core rules:

1. Do not invent facts, requirements, architecture, build status, test results, security status or deployment status.
2. Inspect the existing repo structure before coding.
3. Check for duplicate components, routes, utilities, schemas and features before adding anything new.
4. Keep changes small, evidence-backed and reviewable.
5. Run available lint, tests, type checks and build checks. If something cannot run, state exactly why.
6. For UI work, follow modern production UI standards: clean spacing, strong hierarchy, accessibility, responsive behaviour and loading, empty, error and success states.
7. Finish with a clear handoff: files changed, verification run, risks and manual checks still needed.

Rule zero: no hallucination, no duplicated work, no unsupported verification claims.