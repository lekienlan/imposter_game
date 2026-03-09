---
phase: 03-vote-clarity
plan: "01"
subsystem: ui
tags: [i18n, css, vote-card, non-host-badge, design-tokens]

# Dependency graph
requires:
  - phase: 02-phase-clarity
    provides: i18n locale file structure and uxEnhancements.css foundation
provides:
  - game.hostVotingForGroup i18n key in all 4 locales (en, vi, ko, zh)
  - game.voteFor i18n key in all 4 locales
  - arcade-vote-card CSS class family (base, hover, selected, eliminated, disabled)
  - arcade-non-host-badge CSS class family (container, icon, text)
  - arcade-vote-card-grid responsive grid container
affects: [03-02-vote-panel-rewrite]

# Tech tracking
tech-stack:
  added: []
  patterns: [color-mix-css-for-tinted-backgrounds, bem-like-css-naming-for-vote-components]

key-files:
  created: []
  modified:
    - apps/web/src/presentation/locales/en.json
    - apps/web/src/presentation/locales/vi.json
    - apps/web/src/presentation/locales/ko.json
    - apps/web/src/presentation/locales/zh.json
    - apps/web/src/presentation/styles/uxEnhancements.css

key-decisions:
  - "Inserted i18n keys after waitingForHostVote for logical grouping with vote-related keys"
  - "Used BEM-like naming (arcade-vote-card--selected, arcade-non-host-badge__icon) consistent with existing CSS conventions"

patterns-established:
  - "Vote card CSS uses color-mix() with surface-primary and blue/yellow tokens for tinted backgrounds"
  - "Non-host badge uses flex column layout for icon + text stacking"

requirements-completed: [VOTE-01, VOTE-02]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 3 Plan 01: i18n Keys and CSS Classes for Vote Clarity

**Added hostVotingForGroup/voteFor i18n keys to 4 locales and 6 vote card + non-host badge CSS classes to uxEnhancements.css**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T09:06:23Z
- **Completed:** 2026-03-09T09:07:55Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added game.hostVotingForGroup and game.voteFor i18n keys to en, vi, ko, zh locale files
- Added 6 CSS class definitions for vote cards (grid, base, hover, selected, eliminated, disabled)
- Added 3 CSS class definitions for non-host badge (container, icon, text)
- All string and style contracts ready for Plan 02 VotingPanel rewrite

## Task Commits

Each task was committed atomically:

1. **Task 1: Add i18n keys to all 4 locale files** - `e8a73ae` (feat)
2. **Task 2: Add vote card and non-host badge CSS classes** - `4812621` (feat)

## Files Created/Modified
- `apps/web/src/presentation/locales/en.json` - Added hostVotingForGroup and voteFor keys
- `apps/web/src/presentation/locales/vi.json` - Added Vietnamese translations
- `apps/web/src/presentation/locales/ko.json` - Added Korean translations
- `apps/web/src/presentation/locales/zh.json` - Added Chinese translations
- `apps/web/src/presentation/styles/uxEnhancements.css` - Added Phase 3 vote card and non-host badge CSS block (75 lines)

## Decisions Made
- Inserted i18n keys after waitingForHostVote for logical grouping with vote-related keys
- Used BEM-like naming (arcade-vote-card--selected, arcade-non-host-badge__icon) consistent with existing CSS conventions in uxEnhancements.css

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All i18n keys and CSS classes are defined and ready for Plan 02's VotingPanel component rewrite
- CSS classes follow existing design token variable conventions
- uxEnhancements.css is at 172 lines (well under 300 limit)

## Self-Check: PASSED

All 5 modified files exist. Both task commits (e8a73ae, 4812621) verified in git log.

---
*Phase: 03-vote-clarity*
*Completed: 2026-03-09*
