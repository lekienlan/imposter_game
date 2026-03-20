# Phase 05: End Game Clarity - Research

**Researched:** 2026-03-18
**Domain:** React presentation layer — end-game modal restructure, CSS animation, i18n
**Confidence:** HIGH

## Summary

Phase 5 is a pure presentation-layer improvement to two existing components: `GameEndRoleRevealModal` (step 1 — personal result) and `GameOverModal` (step 2 — scoreboard). No server changes, no new socket events, no new domain selectors are required.

The primary change is reversing the order in step 1 from Role-first → VICTORY/DEFEAT-first, applying the `blinking-text` CSS class to the result text, and wiring a 4-second auto-advance timer with fade transition. In step 2, the player table needs three visual layers: viewer's own row highlighted, Spy row highlighted with a red border, White row highlighted with a gray/neutral treatment, and a "You(Name)" prefix on the viewer's row. All row-level styling already uses CSS class patterns consistent with `row-winner`/`row-loser`.

All existing utilities (`didPlayerWin`, `getRoleLabel`, `getRoleColorClass`) are already correct and reusable. The `blinking-text` keyframe is already defined in `components.css`. The i18n infrastructure (EN/VI/KO/ZH) is in place and just needs new keys for "You(Name)" format and "Continue" if not already present.

**Primary recommendation:** Restructure the two existing modal components directly — step 1 reorders content and adds auto-advance, step 2 enriches the table rows. Add CSS classes for new row highlights to `uxEnhancements.css` to keep `components.css` under the 300-line constraint.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**End screen flow**
- Keep the two-step reveal: step 1 shows personal result, step 2 shows full scoreboard
- Transition: fade swap — step 1 fades out (200ms), step 2 fades in (200ms)
- Step 1 auto-advances after ~4 seconds, but Continue button is available for immediate tap
- Step 2 player table appears all at once — no row-by-row animation

**Personal result prominence**
- Step 1 leads with VICTORY/DEFEAT first in large text, role shown below it (current modal has role first — reverse this)
- VICTORY/DEFEAT uses blinking arcade text (reuse existing `blinking-text` CSS class)
- Colors: green for victory, red for defeat (matches existing badge colors)
- On step 2 scoreboard: viewer's own row is highlighted with distinct background/border so they can find themselves instantly

**Spy reveal treatment**
- Spy row in the table gets a distinct red border/background highlight — not a separate callout section
- White role also gets highlighted with its own distinct styling (gray/white treatment)
- Spy row includes a 🕵️ emoji next to the SPY role label
- Viewer's row shows "You(Name)" format instead of just the name, for instant self-identification (e.g., "▶ You(Bob)")

### Claude's Discretion
- Winner reason display styling and placement (not discussed — keep current approach or improve as seen fit)
- Exact highlight colors/borders for Spy and White rows
- Auto-advance timer exact duration (3-5s range)
- Animation easing curves for fade transition

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| END-01 | End screen displays win/loss prominently: "Citizens Win" or "Spy Wins" with strong visual | `getWinnerTitle`/`getWinnerColor` already implemented in `GameOverModal`; `blinking-text` class already on `.game-over-title`; no code change needed for this core display |
| END-02 | End screen reveals all players' roles (Spy / Citizen / White) with role colors | `getRoleLabel` + `getRoleColorClass` already used in `GameOverModal` table; Spy emoji and row highlights are the new additions needed |
| END-03 | End screen shows viewer's personal win/lose status prominently — without scanning rows | Step 1 restructure: swap order to VICTORY/DEFEAT first; step 2 viewer row highlight with "You(Name)" satisfies both phases of clarity |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | (project) | Component rendering | Project standard |
| react-i18next | (project) | Translation hook `useTranslation` | All UI text must go through `t()` |
| pixel-retroui | (project) | `Card` + `Button` components | All existing modals use this — keep visual consistency |
| Tailwind CSS | (project) | Utility classes for role colors | `getRoleColorClass` returns Tailwind text-* classes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@imposter/shared` | (monorepo) | `Role`, `Winner`, `Player`, `GameState` types | Always — never redefine these |

### Alternatives Considered
None applicable — this phase is UI-only modification of existing components, no library choices involved.

---

## Architecture Patterns

### Recommended Project Structure

No new directories needed. Changes are confined to:

```
apps/web/src/
├── presentation/
│   ├── game-over/
│   │   ├── GameEndRoleRevealModal.tsx   # step 1 — restructure content + auto-advance
│   │   └── GameOverModal.tsx            # step 2 — table row highlights + viewer row
│   └── styles/
│       └── uxEnhancements.css           # new CSS classes for row highlights
├── domain/
│   └── utils/
│       └── gameSelectors.ts             # NO CHANGES NEEDED
└── presentation/
    └── locales/
        └── {en,vi,ko,zh}.json           # new i18n keys for "you" label format
