# Project Research Summary

**Project:** Imposter Game — Social Deduction Game UX Clarity Milestone
**Domain:** In-game state self-explanation for a real-time social deduction game (React + Socket.IO)
**Researched:** 2026-02-28
**Confidence:** HIGH (stack/architecture/pitfalls from direct codebase analysis); MEDIUM (feature genre conventions)

## Executive Summary

This milestone is a targeted UX improvement pass on an already-functioning social deduction game, not a greenfield build. Four confirmed blind spots prevent players from understanding what is happening at a glance: the phase indicator shows a raw internal enum string rather than a human-readable label; non-host players during voting receive a bare wait message that looks like a bug rather than a game rule; the secret word's persistent location is not discoverable after the initial popup closes; and the end-game screen requires parsing a table to determine personal win/loss outcome. All four problems share the same root cause — the codebase has the correct data and display primitives already in place, but they are not assembled into self-explanatory UI.

The recommended approach is surgical: all four improvements are purely presentation-layer changes. No server changes, no new libraries, no domain layer modifications are required. The existing `phaseGuide` map, `phaseTone` color tokens, `gameSelectors.ts` pure functions, and unused pixel-retroui components (`ProgressBar`, `Bubble`) already provide every building block. The work is wiring existing pieces together more clearly, not engineering new systems. This keeps scope narrow, risk minimal, and allows delivery in a single well-scoped sprint.

The primary risk is architectural drift: each improvement tempts the developer to take shortcuts — inlining game-rule logic in JSX, displaying raw enum values, appending code to already-large files, hard-coding colors. These shortcuts are individually small and fast, but collectively degrade maintainability and introduce bugs (role leaks, vote state desync, word popup double-triggers). Pitfall prevention is the discipline this milestone requires most.

---

## Key Findings

### Recommended Stack

No new dependencies are needed. The existing React 19 + Tailwind 3.4 + pixel-retroui 2.1.0 stack already contains every pattern required. The `pixel-retroui` `ProgressBar` and `Bubble` components are imported in the package but unused in the game screens — they directly address two of the four UX gaps. Tailwind's `animate-pulse` and the custom `@keyframes` already in `uxEnhancements.css` (`fadeIn`, `countPop`, `modalEnter`, `blink`) cover all animation needs. Adding Framer Motion, react-tooltip, or any other library would increase bundle size and architectural complexity for zero UX gain over what already exists.

**Core technologies (all existing, no changes):**
- **React 19.0.0** — component rendering; `useState` + `useEffect` sufficient for all new UI state; no state manager needed
- **Tailwind CSS 3.4.17** — utility styling; animate utilities cover phase transitions without new CSS
- **pixel-retroui 2.1.0** — retro UI components; `ProgressBar` and `Bubble` are available and unused, directly applicable
- **i18next / react-i18next** — all new player-facing copy must go through `t()` calls
- **AppColor.ts** — single source of truth for colors; all new component props must use CSS variables from here, not Tailwind color utilities or hex literals
- **phasePresentation.ts** — existing pure data map for phase-to-display-data; extend, never bypass

### Expected Features

All research files converge on the same four priority-1 deliverables. Every item is a presentation-only change with data already available in game state.

**Must have (table stakes — this milestone):**
- **Human-readable phase name as primary header label** — replace raw `ROUND_VOTING` enum with `phaseGuide[phase].title`; players expect plain-language phase labels in any turn-based game
- **Non-host read-only vote state with rule explanation** — show disabled player grid + "Host votes for the group" badge instead of a single muted wait line; non-voters in Among Us and Werewolf always see a locked-but-visible vote interface
- **Secret word discoverability improvement** — add closing cue in `WordRevealPopup` ("saved to your card") and a one-time pulse on `ViewerCard` word block; word is already persistently displayed, the gap is attention not data
- **End-game imposter callout + winner reason visual prominence** — add a viewer-first personal result badge above the player table; call out the imposter row with role color; make `winnerReason` the largest secondary text

