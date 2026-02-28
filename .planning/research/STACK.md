# Stack Research

**Domain:** Social deduction game UX — in-game state clarity
**Researched:** 2026-02-28
**Confidence:** MEDIUM-HIGH (codebase analysis HIGH; broader UI pattern analysis MEDIUM based on training knowledge through August 2025 — web/search tools unavailable for external verification)

---

## Context: What This Research Answers

The milestone goal is *visual clarity without redesign*: players look at the screen and immediately understand what phase they are in, what action they must take, and whether they are allowed to act. Four confirmed UX blind spots exist:

1. Phase indicator is text-only (`PHASE: ROUND_VOTING`) — no visual hierarchy signal
2. Non-host sees "Waiting for host vote" but gets no visual explanation of *why* they cannot vote
3. Secret word vanishes after popup closes — no persistent reference
4. Game over result requires reading a table — not scannable at a glance

The research question is: **what UI/UX patterns and techniques best solve these problems within the existing React 19 + Tailwind + pixel-retroui stack?**

---

## Recommended Stack

### Core Technologies (Existing — No Changes Needed)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React 19 | 19.0.0 | Component rendering | Already in use; concurrent features (`startTransition`) available if rapid state updates cause stutter during voting |
| Tailwind CSS | 3.4.17 | Utility styling | Already in use; `animate-*` utilities cover all needed phase-transition animations without adding dependencies |
| pixel-retroui | 2.1.0 | Retro pixel UI components | Already in use; `ProgressBar`, `Bubble`, `Accordion` components not yet used but available — these specifically address clarity gaps |
| i18next / react-i18next | 25.8.11 / 16.5.4 | Localization | Already in use; all new copy must go through this |
| AppColor.ts | — | Design token source of truth | Already enforced; phase colors already defined in `phaseTone` — extend, do not redefine |

### Supporting Libraries (Existing — No Changes Needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS custom properties via `design-system/colors.css` | — | Runtime theme values (`var(--yellow-400)`, etc.) | Use for all dynamic bg/border values passed to pixel-retroui props; Tailwind classes for static layout |

### New Libraries to Add

**None recommended.** Every identified UX pattern can be implemented with:
- Existing pixel-retroui components (`ProgressBar`, `Bubble`, `Accordion`)
- Tailwind animate utilities (`animate-pulse`, `animate-bounce`, custom keyframes already in `uxEnhancements.css`)
- CSS `@keyframes` patterns already established (`fadeIn`, `countPop`, `modalEnter`, `blink`)
- React state (`useState`, `useEffect`) already in use everywhere

Adding an animation library (Framer Motion, Motion One) would violate the constraint "improve visual, not redesign" and create unnecessary complexity. The codebase already demonstrates capable animation authoring.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Extend existing `phasePresentation.ts` with icon/emoji maps | Add a third-party icon library (lucide-react, heroicons) | If the project expands to a full UI redesign phase — not this milestone |
| Use pixel-retroui `ProgressBar` for speaking-order progress | Build a custom SVG stepper | Only if pixel-retroui's ProgressBar lacks the styling hooks needed; check first |
| CSS-only pulse animation on restricted buttons | Tooltip library (react-tooltip, floating-ui) | If hover-based tooltips are needed on desktop; NOT recommended for mobile-first social games where players use phones |
| Persistent word display in `ViewerCard` (already has the slot) | Separate "word reminder" sticky panel | Only if `ViewerCard` is removed from the game layout; it is not |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Framer Motion / Motion One | Overkill for micro-animations already in CSS; adds 30KB+ to bundle; pixel-retroui's aesthetic is CSS-driven | Custom `@keyframes` in `uxEnhancements.css` (pattern already established) |
| react-tooltip / floating-ui | Hover-based; social deduction games played on phones — hover doesn't exist on touch; tooltip requires discovery | Visible inline state labels (lock icon + text permanently visible) |
| Lottie / rive animations | File size and runtime cost not justified for 4 UI fixes | CSS keyframes + pixel-retroui ProgressBar |
| A separate "phase stepper" component library (e.g., react-step-progress-bar) | Creates new dependency for one use case; pixel-retroui ProgressBar + custom labels achieves the same | pixel-retroui ProgressBar with phase labels below |
| Zustand / Redux for local UI state | Local phase-animation state is already managed with `useState` in `ActionBoard`; no cross-component sharing needed | Existing `useState` pattern (e.g., `phaseEnter` in `ActionBoard`) |