```

### Pattern 1: Step 1 Auto-Advance with useEffect Timer

**What:** `useEffect` in `GameEndRoleRevealModal` sets a 4-second timeout that calls `onClose`, with cleanup on unmount. The Continue button calls `onClose` immediately.

**When to use:** Whenever a UI step should advance automatically but allow early skip.

**Example:**
```typescript
// GameEndRoleRevealModal.tsx — timer pattern consistent with closingTimerRef in WordRevealPopup
useEffect(() => {
  const timer = setTimeout(() => {
    onClose();
  }, 4000); // within the 3-5s discretion range
  return () => clearTimeout(timer);
}, [onClose]);
```

### Pattern 2: Fade Swap in App.tsx

**What:** The fade transition between step 1 and step 2 is managed in `App.tsx` where `isRoleRevealOpen` controls which modal is shown. A CSS fade-out class can be applied when closing step 1, and the existing `modalEnter` keyframe on `.arcade-game-over-modal` handles step 2's fade-in.

**When to use:** The `modalEnter` animation (0.4s) already plays when `GameOverModal` mounts. For the step 1 fade-out, a brief CSS opacity transition on the backdrop suffices.

**Existing CSS to reuse:**
```css
/* Already in components.css — plays automatically on GameOverModal mount */
@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.8) translateY(20px); }
  to   { opacity: 1; transform: scale(1)  translateY(0); }
}
```

For step 1 fade-out: a simple `opacity: 0; transition: opacity 200ms` CSS class applied right before `onClose()` fires (via a short `setTimeout` of 200ms after the 4s timer) is sufficient and consistent with existing patterns.

### Pattern 3: Viewer Row Self-Identification

**What:** In the `GameOverModal` table, compare each `player.id` against the `viewer.id` prop. If they match, prepend "You(Name)" and apply a distinct highlight CSS class.

**When to use:** The `viewer` prop already exists in `GameEndRoleRevealModal` — pass it down to `GameOverModal` as well (currently `GameOverModal` does not receive `viewer`).

**Key change:** `GameOverModal` currently takes `{ gameState, onRestart }`. It needs `viewer: Player | undefined` added to its Props.

**Example:**
```typescript
// GameOverModal.tsx — viewer prop addition
interface Props {
  gameState: GameState;
  viewer: Player | undefined;  // ADD THIS
  onRestart?: () => void;
}

// In table row render:
const isViewer = player.id === viewer?.id;
const isSpy = player.role === Role.SPY;
const isWhite = player.role === Role.WHITE;

<tr
  key={player.id}
  className={`
    ${isWinner ? 'row-winner' : 'row-loser'}
    ${isViewer ? 'row-viewer' : ''}
    ${isSpy ? 'row-spy' : ''}
    ${isWhite ? 'row-white' : ''}
  `}
>
  <td className="player-name">
    {isViewer ? `${t('game.youLabel', { name: player.name })}` : player.name}
  </td>
  <td className={`player-role ${getRoleColorClass(player.role)}`}>
    {isSpy ? '🕵️ ' : ''}{t(`role.${player.role?.toLowerCase() ?? 'unknown'}`)}
  </td>
  ...
