---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-12T03:35:00.000Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 6
  completed_plans: 6
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-28)

**Core value:** Người chơi nhìn vào màn hình là biết ngay mình đang ở phase nào, phải làm gì, và kết quả là gì — không cần hỏi.
**Current focus:** Phase 4 — Word Discoverability

## Current Position

Phase: 4 of 4 (Word Discoverability)
Plan: 2 of 2 in current phase — COMPLETE
Status: Phase 4 Plan 02 complete — eye icon + mini word popup + word masking + pulse animation in ViewerCard
Last activity: 2026-03-12 — Phase 4 Plan 02 complete: tap-to-reveal eye icon, mini popup (3s auto-dismiss), word masking ("***"), word block pulse

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 4 min
- Total execution time: 0.37 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-selector-foundation | 2 | 12 min | 6 min |
| 02-phase-clarity | 1 | 3 min | 3 min |
| 03-vote-clarity | 1 | 2 min | 2 min |
| 04-word-discoverability | 2 | 3 min | 1.5 min |

**Recent Trend:**
- Last 5 plans: 4 min, 3 min, 2 min, 2 min
- Trend: improving

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
- [02-01]: phaseLabel and phaseGuidanceKey return i18n key strings (not translated text) — components call t() themselves to keep domain layer i18n-free
- [02-01]: phaseGuidanceSlot is an internal Record<Phase, string>; phaseGuidanceKey composes it with role prefix — avoids duplicating slot map for host/player
- [02-01]: ActionBoard.tsx updated to use new exports in this plan as Rule 3 auto-fix (broken phaseGuide import)
- [03-01]: Inserted i18n keys after waitingForHostVote for logical grouping with vote-related keys
- [03-01]: Used BEM-like naming (arcade-vote-card--selected, arcade-non-host-badge__icon) consistent with existing CSS conventions
- [04-01]: Closing cue uses 1.2s timeout before onClose for visual feedback
- [04-01]: closingTimerRef cleanup on unmount prevents state updates on unmounted component
- [04-02]: Word is masked ("***") in word block when canSeeWord is true — tap eye icon to reveal actual word in mini popup
- [04-02]: wordJustRevealed state lives in GameScreen (owns popup close callback) and is threaded as prop to ViewerCard
- [04-02]: Mini popup local state isMiniWordOpen is independent of GameScreen pulse logic
- [04-02]: Pulse animation timeout is 1500ms to match CSS keyframe duration

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Prop chain audit complete — RESOLVED in 04-02
- [Phase 2]: phasePresentation.ts hardcoded strings resolved — phaseLabel/phaseGuidanceKey now return i18n keys (RESOLVED in 02-01)
- [General]: Verify `App.tsx` line count before Phase 1 — if over 200 lines, extract `useGameUIState` hook first (RESOLVED — was within limits)

## Session Continuity

Last session: 2026-03-12
Stopped at: Completed 04-02-PLAN.md — eye icon + mini word popup + word masking + pulse animation wired in ViewerCard (awaiting human verify checkpoint)
Resume file: None