---

## Pattern Recommendations by UX Blind Spot

This section is the core deliverable: specific UI patterns, confidence levels, and implementation guidance within the existing stack.

---

### Pattern 1: Phase Indicator — Color Block + Icon Glyph + Human Label

**Blind spot addressed:** Players read "PHASE: ROUND_VOTING" as raw data. They need to parse what it means.

**What to do:**
Replace the current `arcade-phase-tag` (text badge only) with a three-layer signal:

1. **Color block** — full-width colored bar at the top of `ActionBoard`'s header card, using the already-defined phase colors from `phaseTone` (e.g., red for voting, yellow for description). The color communicates urgency/mood before the player reads anything.
2. **Icon glyph** — a single ASCII/Unicode character that is phase-specific (e.g., `[!]` for voting, `[>]` for description/speaking turn, `[?]` for discussion, `[+]` for lobby). No image dependency. Works with Minecraft font.
3. **Human-readable label** — use the existing `phaseGuide[phase].title` text (already maintained in `phasePresentation.ts`), not the raw enum value (`ROUND_VOTING`). This is already available but not currently shown as the prominent label.

**Why this works for social deduction games:** Among Us uses a color-coded task bar and a prominently displayed phase room name. Werewolf online games universally use a full-width banner that changes color and icon (sun/moon) when phase changes. The pattern works because it communicates through multiple channels simultaneously (color + shape + text) — players catch the change even if they're distracted by discussion.

**What NOT to do:** Do not show the raw enum string `ROUND_VOTING` to players. It is internal server state naming, not UX copy. The `phaseGuide` structure in `phasePresentation.ts` exists precisely to provide user-facing copy — use it.

**Confidence:** HIGH — the `phaseGuide` data is already authored, `phaseTone` is already mapped, `fadeIn` animation is already applied on phase change. This is assembling existing pieces, not new invention.

**Implementation within current stack:**
```tsx
// In ActionBoard.tsx header card — replace arcade-phase-tag
<div className={`arcade-phase-banner phase-banner-${gameState.phase}`}>
  <span className="arcade-phase-icon">{phaseIcon[gameState.phase]}</span>
  <span className="arcade-phase-label">{guide.title.toUpperCase()}</span>
</div>
```
Add `phaseIcon: Record<Phase, string>` to `phasePresentation.ts`. Add `.arcade-phase-banner` class to `uxEnhancements.css` or a new `phaseIndicator.css`. Keep the raw phase enum available as a smaller secondary badge for debugging / host view only.

---

### Pattern 2: Role-Restriction Affordance — Disabled State with Visible Reason

**Blind spot addressed:** Non-host during `ROUND_VOTING` sees "Waiting for host vote..." as a small muted text line. There is no visual connection between their inability to vote and *why* — they might assume it's a bug.

**What to do:**
Apply the **locked affordance pattern**: show the voting interface in a visually locked state with an inline explanation badge, rather than hiding it entirely (current: `if (!viewerIsHost) return <p>...</p>`).

Specifically:
- Show the player list buttons but render them as visually disabled (greyed, `cursor: not-allowed`, no click handler)
- Add a `[LOCKED]` or `[HOST VOTES]` badge above the grid — use the existing `arcade-phase-tag` CSS class with a lock glyph
- This communicates: "these buttons exist, I cannot press them, and here is why"

**Why this works:** The pattern is well-established in games: Dead players in Among Us see the voting interface but cannot interact. Werewolf games show the vote tally to spectators. Seeing the mechanism but being locked out teaches the rule without reading a help page. The current pattern (return null for non-host) hides the entire mechanism, which looks like the feature is missing.

