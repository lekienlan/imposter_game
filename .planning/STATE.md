# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.
**Current focus:** Phase 1 — Selector Foundation

## Current Position

Phase: 1 of 5 (Selector Foundation)
Plan: 1 of 1 in current phase
Status: Phase 1 complete — ready for Phase 2
Last activity: 2026-03-02 — Phase 1 Plan 01 complete: five game-state selectors added via TDD

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 8 min
- Total execution time: 0.13 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-selector-foundation | 1 | 8 min | 8 min |

**Recent Trend:**
- Last 5 plans: 8 min
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

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Audit `GameScreen.tsx` → `ViewerCard.tsx` prop chain before implementing; verify `onCloseWordPopup` callback and `wordJustClosed` prop threading before coding
- [Phase 2]: Audit `phasePresentation.ts` for hardcoded strings — must be wrapped in `t()` if promoted to primary phase header
- [General]: Verify `App.tsx` line count before Phase 1 — if over 200 lines, extract `useGameUIState` hook first

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 01-01-PLAN.md — five selectors added via TDD, all 25 tests green
Resume file: None
