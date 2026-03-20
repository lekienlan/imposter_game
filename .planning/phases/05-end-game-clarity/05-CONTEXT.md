# Phase 5: End Game Clarity - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Players understand who won, who the Spy was, and their personal result at a glance — without parsing a table. The end screen shows personal win/loss result prominently, Spy reveal, and winner reason. Requirements: END-01, END-02, END-03.

</domain>

<decisions>
## Implementation Decisions

### End screen flow
- Keep the **two-step reveal**: step 1 shows personal result, step 2 shows full scoreboard
- Transition: **fade swap** — step 1 fades out (200ms), step 2 fades in (200ms)
- Step 1 **auto-advances after ~4 seconds**, but Continue button is available for immediate tap
- Step 2 player table appears **all at once** — no row-by-row animation

### Personal result prominence
- Step 1 leads with **VICTORY/DEFEAT first** in large text, role shown below it (current modal has role first — reverse this)
- VICTORY/DEFEAT uses **blinking arcade text** (reuse existing `blinking-text` CSS class)
- Colors: **green for victory, red for defeat** (matches existing badge colors)
- On step 2 scoreboard: **viewer's own row is highlighted** with distinct background/border so they can find themselves instantly

### Spy reveal treatment
- Spy row in the table gets a **distinct red border/background highlight** — not a separate callout section
- **White role also gets highlighted** with its own distinct styling (gray/white treatment)
- Spy row includes a **🕵️ emoji** next to the SPY role label
- Viewer's row shows **"You(Name)"** format instead of just the name, for instant self-identification (e.g., "▶ You(Bob)")

### Claude's Discretion
- Winner reason display styling and placement (not discussed — keep current approach or improve as seen fit)
- Exact highlight colors/borders for Spy and White rows
- Auto-advance timer exact duration (3-5s range)
- Animation easing curves for fade transition

</decisions>

<specifics>
## Specific Ideas

- Reuse existing `blinking-text` CSS class from GameOverModal for the VICTORY/DEFEAT effect
- The two-step flow already exists as `GameEndRoleRevealModal` → `GameOverModal` — restructure content within these, don't create new components from scratch
- The "You" label should be localized (i18n) since the game supports EN/VI/KO/ZH

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-end-game-clarity*
*Context gathered: 2026-03-18*
