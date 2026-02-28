# Feature Research

**Domain:** Social deduction game UX — state self-explanation improvements
**Researched:** 2026-02-28
**Confidence:** MEDIUM (codebase analysis HIGH; external pattern references MEDIUM — web search unavailable, drawing from well-established genre conventions from Among Us, Werewolf, Spyfall, and Codenames)

---

## Context: What the Codebase Already Has

Before mapping the feature landscape, it is essential to document what already exists, because this is a **subsequent milestone** improving existing UI — not a greenfield build.

| Area | What exists | Gap |
|------|------------|-----|
| Phase display | Raw enum string tag in header (`ROUND_VOTING`), colored by `phaseTone`. `phaseGuide` title+description shown in "Action Board" card. | Tag is not human-readable. Guide is buried and labeled "Next Move" — not "Phase". Players scan the header and see `ROUND_VOTING` without knowing what that means. |
| Vote UI (non-host) | Single muted line: "WAITING FOR HOST TO VOTE..." shown in VotingPanel when `!viewerIsHost`. | No visual explanation of *why* the player cannot vote. No indication of the rule. Players may interpret this as a loading state or a bug. |
| Vote UI (host) | Two-step: select target (highlight) → Submit button. Current vote shown after submission. Skip option in Classic mode. | Functional. Minor gap: selected target highlight uses yellow which is the same color as the Submit button — selection confirmation could be clearer. |
| Secret word access | `WordRevealPopup` opens automatically at round 1 start. `ViewerCard` always shows `viewer.word` after popup is dismissed. | Word is persistently visible in ViewerCard — this is actually a reasonable solution but players may not realize the ViewerCard always shows their word. The popup-only-on-round-1 gate means late reconnectors miss the popup but the word is still in ViewerCard. No "re-open word" button. |
| End game screen | Two-modal sequence: `GameEndRoleRevealModal` (personal WIN/LOSS + role) → `GameOverModal` (full player table with role, status). `winnerReason` displayed as plain text. | Personal outcome is shown first — good. But `winnerReason` is a raw server string with no visual hierarchy. The full table is functional. The imposter identity is not called out specially — it's just another row in the table. |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in a game with defined phases. Missing these causes confusion, not just friction.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Human-readable phase name in the primary header | Players in any turn-based game expect to see a clear, plain-language label for the current phase ("Your Turn to Speak", "Voting Phase") — not an internal enum string. The current `ROUND_VOTING` tag is opaque. | LOW | Already have `phaseGuide[phase].title` — this is a labeling + prominence change, not a logic change. Replace enum string display with the guide title, or add a dedicated phase chip showing the human name. No new domain logic needed. |
| Non-host sees an explanatory "read-only" vote state, not just a wait message | In every social deduction game with asymmetric roles (Werewolf, Among Us), spectators/non-voters see a clear "you are observing this vote" state with players highlighted as targets, not a blank wait screen. | LOW | Current code returns `<p className="arcade-muted">WAITING FOR HOST TO VOTE...</p>`. Replace with a read-only view of the vote grid (player chips, grayed/disabled) plus a rule reminder badge: "Only the host votes." This clarifies the rule without an error state. |
| Secret word persistently findable without scanning the full layout | Players cannot be expected to know the ViewerCard always shows their word. A discrete, always-accessible "My Word" affordance (a chip or badge labeled "Word: [word]" with a tap-to-focus behavior) removes the "I forgot my word" confusion. | LOW | ViewerCard already renders `viewer.word`. The gap is discoverability: players don't know to look there. Adding a subtle pulsing or labeled emphasis on the word chip during early game phases solves this. No new data needed. |
| End game imposter reveal is visually distinct | In every social deduction game (Spyfall, Among Us, Codenames), the reveal of "who was the spy" is the climactic moment. Burying the imposter as a table row treats it as equal to other information. Players expect the imposter identity to be called out prominently. | LOW | `GameOverModal` already has the full table. Add an imposter callout section at the top: "The Imposter was: [name] ([role color])". Role is available in `player.role`. No server changes needed. |
| Winner reason reads as a human narrative, not a system string | `winnerReason` is currently shown with no visual weight. In any competitive game with a win condition, the "why you won/lost" message should be the most readable text on the screen after the winner announcement. | LOW | Layout and typography change. Make `winnerReason` the largest or most prominent secondary text after the winner banner. No logic change. |