**What NOT to do:** Do not add a tooltip that explains the restriction on hover — it requires discovery and doesn't work on touch screens. Do not show an error toast when a non-host attempts to vote — the CLAUDE.md rules correctly state "self-explanatory UI instead of error message."

**Confidence:** HIGH — this is a straightforward conditional rendering change in `VotingPanel.tsx`. The existing disabled button CSS (`.arcade-btn:disabled`) is already in `uxEnhancements.css`. The design system has all needed colors.

**Implementation within current stack:**
```tsx
// VotingPanel.tsx — non-host branch
if (!viewerIsHost) {
  return (
    <div className="arcade-stack arcade-locked-overlay">
      <p className="arcade-phase-tag arcade-locked-badge">
        {/* lock glyph */ }[=] {t('game.hostVotesOnly').toUpperCase()}
      </p>
      <div className="arcade-vote-grid arcade-vote-grid-locked" aria-hidden="true">
        {alivePlayers.map((player) => (
          <Button key={player.id} disabled bg="var(--neutral-700)" ...>
            {player.name.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}
```
Add `game.hostVotesOnly` key to all locale files. The locked grid is `aria-hidden` because it is decorative — screen readers should only announce the restriction label.

---

### Pattern 3: Persistent Word Reference — Always-Visible in ViewerCard

**Blind spot addressed:** After the word popup closes, the secret word lives only in `ViewerCard`'s `arcade-viewer-word-block`. However, `ViewerCard` is always rendered in the game layout — the word is already there. The gap is **discoverability**: players do not know to look there after closing the popup.

**What to do:**
Two complementary techniques:

1. **Exit message in WordRevealPopup:** When the player clicks "Ready," the button label can change briefly to "Word saved to your card" before closing. This teaches players where to look next.
2. **Pulse animation on ViewerCard word block at popup close:** When `isWordPopupOpen` transitions from `true` to `false`, trigger a one-time `animate-pulse` or the existing `countPop` keyframe on the `arcade-viewer-word-block` element. This draws the eye to the persistent location.

**Why this works:** The "closing cue" pattern is used in onboarding flows (e.g., "your settings are saved to the sidebar") to teach users where persistent state lives. It is a one-time educational moment rather than repeated noise.

**What NOT to do:** Do not add a floating sticky "reminder" widget that persists over the game board. It would obscure the action board. The word is already accessible in `ViewerCard` — the problem is attention, not absence of data.

**Confidence:** MEDIUM — the `ViewerCard` already renders the word. The animation trigger requires lifting `isWordPopupOpen` state or passing a callback. The pattern is sound but the implementation requires a small prop-threading change in `GameScreen` or a context. Verify the `onCloseWordPopup` prop chain before implementing.

**Implementation within current stack:**
```tsx
// WordRevealPopup.tsx — add exit cue
const [closing, setClosing] = useState(false);

const handleReady = () => {
  setClosing(true);
  setTimeout(onClose, 600); // let message show briefly
};

// In render:
<Button onClick={handleReady}>
  {closing ? t('wordPopup.savedToCard').toUpperCase() : t('wordPopup.ready').toUpperCase()}
</Button>
```
Add `wordPopup.savedToCard` locale key. In `GameScreen`, pass a `wordJustClosed` boolean prop to `ViewerCard` to trigger the pulse CSS class.

---

### Pattern 4: End-Game Result — Scannable Score Card, Not Data Table

**Blind spot addressed:** `GameOverModal` renders a full HTML table (`<table>`). To know if you won, a player must find their own name, read the ROLE column, then read the STATUS column. Three eye movements to answer "did I win?"

**What to do:**
Apply the **hero result + detail list** pattern:

