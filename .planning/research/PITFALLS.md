# Pitfalls Research

**Domain:** Social deduction game UX improvements (phase indicators, vote UI, end-game screens)
**Researched:** 2026-02-28
**Confidence:** HIGH — all pitfalls grounded in direct codebase analysis of existing files

---

## Critical Pitfalls

### Pitfall 1: Leaking Game Logic Into Presentation Layer

**What goes wrong:**
When adding phase indicators or vote UI enhancements, developers add conditional game-rule logic directly inside React components — for example, computing "is this player voted out?", "can the viewer vote?", or "who won and why?" inside a `.tsx` file instead of a domain selector.

**Why it happens:**
The phase or vote data is already available as a prop. The simplest path to render "YOU CANNOT VOTE" is to write `if (gameState.hostPlayerId !== playerId)` inside `VotingPanel.tsx`. The immediate payoff is fast — no new file, no new function.

**How to avoid:**
Every derived game-state question must be answered in `apps/web/src/domain/utils/gameSelectors.ts` (or a new focused selector file). Components receive pre-computed values: `canVote: boolean`, `isEliminated: boolean`, `winnerLabel: string`. The component only renders — it does not compute.

**Warning signs:**
- A `.tsx` file imports `Role`, `Phase`, `Winner`, or `GameMode` directly from `@imposter/shared` and uses them in conditional rendering branches that encode game rules.
- A component file references `gameState.hostPlayerId`, `gameState.winner`, or `gameState.voteRound` for logic rather than display.
- Logic that mirrors something already in `gameSelectors.ts` (`isHost`, `alivePlayers`) is re-written inline inside a component.

**Phase to address:** Phase that adds phase indicators and vote-restriction UI — the very first UI enhancement phase.

---

### Pitfall 2: Translating Internal Phase Names Directly to Players

**What goes wrong:**
The raw `Phase` enum values (`ROUND_DESCRIPTION`, `WIN_LOSE_CHECK`, `WHITE_TRANSITION`) are displayed as-is to players. The ActionBoard already shows `{gameState.phase}` directly (confirmed in `ActionBoard.tsx` line 77). Extending this pattern for a "clearer" indicator will just make the raw enum string more prominent.

**Why it happens:**
The enum name is available, translating it feels unnecessary, and during development the developer reads the enum and understands it. Players see `ROUND_VOTING` and need to guess what it means.

**How to avoid:**
All player-facing phase labels must go through the existing `phaseGuide` map in `apps/web/src/presentation/shared/phasePresentation.ts`, or an i18n key. The phase enum is a technical identifier — never an end-user label. The `phaseGuide.title` field already provides human-readable names; use those instead of the raw enum.

**Warning signs:**
- A new component references `gameState.phase` and renders it inside a JSX string directly, without going through `phaseGuide` or `t()`.
- A new "phase badge" or "status chip" component imports `Phase` enum and uses the enum value as display text.

**Phase to address:** Phase indicator work; applies also to any end-game label enhancement.

---

### Pitfall 3: Making Vote Restriction Feel Like an Error, Not a Feature

**What goes wrong:**
Non-host players are blocked from voting by server guard and UI guard — this is intentional and correct. But if the UI shows nothing (current behavior: `<p>Waiting for host to vote...</p>`) or shows a disabled button with a red error style, players feel punished. They assume they are missing something or that the UI is broken.

**Why it happens:**
Developers treat "cannot vote" as an edge case handled by hiding/disabling. The non-host experience is an afterthought — the real work was building the host vote flow.

**How to avoid:**
Treat the non-host voting view as a first-class screen, not a fallback. Show: who the host currently voted for (if that data is available in sanitized state), that the host is voting right now (active state indicator), and that this is how the game works (brief contextual tip). The goal is that a non-host player reading the screen understands the game rule without a tooltip or manual.

**Warning signs:**
- The non-host voting path returns `null` or renders only a single muted text line.
- The non-host UI does not update visually when the host changes their vote selection.
- Playtesting with a non-host player causes confusion ("can I vote?", "did something break?").