### Differentiators (Competitive Advantage)

Features not universally expected but that significantly improve the social deduction experience for this specific game.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Phase progress stepper (visual pipeline) | Shows players where they are in the game arc: Lobby → Role Assignment → Describe → Discuss → Vote → Result. Common in board game apps (e.g., Ticket to Ride companion, Jackbox-style games). Reduces "what happens next?" questions. | MEDIUM | Requires mapping the 10 Phase enum values into 5–6 user-facing steps. Must collapse intermediate server-side phases (LOBBY_READY, WIN_LOSE_CHECK, WHITE_TRANSITION) into invisible transitions. Adds a new UI component. No domain logic change. Complexity is in the phase-to-step mapping and responsive rendering. |
| "Host is voting" live indicator for non-host players during voting | A real-time visual that shows the host is actively selecting (e.g., animated "Host is thinking..." with a typing indicator pattern). Creates social tension that is core to the genre. | MEDIUM | Requires either a server-side event when host begins selection (new socket event) or a client-side timer assumption. The simplest approach: show a loading animation for non-hosts once ROUND_VOTING phase begins, without server changes. |
| Round-by-round outcome history (eliminated player log) | After each round result, show a brief "Round X: [Name] was eliminated" log. In multi-round games, players forget earlier eliminations. This is standard in Werewolf implementations. | MEDIUM | `eliminatedPlayerId` is in GameState. Need to accumulate history across rounds on the client (since GameState only holds current round state). Requires a `useEffect` accumulator in App or a domain hook. Architecture note: accumulation logic belongs in domain layer, not presentation. |
| Word chip with "tap to re-read" focus mode | A floating or anchored "MY WORD: [word]" chip that, when tapped, briefly enlarges the word for easy re-reading. Solves the "I forgot my word" problem more elegantly than the current popup-only pattern. | LOW | Pure presentation feature. No new data. Adds a click handler on the word display in ViewerCard that triggers a brief CSS enlargement/focus animation. |
| Imposter's perspective on end screen ("You were the imposter — you were caught/escaped") | Shows the imposter player a personalized narrative. Citizens get "You identified the imposter" or "The imposter escaped". This role-aware framing is what separates social deduction games from generic vote games. | LOW | `viewer.role` + `gameState.winner` already available. Pure presentation logic in the personal result modal (`GameEndRoleRevealModal`). No server changes. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Show who each player voted for during/after voting | Players ask "who voted for who?" for social accountability | This game has **host-only voting** — showing the host's vote in real time tells all players the intended target before submission, collapsing the two-step UX. Post-game vote disclosure would reveal the host's strategy retrospectively but adds no gameplay value. | Keep vote private until round result. The `currentVote` display (already shown to host) is sufficient. |
| Real-time role reveal during mid-game phases | Curiosity — players want to know roles before game ends | Violates the core game mechanic. The entire tension is built on role secrecy until GAME_ENDED. Even a "reveal your own role" button mid-game breaks deduction. | The word is always visible in ViewerCard; the role showing `???` mid-game is correct by design. |
| Chat / free text during discussion phase | Players want to discuss via UI rather than voice | The game is designed to be played IRL or on voice chat. A text chat would need moderation, history management, and creates a written record that breaks the "verbal deduction" premise. The `statement` system (one sentence per player per round) is the intentional constraint. | Improve the statement display in PlayersPanel (already shows statements) — make them more readable rather than adding open chat. |
| Auto-advance phases on a timer | Reduces friction of host manually advancing | Timers break the social rhythm. Social deduction games require human-paced discussion. Among Us uses timers only in emergency meetings, not for discussion. Auto-advance removes host agency which is a core design decision (host-only voting/advancing). | Add a subtle "waiting for host to advance" indicator for non-hosts so they understand the phase won't auto-change — removes confusion without removing host control. |
| Anonymous voting (hide who the host voted for from everyone) | Privacy of vote | The host is the only voter. Anonymizing the result (who got eliminated) defeats the purpose of the vote phase — elimination IS the public outcome. What should stay private is the host's targeting *process* (already handled by two-step UI). | Two-step vote UI already provides this: host selects privately, submits publicly. The outcome (elimination) is always public. |
| Multiple simultaneous active games per room | Power users want parallel sessions | The current architecture uses Redis with roomId as key. Parallel sessions would require sub-room partitioning. This is a scope expansion, not a UX improvement. Out of scope for this milestone. | None — not an anti-feature for UX milestone, just out of scope. |