1. **Hero section (existing, keep):** The `game-over-title` with blinking winner text is good — it answers "who won" immediately. Keep it.
2. **Viewer-first result badge:** Before the full player table, show the viewer's own result as a large badge: `VICTORY` (green glow) or `DEFEAT` (red) — full-width, prominent, answering "did I personally win?" This is the highest-priority piece of information and currently buried in the table.
3. **Role reveal with visual identity:** In the player table, the role column currently shows text (`CITIZEN`, `SPY`). Add the existing `arcade-role-spy` / `arcade-role-citizen` / `arcade-role-white` CSS classes (already defined in `components.css`) to each role cell. A role chip with color makes the spy scannable without reading.
4. **Spy word reveal:** After game end, show the spy's secret word alongside the citizens' word. "The spy's word was X / Citizens' word was Y" answers the "why did the spy win/lose?" question without requiring the `winnerReason` string to be parsed.

**Why this works:** Among Us' end screen shows "CREWMATE/IMPOSTOR" as a full-screen banner before the detailed breakdown. This is the "hero first, detail second" pattern standard in game UX. Players celebrating or lamenting do not want to parse a table — they want the verdict, then optionally the breakdown.

**What NOT to do:** Do not remove the table — it is the detail layer and useful for post-game discussion. Do not add animations to every row — the blinking title already provides motion; the table rows should be calm for readability.

**Confidence:** HIGH — all styling primitives exist (`arcade-role-spy`, `arcade-role-citizen`, victory/defeat badges). The `didPlayerWin` function is already in `GameOverModal.tsx`. The viewer-first result badge only requires knowing `playerId` (already available in scope via the game state resolution). The spy word is already in `gameState.players[n].word` at `GAME_ENDED` phase (server sends it then).

**Implementation within current stack:**
```tsx
// GameOverModal.tsx — add above the table
const viewerResult = gameState.players.find(p => p.id === playerId);
const iViewerWon = viewerResult ? didPlayerWin(viewerResult) : false;

<div className={`viewer-result-hero ${iViewerWon ? 'viewer-result-victory' : 'viewer-result-defeat'}`}>
  {iViewerWon ? t('game.victory') : t('game.defeat')}
</div>
```
Note: `GameOverModal` currently receives `gameState` and `onRestart` but not `playerId`. Add `playerId` as a prop — it is available at the `GameScreen` / `App` level.

---

### Pattern 5: Phase Flow Orientation — Speaking-Order Progress Bar

**Blind spot addressed:** During `ROUND_DESCRIPTION`, the player list shows who has spoken (implicitly, by whose statement is non-null) but there is no explicit "X of Y players have spoken" progress indicator. Players cannot tell at a glance how much time remains in this phase.

**What to do:**
Use the existing **pixel-retroui `ProgressBar` component** (imported but not yet used in the game screen) to show speaking progress. Position it within the `arcade-status-box` in `ActionBoard` during `ROUND_DESCRIPTION` phase only.

```
ROUND_DESCRIPTION — progress: (totalAlive - pendingSpeakers) / totalAlive
```

**Why this works:** Progress bars are the standard social deduction pattern for phase completion (tabletop Werewolf uses a visible "turn order" track; Among Us uses a task bar for total task completion). Knowing "3 of 6 players left to speak" reduces anxiety and helps the host know when to expect voting.

**What NOT to do:** Do not add the progress bar for all phases — it only has meaningful semantics during speaking-order phases. During `ROUND_VOTING` the `voteRound` counter already serves this role.

**Confidence:** MEDIUM — `ProgressBar` from pixel-retroui exists and accepts `progress: number (0-100)`, `color`, `borderColor`. Implementation is straightforward. However, the speaking-order count must be derived from `pendingSpeakerIds.length` vs `alivePlayers.length` — verify this accurately reflects remaining speakers (it does, based on the `gameRules.ts` logic).

**Implementation within current stack:**
```tsx
// In ActionBoard.tsx, inside the status box for ROUND_DESCRIPTION
import { ProgressBar } from 'pixel-retroui';

const spokenCount = alivePlayers.length - gameState.pendingSpeakerIds.length;
const speakingProgress = Math.round((spokenCount / alivePlayers.length) * 100);

{gameState.phase === Phase.ROUND_DESCRIPTION && (
  <ProgressBar
    progress={speakingProgress}
    color="var(--yellow-400)"
    borderColor="var(--blue-500)"
    size="sm"
  />
)}
```