**Phase to address:** Vote UI improvement phase.

---

### Pitfall 4: Word Popup Trigger Relies on Fragile Marker Logic

**What goes wrong:**
The word popup trigger in `useGatewayEvents.ts` (lines 88–99) uses a composite marker `${playerId}:${round}:${word}` to decide whether to show the popup. Improving the end-game reveal or adding a "re-show word" button by touching this marker logic breaks the existing de-duplication. A word reveal that appears twice per round is worse than one that appears once.

**Why it happens:**
The marker approach is not immediately obvious from reading the code. A developer adding a "view my word again" button may reset `shownWordMarkerRef` without realizing they break the once-per-round guard, or may trigger `setIsWordPopupOpen(true)` directly without going through the marker system.

**How to avoid:**
Any new word-reveal access point (e.g., a persistent word display on the viewer card, or a "re-show" button) must NOT touch `shownWordMarkerRef`. Persistent display should be a separate UI concern — always show `viewer.word` in the `ViewerCard` when it is non-null, rather than using the popup trigger. The popup is for the initial reveal; the card is for the persistent reminder.

**Warning signs:**
- New code calls `setIsWordPopupOpen(true)` outside of `useGatewayEvents.ts`.
- New code resets `shownWordMarkerRef.current` in a component or hook that is not `useGatewayEvents`.
- The word popup appears more than once per round during integration testing.

**Phase to address:** Word reveal / persistent word access phase.

---

### Pitfall 5: End-Game Screen Reveals Role Before GAME_ENDED Phase

**What goes wrong:**
The `ViewerCard` correctly hides role with `???` until `isGameOver` is true. The `GameOverModal` reveals roles in a table. If a new "game summary" component, a role badge, or an enhanced end-screen is added without checking `gameState.phase === Phase.GAME_ENDED`, roles leak during live play. This breaks the core game mechanic.

**Why it happens:**
At the `GAME_ENDED` phase, the game is obviously over, so developers assume they can show `viewer.role` freely. They miss that other components already on screen (PlayersPanel, ViewerCard) may receive updated data before the end-game modal renders, and the guard must be explicit in every component that renders role data.

**How to avoid:**
Every component that renders a player's role — including new end-game summary tables, role reveal animations, or player list enhancements — must gate on `Phase.GAME_ENDED` explicitly. Extract a shared selector `isGameOver(gameState)` in `gameSelectors.ts` and pass it consistently rather than re-deriving from `phase` inside each component. Never use `player.role !== null` as the reveal gate — use the phase gate.

**Warning signs:**
- A new component receives `player.role` or `viewer.role` as a prop and renders it without checking `isGameOver`.
- `Role` enum is imported and compared in a component that is visible before `GAME_ENDED`.
- A new end-game animation or reveal sequence fires before the phase transitions to `GAME_ENDED` on the client.

**Phase to address:** End-game screen phase; also applies to any player list enhancement.

---

### Pitfall 6: Over-Engineering Phase Indicator State

**What goes wrong:**
Adding a step-by-step phase progress bar (e.g., steps 1 of 5 → 2 of 5) that tries to map all 11 Phase enum values to a linear visual sequence. The game has internal phases that players never experience consciously (`LOBBY_READY`, `ROLE_DISTRIBUTION`, `WIN_LOSE_CHECK`, `WHITE_TRANSITION`) — these are server-side transition states that fire and resolve within milliseconds. Showing them in a stepper adds noise without information.

**Why it happens:**
Developers enumerate all Phase values when building the indicator, treat each as a "step", and try to make a linear progress visualization. The resulting UI has 11 steps, several of which are never seen by players in practice.

**How to avoid:**
The player-facing phase model has 5 meaningful states: Lobby, Describe, Discuss, Vote, Game Over. Internal server-transition phases (`LOBBY_READY`, `ROLE_DISTRIBUTION`, `WIN_LOSE_CHECK`, `WHITE_TRANSITION`, `ROUND_RESULT`) should map to the nearest player-visible state for any progress indicator. The existing `phaseGuide` already groups them implicitly by providing guidance. A simple labeled indicator (current phase name + guide text) is more effective than a stepper.