**Should have (validate before adding — post-v1):**
- Phase progress stepper (5-step visual pipeline) — only if playtests show "what's next?" confusion persists after v1
- "Host is voting" live indicator for non-hosts — adds social tension but needs socket event or client-side timer assumption
- Role-aware narrative framing in `GameEndRoleRevealModal` ("You were the imposter — you escaped") — low effort, high emotional payoff

**Defer (v2+):**
- Round-by-round elimination log — requires new domain hook to accumulate history across rounds; justified only in extended multi-round sessions

**Anti-features (do not build):**
- Real-time vote disclosure mid-round (collapses two-step UX)
- Role reveal before GAME_ENDED (breaks core mechanic)
- Open text chat (breaks verbal deduction premise)
- Phase auto-advance timer (removes host agency)

### Architecture Approach

The codebase follows a strict Clean Architecture: domain (pure selectors, game rules) → application (use cases, hooks) → infrastructure (Socket.IO gateway) → presentation (React components). This dependency direction is enforced and must be maintained. All four improvements operate entirely within the presentation layer, with computed values flowing in from `gameSelectors.ts` via props. No new state management pattern, context, or cross-layer communication is needed. The key architectural action for this milestone is extracting duplicated logic (`didPlayerWin`, `getRoleLabel`, `getRoleColorClass`) that currently exists inline in both `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx` into `gameSelectors.ts` before adding any new rendering code.

**Major components and their roles:**
1. **`gameSelectors.ts`** — single source for all derived game-state answers; extend with `canViewerSeeWord()`, `isGameOver()`, extracted `didPlayerWin()` and `getRoleLabel()`
2. **`phasePresentation.ts`** — pure data map for phase → display data; extend with icon glyphs and `phaseSteps[]` array if stepper is added; never import this from domain layer
3. **`ActionBoard.tsx`** — phase-aware action hub; receives all needed data as props; contains the current raw enum display bug (line 77) — the primary fix target for blind spot 1
4. **`VotingPanel.tsx`** — host vs non-host branch; non-host branch (line 34) is the primary fix target for blind spot 2
5. **`ViewerCard.tsx`** — already shows `viewer.word` persistently; needs visual emphasis and closing-cue wiring for blind spot 3
6. **`GameOverModal.tsx`** — end-game player table; needs imposter callout section and viewer-first result badge for blind spot 4
7. **New: `PhaseIndicator.tsx`** — standalone component in `presentation/shared/`; receives `phase: Phase` prop; reads `phaseSteps[]` from `phasePresentation.ts`; no internal logic

### Critical Pitfalls

1. **Game logic leaked into presentation components** — the temptation to write `if (gameState.hostPlayerId !== playerId)` inline in JSX is the single most dangerous pattern; every derived game-state question must live in `gameSelectors.ts` as a pure function, components only receive pre-computed booleans/strings. Recovery is expensive (extract, test, regression-check).

2. **Raw Phase enum values displayed to players** — `ActionBoard.tsx` line 77 already does this; any new "clearer" phase indicator that copies this pattern makes the problem worse and more prominent. All phase labels must go through `phaseGuide[phase].title` or `t()`. Never render Phase enum values directly in JSX.

3. **Word popup double-trigger** — the `shownWordMarkerRef` composite marker in `useGatewayEvents.ts` (lines 88-99) is the only correct popup trigger; a "re-show word" button that calls `setIsWordPopupOpen(true)` directly bypasses this guard and causes double-popups in the same round. New word-access UI must be a separate display path (inline in ViewerCard), never a popup re-trigger.

4. **Role revealed before GAME_ENDED phase** — server sanitizes `player.role` to null until GAME_ENDED; the client must gate every role display on `Phase.GAME_ENDED` explicitly, not on `player.role !== null` (which will be truthy after GAME_ENDED). Both `GameOverModal` and any new end-game components must use `isGameOver(gameState)` from selectors, not ad-hoc phase comparisons.