---

## Stack Patterns by Variant

**If implementing only the 4 active requirements (no bonus patterns):**
- Patterns 1, 2, 3, 4 are direct. Pattern 5 (ProgressBar) is a bonus, defer if time-constrained.

**If the game expands to more phases:**
- The `phaseGuide` and `phaseTone` maps in `phasePresentation.ts` are the right abstraction — add new entries there. Do not hardcode phase strings in JSX.

**If the non-host experience needs more depth:**
- The `Bubble` component from pixel-retroui (`direction: "left" | "right"`) could render player statements as speech bubbles in the players panel — more immersive, same data. This is a differentiator for a later UX iteration.

**If `ROUND_RESULT` / `WHITE_TRANSITION` phases feel confusing:**
- These are transient phases (server resolves them quickly). Consider auto-advancing with a brief animated interstitial rather than a static status card. Use the existing `countPop` keyframe as the animation base.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| pixel-retroui 2.1.0 | React 19.0.0 | Confirmed — `ProgressBar`, `Bubble`, `Accordion` all export from `dist/components/index.d.ts`; no peer dependency conflicts observed |
| Tailwind 3.4.17 | postcss 8.5.3 / autoprefixer 10.4.20 | Confirmed in `tailwind.config.ts` and `postcss.config.js` — no changes needed |

---

## What the Existing Stack Already Does Well (Do Not Change)

| Feature | Current Implementation | Assessment |
|---------|----------------------|------------|
| Phase transition animation | `arcade-action-enter` / `fadeIn` keyframe in `ActionBoard` | Good — 350ms, subtle. Keep as-is. |
| Word popup reveal ceremony | Full-screen countdown (`countPop`) then `Popup` component | Good UX pattern — the ceremony creates moment. Keep. |
| Speaker highlight | `arcade-speaker` CSS class (yellow border + glow) in `PlayersPanel` | Correct — glanceable. Keep. |
| Eliminated player dim | `arcade-player-eliminated` opacity 0.4 in `PlayersPanel` | Correct — passive, non-distracting. Keep. |
| Role color coding | `arcade-role-spy` (red), `arcade-role-citizen` (green), `arcade-role-white` (purple) | Defined in `components.css` but only used in `GameOverModal`. Extend to ViewerCard and result hero. |
| Two-step vote UX | Select → highlight → Submit button in `VotingPanel` | Correct pattern per CLAUDE.md rules. Keep. |

---

## Sources

- Codebase analysis (HIGH confidence): Direct inspection of `apps/web/src/presentation/` components, `phasePresentation.ts`, `AppColor.ts`, `uxEnhancements.css`, `components.css`, `VotingPanel.tsx`, `ActionBoard.tsx`, `GameOverModal.tsx`, `GameScreen.tsx`, `PlayersPanel.tsx`, `ViewerCard.tsx`, `WordRevealPopup.tsx`
- pixel-retroui 2.1.0 component API (HIGH confidence): `node_modules/pixel-retroui/dist/components/index.d.ts` and individual `.d.ts` files — `ProgressBar`, `Bubble`, `Accordion` are available and unused
- `PROJECT.md` requirements (HIGH confidence): Four active UX blind spots confirmed
- `CONCERNS.md` (HIGH confidence): Known bug on word popup triggering informs Pattern 3 design
- Social deduction game UX patterns (MEDIUM confidence): Training knowledge through August 2025; Among Us (2018-2024), Werewolf/Mafia online platforms (Netgames.io, BoardGameArena) — web search unavailable for external verification of current patterns
- Game accessibility and self-explanatory UI patterns (MEDIUM confidence): Nielsen Norman Group heuristics (visibility of system status, error prevention via affordances, recognition over recall) applied to game context — training knowledge, not verified against current NNG articles

---

*Stack research for: Imposter Game — Social Deduction Game UX Clarity Milestone*
*Researched: 2026-02-28*
