# Phase 4: Word Discoverability - Research

**Researched:** 2026-03-09
**Domain:** Frontend presentation — popup closing cue, ViewerCard eye-icon mini popup, CSS animation
**Confidence:** HIGH

## Summary

This phase is entirely presentation-layer work within `apps/web/src/presentation`. The existing codebase already has the foundation: `canViewerSeeWord` selector (Phase 1), `WordRevealPopup` with `onClose` callback, and `ViewerCard` displaying the secret word. The work involves three changes: (1) add a closing cue to `WordRevealPopup` before dismissing, (2) add a one-time pulse/highlight on ViewerCard's word block after popup closes, and (3) add an eye icon button on ViewerCard that shows a mini popup with the secret word during DISCUSSION and VOTING phases.

No server changes are needed. No new dependencies are required — the project already uses `pixel-retroui` (Button, Card, Popup) and `react-i18next`. The eye icon can use an inline SVG or emoji character. The mini popup is a small positioned element near the ViewerCard, not a full-screen overlay.

**Primary recommendation:** Implement all three features by modifying `WordRevealPopup.tsx`, `ViewerCard.tsx`, and `GameScreen.tsx` (prop threading), plus CSS additions in `components.css` and i18n key additions in all 4 locale files.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- A eye icon button is placed on the player's own ViewerCard
- Tapping the icon shows the word in a mini popup near the card (not inline text, not a full-screen overlay)
- The word is hidden by default — the player must tap the eye icon to reveal it (protects against screen-peeking)
- This button/icon is visible during DISCUSSION and VOTING phases

### Claude's Discretion
- Closing cue behavior (text, animation, duration) when the Word Reveal popup dismisses
- ViewerCard one-time pulse/highlight visual design after popup closes
- Mini popup styling, positioning, and auto-dismiss behavior
- Whether the mini popup stays open until manually dismissed or auto-closes

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WORD-01 | After closing Word Reveal popup, player can reopen their secret word anytime via icon/button on screen | Eye icon on ViewerCard with mini popup; `canViewerSeeWord` selector gates visibility; local state toggle in ViewerCard |
| WORD-02 | Button to view secret word visible during DISCUSSION and VOTING phases | Phase guard using `canViewerSeeWord` (returns true when viewer has word and game is not over); covers ROUND_DESCRIPTION, ROUND_DISCUSSION, ROUND_VOTING and other mid-game phases |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.x | Component rendering, useState for mini popup toggle | Already in project |
| pixel-retroui | current | Card, Button, Popup primitives | Already used across all UI |
| react-i18next | current | i18n for closing cue text, tooltip labels | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @imposter/shared | monorepo | Phase enum for phase guards | Already used for canViewerSeeWord |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG eye icon | Icon library (lucide, heroicons) | Not worth adding a dependency for 1 icon; inline SVG or emoji keeps bundle small |
| pixel-retroui Popup for mini popup | Custom positioned div | Mini popup is too small for full Popup component; a simple absolutely-positioned div with existing arcade styling is more appropriate |

**Installation:**
No new packages needed.

## Architecture Patterns

### Recommended Changes

```
apps/web/src/
  domain/utils/gameSelectors.ts          # canViewerSeeWord already exists (no changes)
  presentation/
    word-reveal/WordRevealPopup.tsx       # Add closing cue before dismiss
    game/ViewerCard.tsx                   # Add eye icon + mini popup + pulse animation
    game/GameScreen.tsx                   # Thread wordJustClosed state for pulse trigger
    styles/components.css                 # Add pulse keyframes + mini popup + eye icon styles
    locales/{en,vi,ko,zh}.json           # Add i18n keys for closing cue and eye icon label
```

### Pattern 1: Closing Cue on WordRevealPopup
**What:** When user taps "Ready!", show a brief text cue ("Word saved to your card") before calling `onClose`.
**When to use:** Exactly when the popup dismisses.
**Implementation approach:**
- Add a `closingCue` state to `WordRevealPopup`
- On "Ready!" click: set `closingCue = true`, show cue text with fade animation
- After a short delay (1.2-1.5s), call `onClose()`
- The cue text replaces the popup content briefly (same Popup container, different content)

```typescript
// In WordRevealPopup.tsx
const [isClosing, setIsClosing] = useState(false);

const handleReady = () => {
  setIsClosing(true);
  setTimeout(() => onClose(), 1200);
};

// Render: if isClosing, show cue text; else show word + Ready button
```

