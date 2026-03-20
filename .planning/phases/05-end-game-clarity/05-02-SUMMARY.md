---
phase: 05-end-game-clarity
plan: 02
subsystem: presentation
tags: [game-over, scoreboard, i18n, css, role-reveal, viewer-identification]

requires:
  - phase: 05-end-game-clarity
    plan: 01
    provides: [row-viewer CSS class, row-spy CSS class, row-white CSS class, youLabel i18n key]

provides:
  - GameOverModal enriched with viewer self-identification (row-viewer + "You(Name)" label)
  - Spy row red highlight + spy emoji prefix on role label
  - White role row neutral highlight
  - viewer prop wired from App.tsx to GameOverModal

affects:
  - GameOverModal
  - App.tsx

tech-stack:
  added: []
  patterns: [conditional className array with filter(Boolean).join, viewer prop threading]

key-files:
  created: []
  modified:
    - apps/web/src/presentation/game-over/GameOverModal.tsx
    - apps/web/src/presentation/App.tsx

key-decisions:
  - "Role enum imported directly in GameOverModal for isSpy/isWhite comparison — avoids prop drilling boolean flags"
  - "viewer prop typed as Player | undefined — GameOverModal gracefully handles undefined by falling back to plain player.name"
  - "className array uses filter(Boolean).join(' ') pattern — matches idiom established in earlier voting UI work"

patterns-established:
  - "Viewer self-identification: compare player.id === viewer?.id in scoreboard rows for You(Name) label"
  - "Spy highlight: role === Role.SPY gates both row-spy class and emoji prefix before getRoleLabel()"

requirements-completed: [END-01, END-02, END-03]

duration: 2min
completed: "2026-03-18"
---

# Phase 05 Plan 02: Scoreboard Row Highlights and Viewer Self-Identification Summary

**GameOverModal scoreboard enriched with viewer yellow highlight + "You(Name)" label, spy red highlight + detective emoji, and white-role neutral highlight — wired via viewer prop from App.tsx.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T04:58:00Z
- **Completed:** 2026-03-18T05:00:01Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `viewer: Player | undefined` prop to GameOverModal Props interface
- Scoreboard rows now apply `row-viewer`, `row-spy`, `row-white` CSS classes conditionally (classes from Plan 01)
- Viewer's row renders `t('game.youLabel', { name })` (i18n key from Plan 01) instead of plain name
- Spy rows display `🕵️` emoji prefix before role label
- App.tsx passes `viewer={viewer}` (already computed at line 185) to GameOverModal

## Task Commits

Each task was committed atomically:

1. **Task 1: Add viewer prop and row highlights to GameOverModal** — pending user commit
2. **Task 2: Pass viewer prop to GameOverModal in App.tsx** — pending user commit

_Note: Per project CLAUDE.md, code commits are not automated — user commits manually._

## Files Created/Modified

- `apps/web/src/presentation/game-over/GameOverModal.tsx` — Added `viewer` prop, `Role` import, conditional row classes, You(Name) i18n label, spy emoji (120 lines, under 300-line limit)
- `apps/web/src/presentation/App.tsx` — Added `viewer={viewer}` prop to GameOverModal JSX (235 lines, under 300-line limit)

## Decisions Made

- Role enum imported directly in GameOverModal for `isSpy`/`isWhite` detection — avoids passing boolean flags down as extra props
- `viewer` prop is `Player | undefined` — when undefined (viewer not found in state), `isViewer` is always false and the modal degrades gracefully
- `className` array uses `filter(Boolean).join(' ')` idiom — consistent with pattern established in voting UI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 (End Game Clarity) fully complete — all 3 requirements END-01, END-02, END-03 satisfied
- END-01 (blinking win/lose text): delivered in Plan 01 restructure of GameEndRoleRevealModal
- END-02 (role reveal with color + spy emoji): delivered in this plan
- END-03 (viewer self-identification with yellow highlight): delivered in this plan
- No blockers — milestone v1.0 is ready for review

---
*Phase: 05-end-game-clarity*
*Completed: 2026-03-18*

## Self-Check

### Files exist
- `apps/web/src/presentation/game-over/GameOverModal.tsx`: FOUND (120 lines)
- `apps/web/src/presentation/App.tsx`: FOUND (235 lines)

### TypeScript
- `npx tsc --noEmit --project apps/web/tsconfig.json`: PASSED (no output = no errors)

### Key artifacts verified
- `viewer: Player | undefined` in Props interface: PRESENT (line 8)
- `isViewer`, `isSpy`, `isWhite` variables computed in row map: PRESENT (lines 65-67)
- `row-viewer`, `row-spy`, `row-white` applied conditionally: PRESENT (lines 73-75)
- `t('game.youLabel', { name: player.name })` for viewer row: PRESENT (line 79)
- `🕵️` emoji prefix for spy: PRESENT (line 82)
- `viewer={viewer}` in App.tsx GameOverModal JSX: PRESENT (line 228)

## Self-Check: PASSED