5. **File size violations and App.tsx state bloat** — `ActionBoard.tsx` is at 177 lines and will receive the most changes; any addition over ~30 lines should become a new child component. Do not add purely local UI state (word visibility toggle, phase icon animation flag) to `App.tsx`; keep such state inside the component that owns the interaction.

---

## Implications for Roadmap

Based on the combined research, the four improvements can be delivered in a single phase with one prerequisite refactor step. The dependency graph is flat — all four improvements are independent once shared selectors are extracted.

### Phase 1: Shared Selector Extraction (Foundation)

**Rationale:** Before touching any visible UI, extract duplicated inline logic from modal files into `gameSelectors.ts`. This is a pure refactor with no UI change, eliminates the "anti-pattern 4" debt identified in ARCHITECTURE.md, and unblocks safe modification of both modal files. This step must come first because adding new end-game UI to `GameOverModal.tsx` while `didPlayerWin` is still inline in two files guarantees divergence bugs.

**Delivers:** `didPlayerWin(player, winner)`, `getRoleLabel(role, t)`, `getRoleColorClass(role)`, `canViewerSeeWord(gameState, playerId)`, `isGameOver(gameState)` all exported from `gameSelectors.ts`. Both modal files import from selectors. Zero visible change.

**Addresses:** Pitfalls 1 (logic in presentation), 4 (role leak guard), 5 (file size — sets the ceiling correctly before adding)

**Research flag:** Standard pattern — no additional research needed. Direct extraction, high confidence.

---

### Phase 2: Phase Clarity (Blind Spot 1)

**Rationale:** The phase indicator fix is the lowest-coupling change in the milestone — it only touches `ActionBoard.tsx` (replace one display line) and optionally adds a new `PhaseIndicator.tsx` component. No shared state, no callbacks, no architectural risk. Doing this second (after selectors are solid) means the foundation is clean when the first visible change lands.

**Delivers:** Human-readable phase label in `ActionBoard` header using `phaseGuide[phase].title`; optionally a color-block + icon glyph banner using `phaseTone` and a new `phaseIcon` map in `phasePresentation.ts`; a new `PhaseIndicator.tsx` in `presentation/shared/` if the stepper is in scope.

**Uses:** `phasePresentation.ts` (extend with `phaseIcon`), `phaseTone` (already mapped), `uxEnhancements.css` (add `.arcade-phase-banner`)

**Avoids:** Pitfall 2 (raw enum display), Pitfall 6 (over-engineered stepper — max 5 player-visible steps), Pitfall 7 (file size — extract to `PhaseIndicator.tsx` if ActionBoard grows)

**Research flag:** Standard pattern — well-documented. Direct data-map extension and label replacement.

---

### Phase 3: Vote UI Clarity (Blind Spot 2)

**Rationale:** The non-host vote path is a self-contained branch at `VotingPanel.tsx` line 34 — `if (!viewerIsHost) return <p>...</p>`. Improving this to a locked-affordance view (disabled player grid + rule badge) is isolated to that file. Vote state desync (Pitfall 8) must be addressed here at the same time: change `setSelectedTarget(undefined)` on submit to show an `isSubmitting` loading state until `viewerVotedForId` from server arrives.

**Delivers:** Non-host locked vote view with disabled player grid and "HOST VOTES FOR THE GROUP" badge; new `game.hostVotesOnly` i18n key; host vote submission loading state resolving Pitfall 8; `aria-hidden` on decorative locked grid for accessibility.

**Uses:** Existing `arcade-btn:disabled` CSS, `var(--neutral-700)` color token, `isHost()` selector (already exists)

**Avoids:** Pitfall 3 (vote restriction feels like error), Pitfall 8 (vote state desync), Pitfall 9 (no hardcoded colors)

**Research flag:** Standard pattern — no additional research needed. Clean branch replacement.

---