</tr>
```

### Anti-Patterns to Avoid

- **Passing `viewer` through `GameScreen` → `ActionBoard` chain for end-game modals:** The modals are rendered in `App.tsx` directly, not inside `GameScreen`. Viewer is already available in `App.tsx` scope — just pass it to `GameOverModal` at the call site.
- **Creating a new component for the "You" label:** It is just a conditional string interpolation inside an existing `<td>`, not a separate component.
- **Splitting GameOverModal into two files prematurely:** At 106 lines, `GameOverModal.tsx` has room to grow. No split is needed unless it exceeds 300 lines.
- **Adding CSS to `components.css` directly:** At 632 lines, `components.css` already has large blocks. New end-game row classes belong in `uxEnhancements.css` under a clearly labeled section comment.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timer with cleanup | Custom timer manager | `useEffect` + `clearTimeout` | Simple, idiomatic React — already used in `WordRevealPopup` closingTimerRef pattern |
| Role color mapping | New switch/map | `getRoleColorClass(player.role)` | Already verified and tested in `gameSelectors.ts` |
| Win/loss determination | New logic | `didPlayerWin(player, gameState.winner)` | Already tested in `gameSelectors.test.ts` |
| Role label text | New strings | `t('role.citizen')` etc. via i18n | Role namespace already complete in all 4 locales |

---

## Common Pitfalls

### Pitfall 1: Forgetting `viewer` Prop in GameOverModal

**What goes wrong:** `GameOverModal` currently receives no `viewer` prop. The viewer row highlight and "You(Name)" label require knowing which row is the viewer.

**Why it happens:** When the component was first written, viewer self-identification was not a requirement.

**How to avoid:** Add `viewer: Player | undefined` to `GameOverModal` Props interface and pass it from `App.tsx` (already available there as `const viewer = getViewer(gameState, playerId)`).

**Warning signs:** TypeScript error on the call site in `App.tsx` if prop is not added.

### Pitfall 2: useEffect Cleanup for Auto-Advance Timer

**What goes wrong:** If the user taps Continue before the timer fires and the component unmounts, the `onClose()` can be called on an already-unmounted component.

**Why it happens:** `setTimeout` callback executes after unmount if not cleaned up.

**How to avoid:** Return `clearTimeout` from the `useEffect` — same pattern used in `WordRevealPopup` for `closingTimerRef`.

**Warning signs:** React warning about "state update on unmounted component" in dev console.

### Pitfall 3: "Continue" i18n key already exists

**What goes wrong:** Accidentally adding a duplicate `continue` key or adding it under the wrong namespace.

**Why it happens:** `game.continue` is already used in the existing `GameEndRoleRevealModal` — check all 4 locale files before adding.

**How to avoid:** Search locale files before adding — `game.continue` is used for the Continue button. Only new keys needed are for the "You(Name)" label format (e.g., `game.youLabel`).

### Pitfall 4: CSS class naming collision

**What goes wrong:** Row highlight class names (`row-spy`, `row-viewer`) clash with existing class names.

**Why it happens:** `components.css` already defines `.row-winner` and `.row-loser`.

**How to avoid:** Add new row classes in `uxEnhancements.css` under a `/* Phase 5: End Game Clarity */` comment block. Use names that do not overlap with existing classes.

### Pitfall 5: i18n key for "You(Name)" format

**What goes wrong:** Using string concatenation `"You(" + name + ")"` directly bypasses i18n and breaks in non-Latin languages where the format may differ.

**Why it happens:** Shortcut to avoid adding an i18n key.

**How to avoid:** Use `t('game.youLabel', { name: player.name })` with the interpolation pattern. Add to all 4 locale files: `"youLabel": "▶ You({{name}})"` in EN, and locale-appropriate equivalents in VI/KO/ZH.

---

## Code Examples

### Verified: Auto-advance timer pattern (from existing codebase)
```typescript
// Source: apps/web/src/presentation/word-reveal/WordRevealPopup.tsx (closingTimerRef pattern)
// Adapted for GameEndRoleRevealModal:
useEffect(() => {
  const timer = setTimeout(() => {
    onClose();
  }, 4000);
  return () => clearTimeout(timer);
}, [onClose]);
```

### Verified: Viewer row identification pattern
```typescript
// Source: apps/web/src/domain/utils/gameSelectors.ts (getViewer)
// In GameOverModal table body:
{gameState.players.map((player) => {
  const isWinner = didPlayerWin(player, gameState.winner);
  const isViewer = player.id === viewer?.id;
  const isSpy = player.role === Role.SPY;
  const isWhite = player.role === Role.WHITE;
  return (
    <tr
      key={player.id}
      className={[
        isWinner ? 'row-winner' : 'row-loser',
        isViewer ? 'row-viewer' : '',
        isSpy ? 'row-spy' : '',
        isWhite ? 'row-white' : '',
      ].filter(Boolean).join(' ')}
    >
      <td className="player-name">
        {isViewer ? t('game.youLabel', { name: player.name }) : player.name}
      </td>
      <td className={`player-role ${getRoleColorClass(player.role)}`}>
        {isSpy && '🕵️ '}{getRoleLabel(player.role)}
      </td>
      ...
    </tr>
  );
})}
```

### Verified: Step 1 restructured content order
```typescript
// GameEndRoleRevealModal.tsx — VICTORY/DEFEAT first, role second
// Current order: role label → role name → status → continue
// New order: victory/defeat badge → role name → continue

