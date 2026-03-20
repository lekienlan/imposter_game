---
phase: 02-phase-clarity
plan: 02
subsystem: ui
tags: [react, i18n, typescript]

# Dependency graph
requires:
  - phase: 02-phase-clarity
    plan: 01
    provides: phaseLabel map, phaseGuidanceKey function, i18n keys in all locale files
provides:
  - ActionBoard.tsx renders translated phase badge pill in top bar
  - ActionBoard.tsx renders role-aware guidance text below nextMove kicker
  - showPhaseInfo guard hides badge/guidance on GAME_ENDED and ROLE_DISTRIBUTION
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "showPhaseInfo boolean guard controls badge and guidance visibility"
    - "t(phaseLabel[phase]) renders the translated pill badge"
    - "t(phaseGuidanceKey(phase, isHost)) renders role-aware guidance"

key-files:
  created: []
  modified:
    - apps/web/src/presentation/game/ActionBoard.tsx

key-decisions:
  - "ActionBoard.tsx was already updated during Plan 01 auto-fix (Rule 3) — Plan 02 verified the visual output"
  - "GAME_ENDED winner tag removed from top bar — existing game-over modal handles winner display"
  - "guide.title + guide.description + guide.tip replaced with single arcade-muted guidance line"

patterns-established: []

requirements-completed: [PHASE-01, PHASE-02]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 2 Plan 02: ActionBoard Phase Badge + Guidance Summary

**Phase badge pill and action guidance text wired into ActionBoard.tsx, replacing raw enum display with translated i18n strings**

## Performance

- **Duration:** 2 min
- **Completed:** 2026-03-18
- **Tasks:** 3 (import update, badge+guidance render, visual verification)
- **Files modified:** 1

## Accomplishments

- Verified `showPhaseInfo` guard hides badge/guidance on GAME_ENDED and ROLE_DISTRIBUTION
- Verified pill badge renders short Vietnamese phase names (CHỜ, THẢO LUẬN, BẦU CHỌN) via `t(phaseLabel[phase])`
- Verified role-aware guidance via `t(phaseGuidanceKey(phase, isHost))` — host/non-host see different text for WAITING and VOTING
- Removed raw enum display (`{gameState.phase}`) and old `guide.title`/`guide.description`/`guide.tip` lines
- ActionBoard.tsx at 178 lines (under 300 limit)
- All 67 tests pass, TypeScript clean

## Files Modified

- `apps/web/src/presentation/game/ActionBoard.tsx` — Updated imports, added showPhaseInfo guard, replaced raw enum + guide lines with i18n badge and guidance

## Deviations from Plan

### Pre-applied Changes

**1. ActionBoard.tsx already updated in Plan 01 auto-fix**
- **Issue:** Plan 01 deleted `phaseGuide` export from `phasePresentation.ts`, which broke ActionBoard's import
- **Fix:** Plan 01 applied the ActionBoard changes from Plan 02 as a Rule 3 auto-fix to prevent broken build
- **Impact:** Plan 02 tasks 1 and 2 were already in place; Plan 02 focused on visual verification (Task 3)

---

**Total deviations:** 1 (pre-applied from Plan 01)
**Impact on plan:** No scope change — same end result, just applied earlier to prevent broken build.

## Issues Encountered

None.

## User Setup Required

None.

---
*Phase: 02-phase-clarity*
*Completed: 2026-03-18*