### Phase 4: Word Discoverability (Blind Spot 3)

**Rationale:** The secret word is already persistently displayed in `ViewerCard` — the gap is discoverability. Two small changes address it without touching the popup trigger logic: (1) a closing cue in `WordRevealPopup` ("WORD SAVED TO YOUR CARD") shown briefly before close, and (2) a one-time CSS pulse on the `ViewerCard` word block triggered when `isWordPopupOpen` transitions from true to false. The popup trigger system (`shownWordMarkerRef`) must not be touched.

**Delivers:** `WordRevealPopup` closing cue button label change; `wordJustClosed` boolean prop from `GameScreen` to `ViewerCard`; one-time `animate-pulse` on `arcade-viewer-word-block`; new `wordPopup.savedToCard` i18n key.

**Uses:** Existing `ViewerCard` word block, `animate-pulse` Tailwind utility, `isWordPopupOpen` state already in `App.tsx`

**Avoids:** Pitfall 4 (word popup double-trigger — popup trigger system is untouched), Pitfall 10 (not gated on round 1)

**Research flag:** MEDIUM confidence on prop-threading implementation — verify `onCloseWordPopup` callback chain in `GameScreen` before implementing. The pattern is sound but requires one prop-threading change that could affect `GameScreen` signature. Low risk, but worth a quick audit before starting.

---

### Phase 5: End-Game Clarity (Blind Spot 4)

**Rationale:** The end-game screen improvement is last because it depends on the selector extraction in Phase 1 and is the most complex presentation change (two modal files). With selectors extracted, both `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx` can be enhanced safely. This phase also resolves the role reveal security concern: all role display is gated through the `isGameOver()` selector established in Phase 1.

**Delivers:** Viewer-first personal result badge (`VICTORY`/`DEFEAT`) above the player table in `GameOverModal`; imposter callout section ("The imposter was: [name]") using `arcade-role-spy` CSS class; `winnerReason` displayed at larger typographic weight; `playerId` prop added to `GameOverModal` (available at `GameScreen` level); new `game.victory`, `game.defeat` i18n keys.

**Uses:** Existing `arcade-role-spy` / `arcade-role-citizen` / `arcade-role-white` CSS classes, extracted `didPlayerWin()` from Phase 1, `gameState.players[n].word` (available at GAME_ENDED), `gameState.winner` and `gameState.winnerReason`

**Avoids:** Pitfall 5 (role revealed pre-GAME_ENDED — gated through `isGameOver()` selector), Pitfall 7 (file size — if `GameOverModal.tsx` grows past 200 lines, extract imposter callout to `ImposterRevealSection.tsx`)

**Research flag:** Standard pattern — all data available, styling primitives exist, role reveal guard is already established in codebase. High confidence.

---

### Phase Ordering Rationale

- **Phase 1 must come first** — the selector extraction is the architectural prerequisite that makes all other phases safe. Without it, Phase 5 adds features on top of duplicated inline logic, creating divergence risk.
- **Phases 2, 3, 4, 5 are independent** — after Phase 1, all four can be built in parallel or in any order. The suggested sequence (phase clarity → vote UI → word → end game) goes from lowest coupling to highest, making each phase a stepping stone of increasing confidence.
- **File size discipline applies throughout** — each phase must check line counts before adding to existing files; the 300-line rule is a pre-task gate, not a post-task concern.
- **i18n coverage applies throughout** — every new player-facing string needs a `t()` call; this is a non-negotiable project rule.

### Research Flags

Phases likely needing deeper pre-implementation audit:
- **Phase 4 (Word Discoverability):** Audit `GameScreen.tsx` → `ViewerCard.tsx` prop chain before implementing; verify `onCloseWordPopup` callback signature and whether `wordJustClosed` prop threading requires `GameScreen` interface changes that ripple up to `App.tsx`. Low risk but must be confirmed before coding.