<div className="game-over-header role-reveal-header">
  {/* 1. Personal result — prominent, blinking */}
  <span className={`status-badge blinking-text ${viewerWon ? 'victory-badge' : 'defeat-badge'}`}
        style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}>
    {(viewerWon ? t('game.victory') : t('game.defeat')).toUpperCase()}
  </span>
  {/* 2. Role reveal — below result */}
  <p className="role-reveal-label">{t('game.role').toUpperCase()}</p>
  <p className={`role-reveal-role ${getRoleColorClass(viewer?.role ?? null)}`}>
    {getRoleLabel(viewer?.role ?? null).toUpperCase()}
  </p>
</div>
```

### Verified: New CSS row highlight classes (add to uxEnhancements.css)
```css
/* Phase 5: End Game Clarity — row highlights */

/* Viewer's own row — border-left accent for instant self-ID */
.row-viewer {
  border-left: 4px solid var(--yellow-400);
  background: color-mix(in srgb, var(--surface-primary) 75%, var(--yellow-900));
}

/* Spy row — red border/background */
.row-spy {
  border-left: 4px solid var(--red-400);
  background: color-mix(in srgb, var(--surface-primary) 75%, var(--red-900));
}

/* White role row — neutral/gray treatment */
.row-white {
  border-left: 4px solid var(--neutral-400);
  background: color-mix(in srgb, var(--surface-primary) 85%, var(--neutral-900));
}
```

### Verified: i18n keys to add (all 4 locales)
```json
// en.json — game namespace additions
"youLabel": "▶ You({{name}})",
"continue": "CONTINUE"   // CHECK — already exists if not
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Role first in step 1 | VICTORY/DEFEAT first | This change is the core of END-03 |
| No viewer row highlight | Yellow border-left + background on viewer row | Instant self-identification |
| SPY shown with no distinction | SPY emoji + red border | Visual prominence per END-02 |
| No auto-advance | 4s auto-advance + Continue button | Reduces friction for fast-play groups |

---

## Open Questions

1. **`game.continue` key existence across locales**
   - What we know: `game.continue` is used in current `GameEndRoleRevealModal` button. It appears in `en.json` only if already there.
   - What's unclear: The en.json read above does not show a `continue` key under `game`. The button in the existing modal uses `t('game.continue', 'CONTINUE')` with a fallback — so the key is missing from locale files.
   - Recommendation: Add `"continue": "CONTINUE"` (and equivalents) to all 4 locale files in the same plan that modifies the modal.

2. **`getRoleLabel` returns raw strings (not i18n keys)**
   - What we know: `getRoleLabel` returns `'CITIZEN'`, `'SPY'`, `'WHITE ROLE'`, `'UNKNOWN'` as hardcoded English strings. The `role.*` i18n namespace exists but is not used by this function (per STATE.md decision: "getRoleLabel returns plain string constants, not t() calls").
   - What's unclear: The spy row emoji needs to work alongside the existing `getRoleLabel` output. Should `getRoleLabel` change?
   - Recommendation: Do not change `getRoleLabel`. In the table, use `{isSpy && '🕵️ '}{getRoleLabel(player.role)}` — emoji prepended directly. This follows the pattern of components calling t() themselves while keeping domain i18n-free.

---

## Sources

### Primary (HIGH confidence)
- Direct code read: `apps/web/src/presentation/game-over/GameOverModal.tsx` — current implementation, 106 lines
- Direct code read: `apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx` — current implementation, 56 lines
- Direct code read: `apps/web/src/presentation/styles/components.css` (lines 415-575) — existing CSS classes and keyframes
- Direct code read: `apps/web/src/domain/utils/gameSelectors.ts` — `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`
- Direct code read: `apps/web/src/presentation/App.tsx` — modal mounting logic and state management
- Direct code read: all 4 locale files — i18n key inventory

### Secondary (MEDIUM confidence)
- Inferred from `STATE.md` accumulated decisions: "getRoleLabel returns plain string constants, not t() calls"
- Inferred from existing patterns: `closingTimerRef` in `WordRevealPopup` establishes the timer-with-cleanup convention

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed by direct file reads
- Architecture: HIGH — all components exist and are fully read; change scope is clear
- Pitfalls: HIGH — all pitfalls derived from actual code state, not speculation

**Research date:** 2026-03-18
**Valid until:** 60 days (stable codebase, no external dependencies involved)
