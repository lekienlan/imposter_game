---
phase: 02-phase-clarity
plan: 01
subsystem: ui
tags: [react, i18n, i18next, typescript, vitest, tdd]

# Dependency graph
requires:
  - phase: 01-selector-foundation
    provides: selector pattern established for domain/presentation separation
provides:
  - phaseLabel map (Phase -> i18n key string) exported from phasePresentation.ts
  - phaseGuidanceKey(phase, isHost) function returning role-differentiated i18n keys
  - phase.label.* and phase.guidance.host/player.* keys in all 4 locale JSON files (vi/en/ko/zh)
  - 27 unit tests covering all 11 Phase values for both exports
affects: [02-02-action-board, any future component consuming phase display strings]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "phaseLabel is a Record<Phase, string> map returning dot-notation i18n key strings"
    - "phaseGuidanceKey(phase, isHost) composes role + slot into a key string — components call t() themselves"
    - "phasePresentation.ts is the single source of truth for phase-to-i18n-key mapping"

key-files:
  created:
    - apps/web/src/domain/__tests__/phasePresentation.test.ts
  modified:
    - apps/web/src/presentation/shared/phasePresentation.ts
    - apps/web/src/presentation/locales/vi.json
    - apps/web/src/presentation/locales/en.json
    - apps/web/src/presentation/locales/ko.json
    - apps/web/src/presentation/locales/zh.json
    - apps/web/src/presentation/game/ActionBoard.tsx

key-decisions:
  - "phaseLabel and phaseGuidanceKey return i18n key strings (not translated text) — components call t() themselves to keep domain/presentation layers i18n-free"
  - "phaseGuidanceSlot is an internal Record<Phase, string> map; phaseGuidanceKey composes it with role prefix — avoids duplicating the slot map for host/player"
  - "ActionBoard.tsx updated in this plan (not Plan 02) to fix broken phaseGuide import — Rule 3 auto-fix"

patterns-established:
  - "Phase i18n keys follow dot-notation: phase.label.{slot} and phase.guidance.{host|player}.{slot}"
  - "Slot names: waiting, wordReveal, description, discussion, voting, result, ended"

requirements-completed: [PHASE-01, PHASE-02]

# Metrics
duration: 3min
completed: 2026-03-02
---

# Phase 2 Plan 01: Phase Label and Guidance Key Mapping Summary

**phaseLabel map and phaseGuidanceKey function replace hardcoded English phaseGuide with i18n key strings, backed by translations in all four locale JSON files**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T08:30:29Z
- **Completed:** 2026-03-02T08:33:10Z
- **Tasks:** 3 (RED, GREEN, Locale JSON)
- **Files modified:** 6

## Accomplishments

- Deleted `phaseGuide` export (56 lines of hardcoded English strings) from `phasePresentation.ts`
- Added `phaseLabel: Record<Phase, string>` mapping all 11 Phase values to i18n key strings
- Added `phaseGuidanceKey(phase: Phase, isHost: boolean): string` returning role-differentiated i18n keys
- Added `phase.label.*` and `phase.guidance.host.*/player.*` to vi.json, en.json, ko.json, zh.json — exact translations per plan spec
- 27 unit tests pass covering all Phase values, both host and player roles

## Task Commits

Each task was committed atomically:

1. **RED — Failing test file** - `a3e575d` (test)
2. **GREEN — phaseLabel + phaseGuidanceKey implementation** - `ecc354a` (feat)
3. **Locale JSON + ActionBoard auto-fix** - `6b87428` (feat)

_TDD plan: test commit (RED) → implementation commit (GREEN) → locale + fix commit_

## Files Created/Modified

- `apps/web/src/domain/__tests__/phasePresentation.test.ts` - 27 unit tests for phaseLabel and phaseGuidanceKey
- `apps/web/src/presentation/shared/phasePresentation.ts` - Replaced phaseGuide with phaseLabel map and phaseGuidanceKey function
- `apps/web/src/presentation/locales/vi.json` - Added phase.label.* and phase.guidance.host/player.* (Vietnamese)
- `apps/web/src/presentation/locales/en.json` - Added phase.label.* and phase.guidance.host/player.* (English)
- `apps/web/src/presentation/locales/ko.json` - Added phase.label.* and phase.guidance.host/player.* (Korean)
- `apps/web/src/presentation/locales/zh.json` - Added phase.label.* and phase.guidance.host/player.* (Chinese)
- `apps/web/src/presentation/game/ActionBoard.tsx` - Updated to use phaseGuidanceKey and phaseLabel (auto-fix)

## Decisions Made

- `phaseGuidanceKey` returns a key string like `phase.guidance.host.voting` — NOT translated text. Components call `t()` themselves. This maintains the domain layer as i18n-free.
- Internal `phaseGuidanceSlot` Record avoids duplicating the slot map for host/player variants; the function simply prepends `host` or `player`.
- `ActionBoard.tsx` was updated in this plan as a Rule 3 auto-fix (broken import) rather than waiting for Plan 02.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated ActionBoard.tsx to remove broken phaseGuide import**
- **Found during:** Locale JSON phase (after GREEN commit)
- **Issue:** `ActionBoard.tsx` imported `phaseGuide` which was deleted from `phasePresentation.ts`; this would break the build
- **Fix:** Replaced `phaseGuide` import with `phaseGuidanceKey` and `phaseLabel`; replaced `guide.title`/`guide.description`/`guide.tip` renders with `t(labelKey)` and `t(guidanceKey)`
- **Files modified:** `apps/web/src/presentation/game/ActionBoard.tsx`
- **Verification:** All 67 tests pass; ActionBoard renders i18n text via t() instead of hardcoded English
- **Committed in:** `6b87428` (combined with locale JSON commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking import)
**Impact on plan:** ActionBoard fix was necessary to prevent broken build; aligns with Plan 02 intent. No scope creep.

## Issues Encountered

None — plan executed cleanly with one blocking auto-fix for ActionBoard.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `phaseLabel` and `phaseGuidanceKey` are exported and ready for Plan 02 (ActionBoard enhancement)
- All 4 locale files have the required key structure
- ActionBoard already updated to consume new exports — Plan 02 can focus on layout/UX improvements
- No blockers

---
*Phase: 02-phase-clarity*
*Completed: 2026-03-02*