Phases with standard patterns (no additional research needed):
- **Phase 1 (Selector Extraction):** Pure refactor with clear source and destination. Mechanical extraction.
- **Phase 2 (Phase Clarity):** Data-map extension and label replacement. Pattern fully documented in STACK.md.
- **Phase 3 (Vote UI):** Self-contained branch replacement. Source and destination both clearly identified.
- **Phase 5 (End-Game):** All data available post-GAME_ENDED; styling primitives exist; role guard established.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology decisions based on direct `node_modules` and codebase inspection. No new dependencies recommended — eliminates version risk entirely. |
| Features | MEDIUM-HIGH | The 4 P1 features are HIGH confidence (confirmed pain points, data verified in codebase). P2 features are MEDIUM — genre convention analysis, not user research. |
| Architecture | HIGH | Based on direct analysis of all relevant source files. Layer boundaries are clear. Build order implications are verified against actual file contents and line counts. |
| Pitfalls | HIGH | All 10 pitfalls grounded in direct codebase evidence (specific file lines cited). Not inferred from general patterns — each pitfall references actual existing code. |

**Overall confidence:** HIGH

### Gaps to Address

- **`App.tsx` total line count unknown from research** — CONCERNS.md notes it is large (15+ state variables). Verify line count before Phase 1 begins; if over 200 lines, extract `useGameUIState` hook before adding any new state.
- **`phaseGuide` i18n status** — PITFALLS.md notes that `phaseGuide` titles in `phasePresentation.ts` are not yet wrapped in `t()`. If Phase 2 promotes these to the primary header label, they become prominently player-facing and must be i18n-wrapped before ship. Audit `phasePresentation.ts` for hardcoded strings at Phase 2 start.
- **`currentVote` data availability for non-host locked view** — PITFALLS.md notes the sanitized state may or may not include host's in-progress vote selection. Verify what `gameState` provides to non-host clients during `ROUND_VOTING` before designing the locked view's detail level.
- **Social deduction genre conventions** — all competitor pattern references (Among Us, Spyfall, Jackbox) are from training data through August 2025, not verified against current live implementations. The patterns cited are well-established and unlikely to have changed, but external verification was unavailable.

---

## Sources

### Primary (HIGH confidence — direct codebase analysis)
- `apps/web/src/presentation/` — all game screen components (ActionBoard, VotingPanel, ViewerCard, GameOverModal, GameEndRoleRevealModal, GameScreen, WordRevealPopup, PlayersPanel)
- `apps/web/src/presentation/shared/phasePresentation.ts` — phase guide and tone maps
- `apps/web/src/domain/utils/gameSelectors.ts` — existing pure selectors
- `apps/web/src/domain/hooks/useGatewayEvents.ts` — socket event bridge, word popup trigger logic
- `apps/web/src/design-system/AppColor.ts` — design token source
- `apps/web/src/design-system/uxEnhancements.css`, `components.css` — animation keyframes and role CSS classes
- `node_modules/pixel-retroui/dist/components/index.d.ts` — ProgressBar, Bubble, Accordion API confirmation
- `packages/shared/src/enums/Phase.ts`, `models/GameState.ts` — shared type contracts
- `.planning/PROJECT.md` — confirmed milestone requirements and UX blind spots
- `.planning/codebase/CONCERNS.md` — confirmed known bugs (word popup trigger, vote desync, client-side vote validation gap)
- `.planning/codebase/ARCHITECTURE.md` — layer rules and dependency directions

### Secondary (MEDIUM confidence — genre conventions)
- Among Us (2018-2024) — phase banner pattern, dead-player vote view, end-screen role reveal
- Spyfall / BoardGameArena Werewolf — vote UI for spectators, round-progress pattern
- Jackbox party games — phase labeling, progress stepper conventions
- Nielsen Norman Group heuristics — visibility of system status, recognition over recall, error prevention via affordances (training data, not verified against current NNG articles)

---

*Research completed: 2026-02-28*
*Ready for roadmap: yes*