### Pattern 2: One-Time Pulse on ViewerCard Word Block
**What:** After the WordRevealPopup closes, the word block on ViewerCard pulses once to draw attention.
**When to use:** Immediately after popup closes — triggered by a `wordJustRevealed` prop.
**Implementation approach:**
- `GameScreen` manages a `wordJustRevealed` state, set to `true` when `onCloseWordPopup` fires, auto-resets after animation
- `ViewerCard` receives `wordJustRevealed` prop, applies CSS class `arcade-viewer-word-block--pulse` conditionally
- CSS keyframe animation runs once (e.g., 1.5s border-glow + scale pulse)

```typescript
// In GameScreen — new state
const [wordJustRevealed, setWordJustRevealed] = useState(false);

const handleCloseWordPopup = () => {
  onCloseWordPopup();
  setWordJustRevealed(true);
  setTimeout(() => setWordJustRevealed(false), 1500);
};
```

### Pattern 3: Eye Icon with Mini Popup on ViewerCard
**What:** An eye icon button on ViewerCard that toggles a small popup showing the secret word.
**When to use:** During DISCUSSION and VOTING phases (guarded by `canViewerSeeWord`).
**Implementation approach:**
- Import `canViewerSeeWord` from domain selectors
- ViewerCard needs `gameState` prop (or a derived `canSeeWord` boolean) to gate the eye icon
- Local `useState<boolean>` for mini popup open/close
- Mini popup is an absolutely-positioned div relative to the word block
- Auto-dismiss after 3-4 seconds OR manual close on second tap (recommend: auto-dismiss for screen-peek protection)

```typescript
// In ViewerCard.tsx
const [isMiniWordOpen, setIsMiniWordOpen] = useState(false);

// Eye icon button (only when canSeeWord is true)
{canSeeWord && (
  <button
    className="arcade-eye-btn"
    onClick={() => setIsMiniWordOpen((prev) => !prev)}
    aria-label={t('game.peekWord')}
  >
    {/* Eye SVG or emoji */}
  </button>
)}

// Mini popup
{isMiniWordOpen && (
  <div className="arcade-mini-word-popup">
    <span>{viewer.word}</span>
  </div>
)}
```

### Anti-Patterns to Avoid
- **Re-triggering WordRevealPopup:** The `shownWordMarkerRef` prevents re-showing. Do NOT try to reset this ref or re-open the full popup. Use the mini popup instead.
- **Showing word inline on ViewerCard permanently:** User decision requires tap-to-reveal (screen-peek protection). Never display word text without user action.
- **Adding game logic in ViewerCard:** The `canViewerSeeWord` selector already handles the logic. ViewerCard should only consume the boolean result.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase visibility guard | Custom phase checks in ViewerCard | `canViewerSeeWord` from gameSelectors | Already tested, handles edge cases (no viewer, no word, game over) |
| Popup overlay | Full-screen modal for word peek | Small positioned div near ViewerCard | User decision: mini popup, not overlay |
| Icon rendering | Icon library import | Inline SVG (15 lines) or text emoji | One icon does not justify a dependency |

## Common Pitfalls

### Pitfall 1: WordRevealPopup onClose Timing
**What goes wrong:** If the closing cue delay fires AFTER the component unmounts (e.g., phase changes), the `onClose` callback may error or be stale.
**Why it happens:** The popup is conditionally rendered in GameScreen: `{isWordPopupOpen && viewer?.word && gameState.round === 1 && ...}`.
**How to avoid:** Clear the timeout on unmount via `useEffect` cleanup. Return a cleanup function from the timeout setup.
**Warning signs:** Console warnings about state updates on unmounted components.

### Pitfall 2: ViewerCard Prop Threading
**What goes wrong:** ViewerCard currently only receives `viewer` and `isGameOver`. Adding `canSeeWord` and `wordJustRevealed` requires updating the prop chain through GameScreen.
**Why it happens:** Props flow: App -> GameScreen -> ViewerCard.
**How to avoid:** Pass `gameState` to ViewerCard (it already receives `viewer` derived from gameState) OR pass pre-computed booleans. Pre-computed booleans are preferred to keep ViewerCard simple.
**Warning signs:** ViewerCard importing gameState directly would violate the prop-passing pattern used everywhere.