**Warning signs:**
- New code branches on `Phase.WIN_LOSE_CHECK`, `Phase.WHITE_TRANSITION`, or `Phase.LOBBY_READY` for distinct UI states that players will see.
- A stepper or progress bar component has more than 5 steps.
- A new selector in `gameSelectors.ts` returns an integer step number that maps all 11 phases.

**Phase to address:** Phase indicator phase.

---

### Pitfall 7: Adding New Game-Visible State to Existing Files That Already Approach 300 Lines

**What goes wrong:**
`ActionBoard.tsx` (177 lines), `GameScreen.tsx` (86 lines), and `App.tsx` (unknown from inspection but referenced as large in CONCERNS.md) are the files most likely to receive new props and logic for phase indicators, vote UI, and end-game screens. Appending all enhancements into these files pushes them past the 300-line constraint and makes them hard to review.

**Why it happens:**
The component already renders the relevant area (e.g., ActionBoard renders both phase info and vote panel), so adding one more `if` block or prop feels natural. The file grows incrementally and nobody notices until it is 400 lines.

**How to avoid:**
Each new UI section should be its own component file in the appropriate subdirectory: a `PhaseIndicator.tsx` in `presentation/shared/`, a `NonHostVotingView.tsx` in `presentation/voting/`, an end-game result summary as a separate component in `presentation/game-over/`. Treat the 300-line rule as a pre-task constraint — check the current line count of any file before adding to it.

**Warning signs:**
- A file receiving new enhancements is already over 200 lines.
- A PR diff adds more than 50 lines to a single existing component file.
- New JSX sections are added directly to `ActionBoard.tsx` or `App.tsx` instead of extracted to a child component.

**Phase to address:** All phases — applies from the first file touched.

---

### Pitfall 8: Vote State De-sync Between Local Selection and Server State

**What goes wrong:**
The two-step vote UI (select target → submit) uses `selectedTarget` as local React state in `VotingPanel.tsx`. After submission, `selectedTarget` is reset to `undefined`. But `viewerVotedForId` (from server state) lags behind by one socket round-trip. During that gap, the UI shows neither the old selection nor the new server-confirmed vote — the panel appears as if no vote has been cast, which confuses the host.

**Why it happens:**
Optimistic UI updates are not used. The component resets local state on submit but waits for server confirmation. Any enhancement that shows "your current vote is X" relies on `viewerVotedForId`, which is momentarily stale.

**How to avoid:**
After submission, display an "Submitting vote..." state instead of clearing to blank. Either introduce a brief loading indicator keyed on a `isSubmitting` local flag, or show the `selectedTarget` optimistically until the server state arrives. Do not reset `selectedTarget` to `undefined` on submit — reset it when `viewerVotedForId` changes (use a `useEffect` watching `viewerVotedForId`).

**Warning signs:**
- During playtesting, the vote panel flickers between "no vote" and "voted for X" after submission.
- The host submits a vote and the UI briefly clears before showing the server-confirmed state.
- `VotingPanel.tsx` calls `setSelectedTarget(undefined)` inside the submit handler immediately.

**Phase to address:** Vote UI improvement phase.

---

### Pitfall 9: Hard-Coding Colors Instead of Using AppColor Tokens

**What goes wrong:**
New UI elements for phase indicators, vote status badges, or role reveal effects introduce hex codes or Tailwind color classes (`text-green-500`, `bg-red-400`) directly in the component instead of using CSS variables from the design system (`var(--green-400)`, `var(--blue-400)`).

**Why it happens:**
When prototyping quickly, Tailwind utility classes are the fastest path. The existing `VotingPanel.tsx` already uses `var(--yellow-400)` and `var(--blue-400)` via the `pixel-retroui` Button props — but Tailwind className strings like `text-blue-400` are also used in `GameOverModal.tsx` for role color classes. The pattern is inconsistent, so new work may copy either approach.

