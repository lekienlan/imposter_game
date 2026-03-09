---
phase: 04-word-discoverability
plan: 01
subsystem: ui
tags: [i18n, css, react, animation, word-reveal]

# Dependency graph
requires:
  - phase: 01-selector-foundation
    provides: domain selectors for viewer state
provides:
  - closingCue i18n keys in 4 locales (en/vi/ko/zh)
  - peekWord and wordMasked i18n keys in 4 locales
  - CSS classes for word-pulse, eye-btn, mini-word-popup, closing-cue
  - WordRevealPopup closing cue behavior with cleanup
affects: [04-word-discoverability]

# Tech tracking
tech-stack:
  added: []
  patterns: [closing-cue-delayed-dismiss, timer-ref-cleanup]

key-files:
  created: []
  modified:
    - apps/web/src/presentation/word-reveal/WordRevealPopup.tsx
    - apps/web/src/presentation/styles/components.css
    - apps/web/src/presentation/locales/en.json
    - apps/web/src/presentation/locales/vi.json
    - apps/web/src/presentation/locales/ko.json
    - apps/web/src/presentation/locales/zh.json

key-decisions:
  - "Closing cue uses 1.2s timeout before onClose to give visual feedback"
  - "closingTimerRef cleanup on unmount prevents state updates on unmounted component"

patterns-established:
  - "Timer-ref-cleanup: useRef + useEffect cleanup for delayed dismissals"

requirements-completed: [WORD-01]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 04 Plan 01: Word Discoverability Foundation Summary

**Closing cue on WordRevealPopup with i18n keys (4 locales) and CSS classes for pulse animation, eye icon, and mini word popup**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T09:24:17Z
- **Completed:** 2026-03-09T09:26:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added closingCue, peekWord, wordMasked i18n keys across all 4 locales (en, vi, ko, zh)
- Added CSS classes for word-pulse animation, eye icon button, mini word popup, and closing cue text
- WordRevealPopup now shows "Word saved to your card" closing cue for 1.2s before dismissing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add i18n keys and CSS classes for word discoverability** - `959dca4` (feat)
2. **Task 2: Add closing cue to WordRevealPopup** - `2c56705` (feat)

## Files Created/Modified
- `apps/web/src/presentation/locales/en.json` - Added closingCue, peekWord, wordMasked keys
- `apps/web/src/presentation/locales/vi.json` - Added closingCue, peekWord, wordMasked keys (Vietnamese)
- `apps/web/src/presentation/locales/ko.json` - Added closingCue, peekWord, wordMasked keys (Korean)
- `apps/web/src/presentation/locales/zh.json` - Added closingCue, peekWord, wordMasked keys (Chinese)
- `apps/web/src/presentation/styles/components.css` - Added word-pulse, eye-btn, mini-popup, closing-cue CSS; position:relative on word-block
- `apps/web/src/presentation/word-reveal/WordRevealPopup.tsx` - Added isClosing state, closingTimerRef, handleReady with delayed dismiss

## Decisions Made
- Closing cue uses 1.2s timeout before calling onClose for visual feedback
- closingTimerRef with useEffect cleanup prevents state updates on unmounted component
- Vietnamese diacritics used for vi.json translations (matching existing style)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All i18n keys and CSS classes ready for Plan 02 to wire eye icon and mini popup into ViewerCard
- WordRevealPopup closing cue complete and functional

---
*Phase: 04-word-discoverability*
*Completed: 2026-03-09*
