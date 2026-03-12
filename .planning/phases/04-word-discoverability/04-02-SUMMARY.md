---
phase: 04-word-discoverability
plan: 02
subsystem: ui
tags: [react, tailwind, animation, i18n, word-discoverability]

# Dependency graph
requires:
  - phase: 04-01
    provides: CSS classes (arcade-eye-btn, arcade-mini-word-popup, arcade-viewer-word-block--pulse), i18n keys (game.peekWord, game.wordMasked), canViewerSeeWord selector
provides:
  - Eye icon button on ViewerCard gated by canSeeWord (DISCUSSION/VOTING phases only)
  - Mini word popup showing actual secret word on tap, auto-dismisses after 3s
  - Word masking ("***") during DISCUSSION/VOTING for screen-peek protection
  - Word block pulse animation triggered once after Word Reveal popup closes
  - canSeeWord and wordJustRevealed props threaded from GameScreen to ViewerCard
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tap-to-reveal: word masked by default, eye icon required to see actual word"
    - "Auto-dismiss timer via useRef + useEffect with cleanup to prevent stale state updates"
    - "Prop threading: GameScreen computes derived state (canSeeWord) and threads to child (ViewerCard)"

key-files:
  created: []
  modified:
    - apps/web/src/presentation/game/GameScreen.tsx
    - apps/web/src/presentation/game/ViewerCard.tsx

key-decisions:
  - "Word is masked ('***') in the word block when canSeeWord is true — tap eye icon to reveal actual word in mini popup"
  - "wordJustRevealed state lives in GameScreen (owns popup close callback) and is threaded down as prop"
  - "Mini popup uses isMiniWordOpen local state in ViewerCard — independent of GameScreen pulse logic"
  - "Pulse animation duration is 1500ms (setWordJustRevealed(false) timeout) matching CSS animation duration"

patterns-established:
  - "Tap-to-reveal pattern: mask sensitive data inline, provide icon button to show in ephemeral popup"
  - "Auto-dismiss timer: useRef stores timer ID, useEffect deps=[isMiniWordOpen] restarts on each open, cleanup prevents memory leaks"

requirements-completed: [WORD-01, WORD-02]

# Metrics
duration: 1min
completed: 2026-03-12
---

# Phase 4 Plan 02: Word Discoverability Wiring Summary

**Eye icon + tap-to-reveal mini popup on ViewerCard with word masking and pulse animation, wired via canSeeWord/wordJustRevealed props from GameScreen**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-12T03:34:10Z
- **Completed:** 2026-03-12T03:35:00Z
- **Tasks:** 1 (+ 1 checkpoint awaiting human verify)
- **Files modified:** 2

## Accomplishments
- ViewerCard now masks the secret word with "***" during DISCUSSION/VOTING phases (screen-peek protection)
- Eye icon button appears on word block only when `canSeeWord` is true, opens mini popup with actual word
- Mini popup auto-dismisses after 3 seconds; toggling again while open closes it immediately
- Word block pulses with yellow glow once after Word Reveal popup closes (1.5s animation)
- GameScreen computes `canSeeWord` via `canViewerSeeWord` selector and threads `canSeeWord` + `wordJustRevealed` to ViewerCard

## Task Commits

Each task was committed atomically:

1. **Task 1: Thread new props through GameScreen and wire ViewerCard** - `2f7ebe3` (feat)

**Plan metadata:** (pending — awaiting checkpoint verification)

## Files Created/Modified
- `apps/web/src/presentation/game/GameScreen.tsx` - Added wordJustRevealed state, pulseTimerRef, handleCloseWordPopup wrapper, canSeeWord computation, updated ViewerCard props
- `apps/web/src/presentation/game/ViewerCard.tsx` - Added canSeeWord/wordJustRevealed props, isMiniWordOpen state, auto-dismiss effect, toggleMiniWord, displayWord masking, eye icon button, mini popup, pulse class

## Decisions Made
- Word is masked ("***") in the word block when canSeeWord is true — tapping eye icon reveals actual word in mini popup only
- `wordJustRevealed` state lives in GameScreen (owns the popup close callback) and is threaded as prop
- Mini popup local state `isMiniWordOpen` is independent of GameScreen pulse logic
- Pulse animation timeout is 1500ms to match CSS keyframe duration

## Deviations from Plan

None - plan executed exactly as written. Both files were already updated as the implementation was previously committed at `2f7ebe3`.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 word discoverability feature is fully implemented
- Awaiting human verification of the complete UX flow (Task 2 checkpoint)
- No blockers — TypeScript compiles clean

---
*Phase: 04-word-discoverability*
*Completed: 2026-03-12*