**How to avoid:**
Use `AppColor.ts` tokens for any new color that appears in inline styles or `pixel-retroui` component props. For Tailwind className strings, use only classes that map to the design token (as configured in `tailwind.config.ts`). Do not introduce new hex values or Tailwind color classes that are not already in the design system.

**Warning signs:**
- A new component's `bg` or `textColor` prop contains a literal hex code not defined in `AppColor.ts`.
- A new `.tsx` file adds Tailwind classes like `text-emerald-500` or `bg-amber-300` that do not correspond to a design token.
- `AppColor.ts` is not imported in any selector or helper that maps game state to colors.

**Phase to address:** All visual enhancement phases.

---

### Pitfall 10: Phase Transitions That Only Show for Round 1

**What goes wrong:**
The WordRevealPopup is currently gated with `gameState.round === 1` in `GameScreen.tsx` (line 52). If the end-game improvements or new phase indicators copy this pattern for other display logic, features silently stop working in rounds 2, 3, and beyond. Players in later rounds see incomplete or missing UI.

**Why it happens:**
The round-1 gate exists for the word popup specifically because the word was already shown. Copying the conditional for unrelated display logic (e.g., "show phase transition effect only in round 1") makes no game-rule sense and is a copy-paste mistake.

**How to avoid:**
Treat `gameState.round === 1` as a domain guard that belongs only to word-popup deduplication logic — it is not a generic "early game" condition. Any new phase indicator or transition animation must work across all rounds. Confirm new display logic by testing with round > 1.

**Warning signs:**
- A new component or conditional includes `gameState.round === 1` without a documented reason tied to a specific game rule.
- A feature works correctly in round 1 of playtesting but fails silently in round 2.
- A new selector adds a `round` check that is not explained in a comment or linked to a game rule in `CLAUDE.md`.

