# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.
**Current focus:** Phase 2 — Phase Clarity

## Current Position

Phase: 2 of 5 (Phase Clarity)
Plan: 0 of 2 in current phase
Status: Phase 1 complete — Phase 2 ready to execute
Last activity: 2026-03-02 — Phase 1 Plan 02 complete: inline selector duplicates removed from three presentation components

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 6 min
- Total execution time: 0.20 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-selector-foundation | 2 | 12 min | 6 min |

**Recent Trend:**
- Last 5 plans: 8 min, 4 min
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: All four UX improvements are presentation-layer only — no server changes required
- [Init]: Phase 1 selector extraction is a prerequisite before any visible UI work — prevents logic divergence in modal files
- [Init]: Word discoverability must use inline display path in ViewerCard, NOT re-triggering the popup (avoids double-trigger bug via shownWordMarkerRef)
- [01-01]: getRoleLabel returns plain string constants, not t() calls — components call t() themselves to keep domain i18n-free
- [01-01]: getRoleColorClass uses Tailwind text-* classes (confirmed via GameEndRoleRevealModal.tsx usage) — token system covers these
- [01-01]: canViewerSeeWord delegates to isGameOver() internally to avoid duplicating Phase.GAME_ENDED check
- [01-02]: Renamed local variable to gameIsOver (not isGameOver) in GameScreen.tsx to avoid shadowing imported selector function
- [01-02]: Winner kept in GameOverModal.tsx import — still needed for getWinnerTitle/getWinnerColor switch statements
- [01-02]: ActionBoard.tsx has pre-existing Phase.GAME_ENDED usage — left untouched as out of scope for this plan

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Audit `GameScreen.tsx` → `ViewerCard.tsx` prop chain before implementing; verify `onCloseWordPopup` callback and `wordJustClosed` prop threading before coding
- [Phase 2]: Audit `phasePresentation.ts` for hardcoded strings — must be wrapped in `t()` if promoted to primary phase header
- [General]: Verify `App.tsx` line count before Phase 1 — if over 200 lines, extract `useGameUIState` hook first

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 01-02-PLAN.md — inline selector duplicates removed from GameOverModal, GameEndRoleRevealModal, GameScreen; Phase 1 complete
Resume file: None
