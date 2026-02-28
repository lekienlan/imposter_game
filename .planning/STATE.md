# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.
**Current focus:** Phase 1 — Selector Foundation

## Current Position

Phase: 1 of 5 (Selector Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-02-28 — Roadmap created, ready to begin Phase 1 planning

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: All four UX improvements are presentation-layer only — no server changes required
- [Init]: Phase 1 selector extraction is a prerequisite before any visible UI work — prevents logic divergence in modal files
- [Init]: Word discoverability must use inline display path in ViewerCard, NOT re-triggering the popup (avoids double-trigger bug via shownWordMarkerRef)

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Audit `GameScreen.tsx` → `ViewerCard.tsx` prop chain before implementing; verify `onCloseWordPopup` callback and `wordJustClosed` prop threading before coding
- [Phase 2]: Audit `phasePresentation.ts` for hardcoded strings — must be wrapped in `t()` if promoted to primary phase header
- [General]: Verify `App.tsx` line count before Phase 1 — if over 200 lines, extract `useGameUIState` hook first

## Session Continuity

Last session: 2026-02-28
Stopped at: Roadmap created — all 5 phases defined, 9/9 v1 requirements mapped
Resume file: None
