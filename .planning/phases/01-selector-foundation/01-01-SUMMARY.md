---
phase: 01-selector-foundation
plan: 01
subsystem: ui
tags: [vitest, typescript, game-selectors, domain, tdd]

# Dependency graph
requires: []
provides:
  - "Pure selector functions: didPlayerWin, getRoleLabel, getRoleColorClass, isGameOver, canViewerSeeWord"
  - "Extended gameSelectors.ts with 8 total exports (getViewer, isHost, alivePlayers + 5 new)"
  - "Full unit test coverage for all 5 new selectors across all branches"
affects:
  - 02-phase-clarity
  - 03-vote-clarity
  - presentation layer components using role/game-over derived state

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD: write failing tests first, then implement to green"
    - "Domain selectors: pure functions in domain/utils, no React/i18n/framework imports"
    - "All game-state derivation centralised in gameSelectors.ts — no duplication in presentation"

key-files:
  created:
    - apps/web/src/domain/__tests__/gameSelectors.test.ts
  modified:
    - apps/web/src/domain/utils/gameSelectors.ts

key-decisions:
  - "getRoleLabel returns plain string constants, not t() calls — components call t() themselves"
  - "getRoleColorClass uses existing Tailwind classes (text-blue-400, text-red-400, text-neutral-400) confirmed already used in GameEndRoleRevealModal.tsx"
  - "canViewerSeeWord delegates game-over check to isGameOver() to avoid duplication"

patterns-established:
  - "Selector pattern: export const selectorName = (args): ReturnType => expression — pure arrow functions"
  - "Test pattern: makePlayer/makeGameState factory helpers with Partial<T> overrides for concise test setup"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-03-02
---

# Phase 1 Plan 01: Selector Foundation Summary

**Five pure game-state selectors added to gameSelectors.ts via TDD — didPlayerWin, getRoleLabel, getRoleColorClass, isGameOver, canViewerSeeWord — all 25 tests green with no React/i18n imports**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-02T08:09:41Z
- **Completed:** 2026-03-02T08:17:00Z
- **Tasks:** 2 (RED + GREEN TDD phases)
- **Files modified:** 2

## Accomplishments
- Created `gameSelectors.test.ts` with 25 tests covering all branches for all 5 new selectors
- Extended `gameSelectors.ts` with 5 new pure selector functions (file grew from 10 to 43 lines)
- All 40 tests across the entire web test suite pass with zero failures
- No React, no useTranslation, no t() calls — domain layer stays pure

## Task Commits

Each task was committed atomically:

1. **RED: Failing tests for five selectors** - `d1922d3` (test)
2. **GREEN: Implement five selectors** - `15ce67c` (feat)

_Note: TDD plan — two commits (test -> feat), no refactor needed._

## Files Created/Modified
- `apps/web/src/domain/__tests__/gameSelectors.test.ts` - 25 unit tests for all 5 new selectors, using makePlayer/makeGameState factory helpers
- `apps/web/src/domain/utils/gameSelectors.ts` - Extended with didPlayerWin, getRoleLabel, getRoleColorClass, isGameOver, canViewerSeeWord (import expanded to include Role, Winner, Phase)

## Decisions Made
- `getRoleLabel` returns plain string constants (`'CITIZEN'`, `'SPY'`, `'WHITE ROLE'`, `'UNKNOWN'`) — NOT `t()` calls; the plan explicitly requires components call `t()` themselves to keep the domain layer i18n-free
- `getRoleColorClass` uses Tailwind string classes (`text-blue-400`, `text-red-400`, `text-neutral-400`) — confirmed acceptable because these classes already appear in `GameEndRoleRevealModal.tsx` and are part of the project's Tailwind token system via `appColor`
- `canViewerSeeWord` checks `viewer.word` as truthy (null/undefined both return false) and delegates to `isGameOver()` internally, avoiding duplication

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 selectors are exported and tested — Phase 2 (phase-clarity) and Phase 3 (vote-clarity) can import directly from `gameSelectors.ts`
- The `isGameOver` and `didPlayerWin` selectors are the primary enablers for GameOverModal and ViewerCard simplification in later phases
- No blockers

## Self-Check: PASSED

- FOUND: apps/web/src/domain/__tests__/gameSelectors.test.ts
- FOUND: apps/web/src/domain/utils/gameSelectors.ts
- FOUND: .planning/phases/01-selector-foundation/01-01-SUMMARY.md
- FOUND: commit d1922d3 (test: RED phase)
- FOUND: commit 15ce67c (feat: GREEN phase)
- All 40 tests pass, zero failures

---
*Phase: 01-selector-foundation*
*Completed: 2026-03-02*