---

## Feature Dependencies

```
[Human-readable phase name in header]
    └──enhances──> [Phase progress stepper]
                       (stepper is only meaningful once phases are labeled)

[Non-host read-only vote view]
    └──requires──> (no technical dependency, but)
    └──enhances──> ["Host is voting" live indicator]
                       (both address non-host voting UX together)

[Word chip tap-to-focus]
    └──replaces──> [WordRevealPopup popup-only pattern for word re-access]
                       (both solve same problem; chip is additive, popup remains for initial reveal)

[Imposter callout in GameOverModal]
    └──enhances──> [Imposter's perspective in GameEndRoleRevealModal]
                       (personal result modal is shown first; full reveal modal is second)

[Winner reason visual prominence]
    └──requires──> [Winner banner already exists] (already built)

[Round-by-round elimination log]
    └──requires──> [Client-side round history accumulation hook]
                       (new domain hook needed; presentation depends on it)
```

### Dependency Notes

- **Phase progress stepper requires phase labeling**: If the phase enum values are shown as-is in the stepper, it inherits the same readability problem. Human-readable labels should be resolved first (or simultaneously).
- **Non-host read-only vote view is independent**: Can be built without touching host vote logic. The `viewerIsHost` branch in `VotingPanel` already cleanly separates the two paths.
- **Round elimination log requires a new domain hook**: `GameState` only holds the current `eliminatedPlayerId`. Accumulating history across rounds requires a `useEffect` in a domain hook that appends to a list when `eliminatedPlayerId` changes. This hook belongs in `apps/web/src/domain/hooks/`, not in presentation. This is the only item in the list that adds a new domain-layer artifact.
- **Imposter callout and personal result modal are independent**: Both can be improved without affecting each other. They render in sequence (`GameEndRoleRevealModal` → `GameOverModal`) and share no state.

---

## MVP Definition

This is a **subsequent milestone** with 4 validated pain points. The MVP is: solve all 4 pain points at table-stakes level.

### Launch With (v1 — this milestone)

- [ ] Human-readable phase name as primary phase display — fixes pain point 1 (phase clarity)
- [ ] Non-host read-only vote state with rule explanation — fixes pain point 2 (vote confusion)
- [ ] Word chip discoverability improvement (label prominence / tap-to-focus) — fixes pain point 3 (word findability)
- [ ] Imposter callout + winner reason visual prominence in end game screens — fixes pain point 4 (end game clarity)

### Add After Validation (v1.x)

- [ ] Phase progress stepper — add if playtests show players still ask "what phase comes next?" after v1 ships
- [ ] "Host is voting" live indicator — add if non-host confusion persists in voting phase
- [ ] Imposter's perspective narrative in personal result modal — add if end-game feel lacks emotional payoff

### Future Consideration (v2+)

- [ ] Round-by-round elimination log — requires new domain hook; justified only in multi-round sessions where players lose track of history

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Human-readable phase name in header | HIGH — directly solves confirmed pain point | LOW — change label source from enum to phaseGuide title | P1 |
| Non-host read-only vote view with rule label | HIGH — directly solves confirmed pain point | LOW — add disabled player grid + rule badge in VotingPanel non-host branch | P1 |
| Word chip discoverability (ViewerCard label emphasis) | HIGH — directly solves confirmed pain point | LOW — CSS/typography change only, no logic | P1 |
| Imposter callout in GameOverModal | HIGH — climactic moment of the game, directly solves pain point | LOW — pure presentation, data already available | P1 |
| Winner reason visual prominence | HIGH — context for win/loss, directly supports pain point 4 | LOW — layout/typography only | P1 |
| Imposter's perspective in personal result modal | MEDIUM — improves emotional payoff | LOW — `viewer.role` + `winner` already available | P2 |
| Phase progress stepper | MEDIUM — reduces "what's next?" anxiety | MEDIUM — needs phase-to-step mapping, new component | P2 |
| "Host is voting" live indicator | MEDIUM — social tension for non-hosts | LOW/MEDIUM — client-side timer or new socket event | P2 |
| Word chip tap-to-focus animation | LOW — nice polish | LOW — CSS animation on click | P3 |
| Round elimination log | MEDIUM — memory aid in multi-round games | MEDIUM — new domain hook required | P3 |

