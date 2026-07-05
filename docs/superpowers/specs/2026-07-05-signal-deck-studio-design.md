# Signal Deck Studio Front Page Redesign

Date: 2026-07-05

## Decision

Replace the current front-page wordmap/wordgraph with a focused decision guidance product called **Signal Deck Studio**.

The approved direction combines:

- **A. Vibe Deck Carousel:** one-card-at-a-time interest discovery for a playful, mobile-first entry point.
- **C. Remix Studio:** a visual signal board that shows selected interest themes, decision trade-offs and resulting career paths.

The target audience is 15-20 year olds. The front page should feel modern, energetic and ergonomic, but still credible enough for learners, parents, teachers and advisors.

## Product Shape

The front page becomes the product experience, not a marketing page and not a long explainer.

The first viewport should show:

- Careerize branding and minimal navigation.
- A clear product title, such as "Signal Deck Studio".
- A short promise: pick interest cards, tune the signal mix, compare starter paths.
- The interactive decision surface itself.

The front page should remove unnecessary explanatory blocks. It should not try to explain the whole platform, the full data model, or every career pathway detail. Those belong on separate pages.

## Page Model

Use a small route/page split:

- `/`: Signal Deck Studio decision guidance product.
- `/careers`: direct career search and career-cluster browsing for users who already know what they want to inspect.
- `/careers/:careerId` or equivalent pathway detail view: full career path explanation, entry routes, requirements, real-world scenarios, qualifications, subject relevance, verification warnings and next steps.
- `/for-parents-teachers`: plain-language explanation of how to use Careerize with learners and what the guidance can and cannot claim.
- `/for-partners`: separate page for industry partners, providers and collaborators when partner-facing content is included.

The acceptance target is separate navigable pages or route-equivalent views. The front page must not carry explanatory, direct-search or full-pathway-detail content.

## Front Page Experience

The Signal Deck Studio has three visible zones.

### 1. Interest Card Deck

Learners review one interest card at a time. Each card uses learner-friendly wording such as:

- "I like solving weird problems"
- "I enjoy helping people"
- "I want to build things"
- "I notice patterns"

Controls:

- Add signal
- Skip
- Back/next where useful
- Search or category filter for users who want direct control

Selected cards become chips in a visible signal stack. Existing selection limits still apply.

### 2. Signal Remix Board

Selected interests appear as movable-looking visual tiles or grouped signal blocks. This replaces the current dense graph layout.

The board should make relationships feel alive without implying scientific precision. It should show selected interest themes, related skills and category colors, but avoid unsupported claims about suitability, success, admissions readiness or labor-market certainty.

Career reality sliders remain part of the experience, but should be visually lighter and framed as "tune your mix" controls rather than a separate heavy panel.

### 3. Pathway Results Panel

The top paths remain visible beside or below the deck/board.

Each result card should include:

- Career title
- Career cluster
- Short reason based on selected signals
- One or two related skills
- A clear "View pathway" action
- A guidance warning that the match is exploratory and not an admissions or success prediction

Opening a path moves the user to the dedicated pathway detail page or route.

## Visual Direction

Use the approved hybrid preview:

- Warm paper base
- Deep ink/navy UI surfaces
- Lime, teal, coral, sky and occasional violet accents
- Strong typography with tight hierarchy
- Rounded but not toy-like UI
- Card/deck motion cues without making the app feel like a game

Avoid:

- The current sprawling wordgraph as the main UI
- Long explanatory front-page sections
- A one-hue green/sage palette
- Decorative-only gradients or clutter
- Tiny dense controls that make selection feel like admin work

## Data And State

Reuse the existing interest signals, category taxonomy, scoring helpers, recommendation details, selected signal URL state and pathway data where possible.

The redesign should not invent new career facts, new requirements, new qualification claims or new labor-market claims. If data is not source-verified, the UI must preserve the existing verification boundaries.

State should include:

- Selected interest signals
- Active card or filtered card list
- Active category/search filter
- Lifestyle preference slider values
- Active recommended career/pathway
- Reset behavior
- URL sharing for selected signals and active pathway where practical

## Empty, Error And Limit States

Required states:

- No interests selected: show a friendly prompt to add cards and explain that paths are starter examples.
- Search/category returns no cards: show a simple empty result and a reset option.
- Selection limit reached: disable adding more signals and explain how to remove one.
- No recommendations yet: show starter routes without implying personal fit.
- Pathway data unavailable: show a plain fallback and avoid fake details.

## Accessibility And Responsiveness

The deck and board must work with keyboard, screen readers and touch.

Requirements:

- Buttons expose `aria-pressed` or equivalent selected state.
- Card actions have clear accessible names.
- Selection count uses live-region behavior where appropriate.
- Sliders keep explicit labels and helper text.
- Mobile layout stacks as deck -> selected mix -> results.
- Desktop layout can use a three-zone composition.
- Text must not overlap or overflow controls at common viewport widths.

## Testing And Verification

Update existing UI tests around:

- Rendering the Signal Deck Studio front page.
- Selecting and deselecting interest cards.
- Enforcing the interest selection limit.
- Slider values changing recommendation order.
- Reset clearing deck, board, search, filters and sliders.
- Opening a pathway from the results panel.
- URL hydration for selected signals and active pathway.

Run the available validation path after implementation:

- Focused UI tests first.
- `npm run test:ui`
- `npm run build`
- Broader checks as time allows, with exact failures reported if any command cannot run.

## Scope Boundary

This spec covers the front-page redesign and the route/page shape needed to move unrelated explanation away from the front page.

It does not require building a full CMS, accounts, saved profiles, provider database, industry partner workflow or new source-verified career facts.

## Open Implementation Notes

- The current app is a Vite/React/Tailwind single-page app with most UI in `src/App.jsx`.
- The implementation should check for reusable helpers before adding new data or scoring utilities.
- The first build may keep components in `App.jsx` if that is the smallest reviewable change, but the design favors extracting focused components once the UI grows.
- Temporary preview files under `.codex-temp/` and `.superpowers/` are not product code.
