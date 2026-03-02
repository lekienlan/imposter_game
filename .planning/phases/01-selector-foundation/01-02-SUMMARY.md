---
phase: 01-selector-foundation
plan: 02
subsystem: ui
tags: [refactor, typescript, game-selectors, presentation, domain]

# Dependency graph
requires:
  - "01-01 (gameSelectors.ts with didPlayerWin, getRoleLabel, getRoleColorClass, isGameOver)"
provides:
  - "Cleaned GameOverModal.tsx — inline functions removed, selector imports added"
  - "Cleaned GameEndRoleRevealModal.tsx — inline functions removed, selector imports added"
  - "Cleaned GameScreen.tsx — inline isGameOver expression removed, selector import added"
  - "Single source of truth for all five derived-state computations across presentation layer"
affects:
  - 02-phase-clarity
  - 03-vote-clarity
  - presentation layer components using role/game-over derived state

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Import selector from domain/utils/gameSelectors instead of defining inline in component"
    - "Rename local variable to gameIsOver to avoid shadowing imported function name isGameOver"

key-files:
  created: []
  modified:
    - apps/web/src/presentation/game-over/GameOverModal.tsx
    - apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx
    - apps/web/src/presentation/game/GameScreen.tsx

key-decisions:
  - "Renamed local variable to gameIsOver (not isGameOver) in GameScreen.tsx to avoid shadowing the imported selector function — cleaner scoping"
  - "Winner kept in GameOverModal.tsx @imposter/shared import because getWinnerTitle and getWinnerColor still reference Winner enum"
  - "ActionBoard.tsx has a pre-existing gameState.phase === Phase.GAME_ENDED usage — left untouched as it is out of scope for this plan"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-03-02
---

# Phase 1 Plan 02: Inline Selector Replacement Summary

**Three presentation components cleaned by replacing inline duplicate functions with imports from gameSelectors.ts — zero UI change, single authoritative source of truth established for all five derived-state computations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-02T08:13:27Z
- **Completed:** 2026-03-02T08:17:30Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Removed 38 lines of duplicate logic from `GameOverModal.tsx` (inline `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`)
- Removed 38 lines of duplicate logic from `GameEndRoleRevealModal.tsx` (same three inline functions)
- Removed inline `const isGameOver = gameState.phase === Phase.GAME_ENDED` from `GameScreen.tsx`
- All three components now import from `domain/utils/gameSelectors` — single source of truth enforced
- All 40 tests pass, TypeScript compiles cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Replace inline functions in GameOverModal** - `1cde39c` (refactor)
2. **Replace inline functions in GameEndRoleRevealModal** - `b1a26f9` (refactor)
3. **Replace inline isGameOver in GameScreen + full test suite** - `b01ca88` (refactor)

## Files Created/Modified

- `apps/web/src/presentation/game-over/GameOverModal.tsx` — Removed 38 lines of inline logic; added import for `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`; updated `didPlayerWin(player)` call to `didPlayerWin(player, gameState.winner)`; removed `Role` from shared import (Winner retained for `getWinnerTitle`/`getWinnerColor`)
- `apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx` — Removed 38 lines of inline logic; added same three selector imports; updated `viewerWon` computation to pass `gameState.winner`; removed `Role` and `Winner` from shared import
- `apps/web/src/presentation/game/GameScreen.tsx` — Added `isGameOver` to existing selector import; removed `Phase` from shared import; replaced inline expression with `const gameIsOver = isGameOver(gameState)`; updated `ViewerCard` prop to use `gameIsOver`

## Decisions Made

- `Winner` retained in `GameOverModal.tsx`'s `@imposter/shared` import because `getWinnerTitle()` and `getWinnerColor()` still switch on `Winner.CITIZENS` and `Winner.SPIES` — only `Role` was removed
- Local variable renamed to `gameIsOver` in `GameScreen.tsx` to avoid shadowing the imported `isGameOver` function name — this is cleaner than using the same identifier for both the function and the result
- `ActionBoard.tsx` has a pre-existing `gameState.phase === Phase.GAME_ENDED` check — left untouched as it was not in scope for this plan; tracked as a future cleanup candidate

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - pure refactor, no external service configuration required.

## Next Phase Readiness
- Phase 1 complete — all five selectors are the single authoritative source of truth
- Presentation layer is clean: no inline duplicates of `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`, or `isGameOver` in the three target files
- Phase 2 (phase-clarity) and Phase 3 (vote-clarity) can proceed without risk of logic divergence
- Remaining out-of-scope pre-existing usage in `ActionBoard.tsx` is a minor cleanup candidate for a future plan

## Self-Check: PASSED

- FOUND: apps/web/src/presentation/game-over/GameOverModal.tsx (no inline functions)
- FOUND: apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx (no inline functions)
- FOUND: apps/web/src/presentation/game/GameScreen.tsx (no inline isGameOver)
- FOUND: commit 1cde39c (Task 1)
- FOUND: commit b1a26f9 (Task 2)
- FOUND: commit b01ca88 (Task 3)
- All 40 tests pass, zero failures
- TypeScript compiles cleanly

---
*Phase: 01-selector-foundation*
*Completed: 2026-03-02*
