---
phase: 05-end-game-clarity
plan: 01
subsystem: presentation
tags: [game-over, i18n, css, modal, animation]
dependency_graph:
  requires: []
  provides: [youLabel-i18n, continue-i18n, row-css-classes, role-reveal-fade-out, GameEndRoleRevealModal-restructured]
  affects: [GameEndRoleRevealModal, uxEnhancements.css, locale-files]
tech_stack:
  added: []
  patterns: [useState, useEffect, useCallback, fade-out-transition, auto-advance-timer]
key_files:
  created: []
  modified:
    - apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx
    - apps/web/src/presentation/styles/uxEnhancements.css
    - apps/web/src/presentation/locales/en.json
    - apps/web/src/presentation/locales/vi.json
    - apps/web/src/presentation/locales/ko.json
    - apps/web/src/presentation/locales/zh.json
decisions:
  - "VICTORY/DEFEAT blinking text is shown first in step 1, role reveal second — matches locked plan decision"
  - "handleAdvance wrapped in useCallback so useEffect dependency array is stable and avoids infinite re-runs"
  - "Auto-advance timer (4000ms) and fade-out (200ms) both use clearTimeout cleanup to prevent state updates on unmount"
  - "Continue button calls handleAdvance (not onClose directly) so it also gets the 200ms fade effect"
  - "role-reveal-status-wrap section removed — VICTORY/DEFEAT now lives in the game-over-header block"
metrics:
  duration: 1 min
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 6
---

# Phase 05 Plan 01: Step 1 Restructure and Foundation Assets Summary

**One-liner:** Restructured GameEndRoleRevealModal to show VICTORY/DEFEAT first with blinking text, 4s auto-advance timer with 200ms fade-out, plus all i18n keys and CSS row-highlight classes needed by Plan 02.

## Tasks Completed

| Task | Name | Files |
|------|------|-------|
| 1 | Add i18n keys and CSS classes for end-game clarity | en.json, vi.json, ko.json, zh.json, uxEnhancements.css |
| 2 | Restructure GameEndRoleRevealModal — VICTORY/DEFEAT first, auto-advance, fade-out | GameEndRoleRevealModal.tsx |

## What Was Built

### Task 1: i18n Keys and CSS Classes

Added to all 4 locale files under the `game` namespace:
- `youLabel` — viewer's own row label with `{{name}}` interpolation (EN/VI/KO/ZH)
- `continue` — properly localized continue button text (EN/VI/KO/ZH)

Added to `uxEnhancements.css` under `/* Phase 5: End Game Clarity */`:
- `.row-viewer` — yellow left border + yellow-tinted background for viewer's own row
- `.row-spy` — red left border + red-tinted background for spy rows
- `.row-white` — neutral left border + neutral-tinted background for white-role rows
- `.role-reveal-fade-out` — `opacity: 0; transition: opacity 200ms ease` applied to backdrop before `onClose` fires

### Task 2: GameEndRoleRevealModal Restructure

Restructured from 56 lines to 75 lines. Key changes:
- Added `useState(false)` for `isFadingOut`
- Added `handleAdvance` callback: sets fade, then calls `onClose()` after 200ms
- Added `useEffect` auto-advance timer: fires `handleAdvance` after 4000ms, with cleanup
- Content reordered: VICTORY/DEFEAT `blinking-text` span appears ABOVE role label and role name
- Removed `role-reveal-status-wrap` section (content moved to header)
- Backdrop div now applies `role-reveal-fade-out` class when `isFadingOut` is true
- Continue button calls `handleAdvance` instead of `onClose` directly

## Verification

1. TypeScript: `npx tsc --noEmit --project apps/web/tsconfig.json` — passes with no errors
2. All 4 locale files contain `youLabel` and `continue` keys — verified with grep
3. `uxEnhancements.css` contains `.row-viewer`, `.row-spy`, `.row-white`, `.role-reveal-fade-out` — verified
4. Content order: VICTORY/DEFEAT first (line 48), role label (line 53), role value (line 54)
5. Auto-advance timer at 4000ms, fade-out at 200ms, both with clearTimeout cleanup

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- GameEndRoleRevealModal.tsx: 75 lines (under 300-line limit)
- uxEnhancements.css: 196 lines (under 300-line limit)
- All locale files updated
- TypeScript compilation clean