**Phase to address:** Any phase that adds new round-aware UI.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding game-rule `if` directly in component | Faster to ship | Logic untested, duplicated across components | Never — always use selectors |
| Using raw `Phase` enum value as display label | No translation layer needed | Players see technical names; breaks if enum is renamed | Never |
| Appending new JSX to ActionBoard or App.tsx | No new files | Files exceed 300-line limit; harder to review and test | Never — extract to new component |
| Using Tailwind color class directly instead of design token | Faster prototyping | Colors diverge from design system; hard to theme | Only in throwaway prototype, not in merged code |
| Keeping `selectedTarget` reset on submit (no optimistic UI) | Simpler state | Vote panel flickers between empty and confirmed states | Acceptable only if a loading spinner fills the gap |
| Gating new display on `round === 1` without explanation | Avoids duplicated popup | Feature silently absent in rounds 2+ | Never without explicit game-rule justification |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `pixel-retroui` Button/Card | Pass color values as Tailwind classes in `bg` prop | `bg` and `textColor` accept CSS variable strings (`var(--yellow-400)`) — confirmed in `VotingPanel.tsx` |
| `pixel-retroui` Popup | Mount Popup with `isOpen` prop at component level, control with state | Confirmed pattern in `WordRevealPopup.tsx` — do not conditionally render the `<Popup>` element itself |
| Socket state updates (`onStateUpdate`) | Modify `useGatewayEvents.ts` directly to add new visual state triggers | New display triggers should be derived from `gameState` in selectors and passed as props — avoid side-effecting the gateway hook with UI logic |
| i18n (`useTranslation`) | Write display strings directly in JSX without `t()` | All player-facing strings use `t()` — game phase guide titles in `phasePresentation.ts` are the exception (not yet i18n-wrapped) |
| `@imposter/shared` Phase enum | Add UI-specific display logic to the enum itself | Enum is pure data; display mapping belongs in `phasePresentation.ts` or a new selector |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating phase transitions by comparing previous and current `phase` in `useEffect` | Animation fires on unrelated state updates if dependency array is wrong | Use a single `useEffect([gameState.phase])` with explicit prev-phase tracking via `useRef` | Any time other state (votes, players) updates while phase is stable |
| Re-rendering GameOverModal on every state update in GAME_ENDED phase | Table flickers; role badges re-animate | Memoize modal content or gate with `useMemo` on `gameState.players` | With 8+ players and rapid Socket updates |
| Adding new derived selectors inline in render functions | Computes on every render even if inputs unchanged | Extract to `gameSelectors.ts` and wrap caller with `useMemo` if expensive | Games with 10+ players; state updates every few seconds |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering `viewer.role` from client-side game state before server sends it | Role leaks client-side before GAME_ENDED; sanitization is server-side only | Always gate role display on `Phase.GAME_ENDED`; never trust `player.role !== null` as a reveal guard — server sends `null` until game ends |
| Exposing `eliminatedPlayerId` or `winnerReason` in UI hints before GAME_ENDED | Gives away game result mid-play | Only show `eliminatedPlayerId` and `winnerReason` in GAME_ENDED phase UI; treat these as spoilers in all earlier phases |
| New vote UI component validates vote target client-side only | Malicious client bypasses UI guard; server already validates but defense-in-depth is lost | Add client-side validation that `targetPlayerId` is in `alivePlayers` array before enabling the Submit button — confirmed missing in CONCERNS.md |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing phase name without player action hint | Players know what phase it is but not what to DO | Always pair phase label with an action instruction (already done in `phaseGuide.description`) — do not create a phase badge without the corresponding instruction text |
| Non-host sees blank screen during ROUND_VOTING | Player thinks the game is broken or they are forgotten | Show non-host an informative "Host is voting" state with current vote status if available |
| End-game screen only reachable via modal overlay | Players close modal by accident and lose result information | Provide persistent end-game state in the main layout (GameOverPanel), not only as a dismissible modal |
| Word popup countdown blocks seeing word immediately | Players on slow connections miss the countdown; they expect the word to appear faster | Ensure countdown animation is client-local (already done via `preCountdown` state in `WordRevealPopup.tsx`) — do not make it server-driven |
| Phase transition animation plays for internal server phases (WIN_LOSE_CHECK etc.) | Jarring micro-flashes that mean nothing to players | Only trigger visible transition animations for the 5 player-visible phases; suppress animation for server-internal phases |

---

## "Looks Done But Isn't" Checklist

