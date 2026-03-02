# Roadmap: Imposter Game — UX Milestone

## Overview

This milestone delivers four targeted UX improvements to an already-functioning social deduction game. All changes are presentation-layer only — no server changes, no new libraries, no domain modifications. The work begins with a prerequisite architectural refactor (extracting duplicated inline logic into shared selectors), then addresses each of the four confirmed player blind spots in sequence from lowest to highest coupling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Selector Foundation** - Extract shared game-state logic into `gameSelectors.ts` before any visible UI changes
- [ ] **Phase 2: Phase Clarity** - Players see a human-readable phase label and contextual action guidance at all times
- [ ] **Phase 3: Vote Clarity** - Non-host players see a clear locked state; host sees a proper two-step vote interface
- [ ] **Phase 4: Word Discoverability** - Secret word is findable after the popup closes, with a closing cue that tells players where to look
- [ ] **Phase 5: End Game Clarity** - End screen shows personal win/loss result prominently, Spy reveal, and winner reason

## Phase Details

### Phase 1: Selector Foundation
**Goal**: Shared, tested pure functions in `gameSelectors.ts` cover all derived game-state questions needed by Phases 2-5
**Depends on**: Nothing (first phase)
**Requirements**: None (architectural prerequisite — enables safe implementation of Phase 5)
**Success Criteria** (what must be TRUE):
  1. `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`, `canViewerSeeWord`, and `isGameOver` are all exported from `gameSelectors.ts`
  2. `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx` import these functions from selectors instead of computing them inline
  3. No role-reveal logic exists inline in any presentation component — all role display is gated through `isGameOver()` from selectors
  4. Zero visible UI change after this phase — behavior is identical, logic is now in one place
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — TDD: add 5 selectors to gameSelectors.ts with unit tests (RED → GREEN)
- [x] 01-02-PLAN.md — Wire: replace inline logic in GameOverModal.tsx, GameEndRoleRevealModal.tsx, GameScreen.tsx with selector imports

### Phase 2: Phase Clarity
**Goal**: Players know exactly which phase the game is in without reading carefully
**Depends on**: Phase 1
**Requirements**: PHASE-01, PHASE-02
**Success Criteria** (what must be TRUE):
  1. At every game phase, a prominent human-readable phase label (not a raw enum string) is visible on screen
  2. A host player sees action guidance specific to their role for the current phase (e.g., "Choose a player to vote out" in VOTING)
  3. A non-host player sees action guidance specific to their role for the current phase (e.g., "Wait for the host to vote" in VOTING)
  4. Phase labels and guidance text are rendered through i18n `t()` — no hardcoded Vietnamese strings in JSX
**Plans**: 2 plans
Plans:
- [ ] 02-01-PLAN.md — Logic layer: phaseLabel map + phaseGuidanceKey function in phasePresentation.ts, unit tests, all 4 locale JSON files updated
- [ ] 02-02-PLAN.md — Presentation layer: ActionBoard.tsx wired to consume new functions with conditional badge + guidance rendering

### Phase 3: Vote Clarity
**Goal**: Vote rules are self-explanatory — non-host understands they cannot vote, host has a clear two-step interface
**Depends on**: Phase 2
**Requirements**: VOTE-01, VOTE-02
**Success Criteria** (what must be TRUE):
  1. During VOTING phase, a non-host player sees a locked player grid and a badge explaining that the host votes for the group — no error message, no bare loading spinner
  2. During VOTING phase, a host player sees a selectable player list and a disabled Submit button that activates only after selecting a target
  3. After the host submits a vote, the UI shows a loading/submitted state until the server confirms — the button does not re-enable immediately
**Plans**: TBD

### Phase 4: Word Discoverability
**Goal**: A player who missed or closed the Word Reveal popup can find their secret word again without confusion
**Depends on**: Phase 3
**Requirements**: WORD-01, WORD-02
**Success Criteria** (what must be TRUE):
  1. When the Word Reveal popup closes, it displays a closing cue (e.g., "Word saved to your card") before dismissing
  2. The player's secret word is visually emphasized on their ViewerCard immediately after the popup closes (one-time pulse or highlight)
  3. During DISCUSSION and VOTING phases, a button or icon is visible on screen that lets any player view their secret word inline — without re-triggering the popup
**Plans**: TBD

### Phase 5: End Game Clarity
**Goal**: Players understand who won, who the Spy was, and their personal result at a glance — without parsing a table
**Depends on**: Phase 1
**Requirements**: END-01, END-02, END-03
**Success Criteria** (what must be TRUE):
  1. The end screen prominently displays the game outcome ("Citizens Win" or "Spy Wins") as the primary visual element
  2. Each player's role (Spy / Citizen / White) is revealed on the end screen, styled with the appropriate role color
  3. A player viewing the end screen immediately sees their personal result (VICTORY or DEFEAT) above the player table — without scanning rows
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Selector Foundation | 2/2 | Complete | 2026-03-02 |
| 2. Phase Clarity | 0/2 | Ready to execute | - |
| 3. Vote Clarity | 0/TBD | Not started | - |
| 4. Word Discoverability | 0/TBD | Not started | - |
| 5. End Game Clarity | 0/TBD | Not started | - |