### Pitfall 3: Mini Popup Positioning on Mobile
**What goes wrong:** Absolutely-positioned popup may overflow viewport on small screens.
**Why it happens:** ViewerCard is in a CSS grid (`arcade-grid-game`). Absolute positioning relative to the card may push content off-screen.
**How to avoid:** Use `position: absolute` relative to the word-block container. Add `right: 0` or center it. Test on narrow viewport (320px).
**Warning signs:** Popup clipped or overlapping other cards.

### Pitfall 4: Auto-Dismiss vs Manual Close
**What goes wrong:** If auto-dismiss timer fires while user is reading, they must tap again. If manual-only, user forgets to close and word stays visible (screen-peek risk).
**How to avoid:** Recommend auto-dismiss after 3 seconds with a visual countdown (opacity fade). User can also tap eye icon again to close immediately.

## Code Examples

### Closing Cue Text (i18n keys to add)
```json
{
  "wordPopup": {
    "ready": "Ready!",
    "closingCue": "Word saved to your card"
  },
  "game": {
    "peekWord": "Peek at your word"
  }
}
```

### CSS Pulse Animation
```css
/* One-time pulse on word block after popup closes */
@keyframes word-pulse {
  0% { box-shadow: 0 0 0 0 var(--yellow-400); }
  50% { box-shadow: 0 0 12px 4px var(--yellow-400); }
  100% { box-shadow: 0 0 0 0 var(--yellow-400); }
}

.arcade-viewer-word-block--pulse {
  animation: word-pulse 1.5s ease-out 1;
}
```

### Eye Icon Button CSS
```css
.arcade-eye-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.arcade-eye-btn:hover {
  opacity: 1;
}
```

### Mini Word Popup CSS
```css
.arcade-mini-word-popup {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  padding: 8px 14px;
  background: var(--surface-primary);
  border: 2px solid var(--yellow-400);
  color: var(--yellow-300);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.1em;
  white-space: nowrap;
  z-index: 10;
  animation: mini-popup-in 0.2s ease-out;
}

@keyframes mini-popup-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Word only visible in popup | Word also on ViewerCard word-block | Since project start | ViewerCard already shows word — but no re-peek mechanism exists |
| No popup closing feedback | Adding closing cue | This phase | Player gets confirmation word is accessible elsewhere |

## Open Questions

1. **Eye icon visual: SVG vs emoji?**
   - What we know: Project uses no icon library. pixel-retroui has Button but no icon set.
   - Recommendation: Use a simple inline SVG eye icon (16x16). Fallback: use Unicode eye character. SVG preferred for consistent styling across platforms.

2. **Auto-dismiss duration for mini popup**
   - What we know: User left this to Claude's discretion.
   - Recommendation: 3-second auto-dismiss with opacity fade-out in last 0.5s. Tap eye icon again to close immediately. This balances readability with screen-peek protection.

3. **ViewerCard word-block already shows the word**
   - What we know: `arcade-viewer-word` currently displays `viewer.word` at all times (except when word is null, shows "Word will be revealed when the game starts").
   - What's unclear: Should the always-visible word in the word-block be hidden when the eye icon mechanism is added? The CONTEXT.md says "word is hidden by default — player must tap eye icon to reveal."
   - Recommendation: During DISCUSSION/VOTING, replace the word text in the word-block with a masked value (e.g., "***") and require eye icon tap to reveal via the mini popup. This aligns with the screen-peek protection decision. During other phases, keep current behavior.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `WordRevealPopup.tsx`, `ViewerCard.tsx`, `GameScreen.tsx`, `App.tsx`, `useGatewayEvents.ts`, `gameSelectors.ts`, `phasePresentation.ts`, `components.css`, `en.json`
- `@imposter/shared` Phase enum — all phase values verified
- `canViewerSeeWord` selector — already tested in `gameSelectors.test.ts`

### Secondary (MEDIUM confidence)
- CSS animation patterns (keyframes, one-time animation) — standard CSS3, well-supported

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing tools
- Architecture: HIGH - clear prop chain, existing selectors, minimal files touched
- Pitfalls: HIGH - identified from direct codebase reading (shownWordMarkerRef pattern, prop chain, mobile positioning)

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable — presentation-only changes, no external API dependencies)