---

## Competitor Feature Analysis

Note: Direct competitor research via web search was unavailable. Analysis based on established genre conventions from Among Us, Spyfall, Werewolf (app implementations), and Jackbox party games — all well-documented in the public domain through the training cutoff.

| Feature | Among Us | Spyfall / Jackbox | This Game (current) | Our Approach |
|---------|----------|-------------------|---------------------|--------------|
| Phase indicator | Colored role card + meeting banner ("Emergency Meeting!") + task list | Explicit round timer + phase label ("Discussion") | Raw enum tag in header + buried guide title | Promote `phaseGuide[phase].title` to primary header label; color-code by phase group |
| Vote UI for non-voters | Dead players see live vote tally, grayed buttons, "Ghost" label | Non-host sees question cards but cannot answer | Single muted wait text | Read-only disabled player grid + rule explainer chip ("Host votes for the group") |
| Word/role re-access | Cannot re-read role mid-game (intentional) | Spyfall card stays visible throughout session | ViewerCard always shows word (good); popup is one-time | Add visual cue pointing to ViewerCard as persistent source; label the word display more clearly |
| End game reveal | Kill screen → "Crewmates Win/Impostors Win" banner → reveal all roles | Winner announced → spy reveals themselves | Personal modal → full table | Add imposter callout row above table; add narrative framing to personal modal |
| Win reason clarity | Task bar completion or kill-count — shown graphically | Spy guesses the location = spy wins; no location found = spy wins | `winnerReason` plain text | Increase typographic weight of `winnerReason`; consider icon prefix per reason type |

---

## Implementation Notes for the Architecture

These notes are specific to this codebase and its constraints:

1. **All 4 P1 features are presentation-only.** No changes to `domain/`, `application/`, or `infrastructure/` layers are required. All data is already available in `GameState` and selectors.

2. **Phase label change**: `phaseGuide` is already in `apps/web/src/presentation/shared/phasePresentation.ts`. The header in `ActionBoard.tsx` currently renders `gameState.phase` (the raw enum). Replacing with `phaseGuide[gameState.phase].title` is a one-line change. If the phase tag chip stays, it should show the human label, not the enum.

3. **Non-host vote view**: `VotingPanel.tsx` has a clean branch at line 34: `if (!viewerIsHost)`. Current return is a single `<p>`. Replace with a component that renders the player list as disabled chips plus a rule explainer. Keep the `onSubmitVote` prop unused for non-host — no server-side change.

4. **Word discoverability**: `ViewerCard.tsx` already shows `viewer.word`. The fix is visual emphasis — a more prominent label or a subtle animation cue for the word row. Optionally, in the first 30 seconds of `ROUND_DESCRIPTION`, pulse the word chip to draw attention to it.

5. **End game imposter callout**: `GameOverModal.tsx` has the full player table. Add a section above the table that finds `players.find(p => p.role === Role.SPY)` and renders it as a highlighted reveal. Role data is available at `GAME_ENDED` phase (server sanitization removes it otherwise).

6. **File size discipline**: `ActionBoard.tsx` is 177 lines. `GameOverModal.tsx` is 144 lines. `VotingPanel.tsx` is 103 lines. All P1 changes can be absorbed within existing files or extracted into small sub-components without approaching the 300-line limit.

---

## Sources

- Codebase analysis: `/apps/web/src/presentation/` — HIGH confidence (direct inspection)
- Game phase structure: `packages/shared/src/enums/Phase.ts` — HIGH confidence (direct inspection)
- Existing UX patterns: `phasePresentation.ts`, `VotingPanel.tsx`, `GameOverModal.tsx`, `ViewerCard.tsx` — HIGH confidence (direct inspection)
- Social deduction genre conventions (Among Us, Spyfall, Jackbox, Werewolf apps): MEDIUM confidence — well-established patterns from training data, consistent across multiple genre references

---

*Feature research for: Social deduction game UX improvements — state self-explanation milestone*
*Researched: 2026-02-28*