- [ ] **Phase indicator:** Verify it shows correct label for ROUND_RESULT and WHITE_TRANSITION (not just the five "main" phases) — both exist briefly and must not show broken UI.
- [ ] **Vote UI restriction:** Verify non-host dead player sees neither vote UI nor "waiting for host" message — currently `VotingPanel.tsx` returns `null` for dead non-hosts, which is correct but must be preserved in any refactor.
- [ ] **Word persistent display:** Verify `viewer.word` is accessible after popup is dismissed — currently the ViewerCard shows `viewer?.word` at all times, but only if `wordDisplay` is non-null; confirm this works across all phases including ROUND_DISCUSSION.
- [ ] **End-game role reveal:** Verify that `GameOverModal` role column shows `???` when opened mid-game if someone finds a way to trigger it early — role display is gated on `isGameOver` in ViewerCard but not on a modal trigger guard.
- [ ] **Reset game:** Verify phase indicator and vote UI reset cleanly to GAME_CREATION state after host resets — `shownWordMarkerRef` and `selectedTarget` both need reset; `selectedTarget` is local component state and resets on unmount; `shownWordMarkerRef` is reset in `useGatewayEvents` on GAME_CREATION phase.
- [ ] **Round > 1 flows:** Every new UI element works correctly in round 2 and 3, not just round 1.
- [ ] **i18n coverage:** Every new player-visible string has a `t()` call or is added to the i18n resource files.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Game logic leaked into presentation | HIGH | Extract logic to new selector function in `gameSelectors.ts`, replace inline logic in component with selector call, add unit test for selector |
| Raw Phase enum displayed to players | LOW | Add i18n key mapping or use existing `phaseGuide.title`; replace display string in component; no architectural change needed |
| Vote UI flicker from local/server state gap | LOW | Add `isSubmitting` flag to `VotingPanel.tsx`, show transient loading state between submit and server confirmation |
| Word popup shown twice per round | MEDIUM | Audit all calls to `setIsWordPopupOpen(true)` and `shownWordMarkerRef.current = ''`; ensure only `useGatewayEvents.ts` triggers popup |
| Role revealed before GAME_ENDED | HIGH | Audit every component that receives `player.role` or `viewer.role`, add explicit `Phase.GAME_ENDED` guard, add regression test |
| File exceeds 300 lines | LOW | Extract the newest-added section into a child component file; update imports |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Game logic in presentation | Phase indicator phase (earliest) | Confirm no `Role`/`Phase`/`Winner` imports used for conditional logic in new `.tsx` files |
| Raw enum as display label | Phase indicator phase | Confirm all phase labels pass through `phaseGuide` or `t()` |
| Non-host vote feels broken | Vote UI improvement phase | Playtest as non-host through full voting round |
| Word popup trigger broken | Word reveal / persistent access phase | Trigger word popup in round 1, close it, advance to round 2, confirm it fires again on round 2 word |
| Role revealed pre-GAME_ENDED | End-game screen phase | QA check: inspect rendered DOM for role text before phase reaches GAME_ENDED |
| Over-engineered phase stepper | Phase indicator phase | Count steps in indicator — must be <= 5 player-visible states |
| File size violation | Every phase | Count lines in any modified file before and after changes; gate on <300 |
| Vote state flicker | Vote UI improvement phase | Record screen during host vote submission and review for blank-panel flash |
| Hard-coded colors | Every visual phase | Grep new component files for hex literals and non-design-token Tailwind classes |
| Round-1 gate on wrong logic | Any round-aware UI phase | Run full game to round 3 and verify new UI elements appear correctly |

---

## Sources

- Direct codebase analysis: `apps/web/src/presentation/voting/VotingPanel.tsx` — confirms two-step vote flow, local `selectedTarget` state, non-host guard pattern.
- Direct codebase analysis: `apps/web/src/presentation/game/ActionBoard.tsx` — confirms raw `gameState.phase` displayed as-is on line 77; phase animation via `useEffect`; `phaseGuide` usage.
- Direct codebase analysis: `apps/web/src/presentation/shared/phasePresentation.ts` — confirms 11 Phase enum values mapped to guide text; `phaseTone` CSS class map.
- Direct codebase analysis: `apps/web/src/presentation/game/GameScreen.tsx` — confirms `round === 1` gate on word popup (line 52).
- Direct codebase analysis: `apps/web/src/presentation/game/ViewerCard.tsx` — confirms `isGameOver` gate for role reveal; word always shown via `viewer?.word`.
- Direct codebase analysis: `apps/web/src/presentation/game-over/GameOverModal.tsx` — confirms role reveal in end-game table; win/lose badge logic inline in component.
- Direct codebase analysis: `apps/web/src/domain/hooks/useGatewayEvents.ts` — confirms `shownWordMarkerRef` marker logic; 30s reconnect timeout; localStorage usage.
- Direct codebase analysis: `apps/web/src/domain/utils/gameSelectors.ts` — confirms existing selectors `getViewer`, `alivePlayers`, `isHost`.
- Direct codebase analysis: `.planning/codebase/CONCERNS.md` — confirms known bugs: word popup trigger fragility, vote retraction state desync, localStorage session staleness, missing client-side vote validation.
- Direct codebase analysis: `.planning/codebase/ARCHITECTURE.md` — confirms layer rules, dependency direction, sanitization strategy.
- Direct codebase analysis: `.planning/PROJECT.md` — confirms milestone scope: phase indicator, vote rules self-explanatory, word reveal persistence, end-game clarity.

---
*Pitfalls research for: Social deduction game UX improvements — phase indicators, vote UI, end-game screens*
*Researched: 2026-02-28*
