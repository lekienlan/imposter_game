# Phase 2: Phase Clarity - Research

**Researched:** 2026-03-01
**Domain:** React i18n (react-i18next), Tailwind CSS, presentation-layer refactor
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Phase label lives in the **top bar** (ActionBoard's head card) — always visible, never blocks content
- Style: **pill badge / small tag**, shares space with existing room-code + share-button elements
- Phase colors by mood:
  - WAITING (GAME_CREATION / WAITING_FOR_PLAYERS): xanh lá / neutral
  - WORD_REVEAL (ROLE_DISTRIBUTION): vàng / amber
  - DISCUSSION (ROUND_DESCRIPTION / ROUND_DISCUSSION): xanh dương
  - VOTING (ROUND_VOTING): đỏ / cam
  - ENDED (GAME_ENDED): **do not show** — modal covers screen
  - WORD_REVEAL phase (ROLE_DISTRIBUTION): **do not show badge** — popup covers screen
- Display text: **short Vietnamese name** (Chờ • Tiết lộ từ • Thảo luận • Bầu chọn • Kết thúc)
- Host and non-host see the **same phase label**; only action guidance differs
- Action guidance position: **below phase badge** in top bar
- Action guidance shown in **all 5 visible phases** — never empty
- Format: **1 short line**, role-differentiated for WAITING and VOTING
- **No animation** on phase change — instant swap
- All text must go through i18n `t()` — no hardcoded Vietnamese in JSX

### Claude's Discretion

- Icon accompanying badge (emoji or not)
- Exact wording of guidance text (within 1-line Vietnamese constraint)
- Flash / transition animation on phase change (deferred to v2 anyway)
- Typography size and spacing within the top bar

### Deferred Ideas (OUT OF SCOPE)

- Animation on phase transition (fade/slide) — logged as v2 PHASE-03
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PHASE-01 | Player sees a prominent human-readable phase label (not a raw enum string) at every game phase | Replace raw `gameState.phase` enum string in ActionBoard with a translated short label driven by i18n keys; apply per-phase color via existing `phaseTone` CSS class map |
| PHASE-02 | Host and non-host each see role-appropriate action guidance for the current phase | Extend `phasePresentation.ts` with a `phaseGuidance(phase, isHost)` selector returning an i18n key; render via `t()` in ActionBoard |
</phase_requirements>

---

## Summary

Phase 2 is a **presentation-layer-only** refactor of `ActionBoard.tsx` and `phasePresentation.ts`. No server changes are needed. The primary work is: (1) replace the raw enum string `gameState.phase` currently rendered in the top bar with a short translated label keyed through `react-i18next`, and (2) replace the hardcoded English strings in `phaseGuide` with i18n-keyed guidance that differs by host vs. non-host role.

The project already ships `react-i18next ^16.5.4` with `useTranslation()` used throughout `ActionBoard.tsx`. The `phasePresentation.ts` file today returns hardcoded English objects; these must be replaced with i18n key references. The `vi.json`, `en.json`, `ko.json`, `zh.json` locale files must receive new keys for phase labels and per-role guidance strings.

The `phaseTone` color map already exists and already maps every `Phase` enum value to a CSS class. No new color infrastructure is needed — only the background-fill variant for the pill badge may need one new CSS rule if the existing `.arcade-phase-tag` (text-color only) needs a filled background.

**Primary recommendation:** Keep `phasePresentation.ts` as the single source of truth for phase-to-i18n-key mapping. Add a `phaseLabel` key map and a `phaseGuidanceKey(phase, isHost)` function there. `ActionBoard` calls `t(phaseLabel[phase])` and `t(phaseGuidanceKey(phase, viewerHost))`. Locale JSON receives the new keys. No new libraries needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-i18next | ^16.5.4 (already installed) | `useTranslation` / `t()` for all translated strings | Already wired into every component; `useTranslation` returns `t` with full key-path dot-notation support |
| i18next | ^25.8.11 (already installed) | Core i18n engine, resource management, language switching | Peer dep of react-i18next; already initialized in `i18nSetup.ts` |
| @imposter/shared Phase enum | workspace | Phase values as source-of-truth keys for the mapping table | Already imported in ActionBoard and phasePresentation — prevents drift |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | ^3.4.17 | Utility classes for pill badge shape (rounded, px, py) | Use only tokens from `AppColor.ts`; do not hardcode hex |
| CSS custom properties (colors.css) | — | `--green-500`, `--red-400`, etc. for badge background tints | Background fill for badge; already available as CSS vars |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| i18n key map in `phasePresentation.ts` | Inline ternaries in JSX | Key map is testable, reusable, keeps JSX clean |
| CSS class approach for badge color | Inline style | CSS class map (`phaseTone`) already exists; extending it is zero-overhead |
| Extending existing `phaseGuide` object with keys | New file | Single file is simpler for 11-phase × 2-role table; file stays under 120 lines |

**Installation:** No new packages needed. All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure

The changes touch exactly these files (no new files unless `ActionBoard.tsx` or `phasePresentation.ts` approach 300 lines):

```
apps/web/src/
├── presentation/
│   ├── shared/
│   │   └── phasePresentation.ts       # ADD: phaseLabel map + phaseGuidanceKey()
│   ├── game/
│   │   └── ActionBoard.tsx            # MODIFY: replace raw enum + hardcoded guide with t()
│   └── locales/
│       ├── vi.json                    # ADD: phase.label.* + phase.guidance.* keys
│       ├── en.json                    # ADD: same keys in English
│       ├── ko.json                    # ADD: same keys in Korean
│       └── zh.json                    # ADD: same keys in Chinese
```

If `components.css` needs a background-fill variant for the pill badge (current `.arcade-phase-tag` only sets `border: 3px solid currentColor`), add one small rule block there.

### Pattern 1: Phase Label via i18n Key Map

**What:** `phasePresentation.ts` exports a `phaseLabel` Record mapping each `Phase` enum to an i18n key string. ActionBoard calls `t(phaseLabel[gameState.phase])` to get the short translated name.

**When to use:** Whenever a Phase enum value must be displayed as human-readable text.

**Example:**
```typescript
// apps/web/src/presentation/shared/phasePresentation.ts
import { Phase } from '@imposter/shared';

export const phaseLabel: Record<Phase, string> = {
  [Phase.GAME_CREATION]:       'phase.label.waiting',
  [Phase.WAITING_FOR_PLAYERS]: 'phase.label.waiting',
  [Phase.LOBBY_READY]:         'phase.label.waiting',
  [Phase.ROLE_DISTRIBUTION]:   'phase.label.wordReveal',
  [Phase.ROUND_DESCRIPTION]:   'phase.label.discussion',
  [Phase.ROUND_DISCUSSION]:    'phase.label.discussion',
  [Phase.ROUND_VOTING]:        'phase.label.voting',
  [Phase.ROUND_RESULT]:        'phase.label.voting',
  [Phase.WHITE_TRANSITION]:    'phase.label.discussion',
  [Phase.WIN_LOSE_CHECK]:      'phase.label.voting',
  [Phase.GAME_ENDED]:          'phase.label.ended',
};
```

```json
// vi.json (partial)
{
  "phase": {
    "label": {
      "waiting":    "Chờ",
      "wordReveal": "Tiết lộ từ",
      "discussion": "Thảo luận",
      "voting":     "Bầu chọn",
      "ended":      "Kết thúc"
    }
  }
}
```

In JSX (ActionBoard, inside `.arcade-head-actions`):
```tsx
// Source: react-i18next official docs / Context7 /i18next/react-i18next
const { t } = useTranslation();

// Only render label when phase is visible (not GAME_ENDED, not ROLE_DISTRIBUTION popup)
const showPhaseBadge =
  gameState.phase !== Phase.GAME_ENDED &&
  gameState.phase !== Phase.ROLE_DISTRIBUTION;

{showPhaseBadge && (
  <p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>
    {t(phaseLabel[gameState.phase]).toUpperCase()}
  </p>
)}
```

### Pattern 2: Role-Differentiated Guidance via i18n Key Function

**What:** `phasePresentation.ts` exports `phaseGuidanceKey(phase: Phase, isHost: boolean): string` returning an i18n key. ActionBoard renders `t(phaseGuidanceKey(gameState.phase, viewerHost))`.

**When to use:** Whenever guidance text must differ between host and non-host.

**Example:**
```typescript
// apps/web/src/presentation/shared/phasePresentation.ts
export function phaseGuidanceKey(phase: Phase, isHost: boolean): string {
  const role = isHost ? 'host' : 'player';
  const map: Record<Phase, string> = {
    [Phase.GAME_CREATION]:       `phase.guidance.${role}.waiting`,
    [Phase.WAITING_FOR_PLAYERS]: `phase.guidance.${role}.waiting`,
    [Phase.LOBBY_READY]:         `phase.guidance.${role}.waiting`,
    [Phase.ROLE_DISTRIBUTION]:   `phase.guidance.${role}.wordReveal`,
    [Phase.ROUND_DESCRIPTION]:   `phase.guidance.${role}.description`,
    [Phase.ROUND_DISCUSSION]:    `phase.guidance.${role}.discussion`,
    [Phase.ROUND_VOTING]:        `phase.guidance.${role}.voting`,
    [Phase.ROUND_RESULT]:        `phase.guidance.${role}.result`,
    [Phase.WHITE_TRANSITION]:    `phase.guidance.${role}.discussion`,
    [Phase.WIN_LOSE_CHECK]:      `phase.guidance.${role}.voting`,
    [Phase.GAME_ENDED]:          `phase.guidance.${role}.ended`,
  };
  return map[phase];
}
```

```json
// vi.json (partial)
{
  "phase": {
    "guidance": {
      "host": {
        "waiting":    "Nhấn Start khi đủ người chơi",
        "wordReveal": "Đợi người chơi xem từ bí mật",
        "description":"Theo dõi lượt phát biểu",
        "discussion": "Thảo luận với người chơi",
        "voting":     "Chọn người bị nghi ngờ",
        "result":     "Xem kết quả vòng",
        "ended":      "Trò chơi đã kết thúc"
      },
      "player": {
        "waiting":    "Chờ host bắt đầu",
        "wordReveal": "Xem từ bí mật của bạn",
        "description":"Chuẩn bị phát biểu của bạn",
        "discussion": "Thảo luận với người chơi",
        "voting":     "Đang chờ host bầu chọn",
        "result":     "Xem kết quả vòng",
        "ended":      "Trò chơi đã kết thúc"
      }
    }
  }
}
```

In JSX (ActionBoard, inside `.arcade-status-box`, replacing `guide.title` / `guide.description`):
```tsx
const showGuidance =
  gameState.phase !== Phase.GAME_ENDED &&
  gameState.phase !== Phase.ROLE_DISTRIBUTION;

{showGuidance && (
  <p className="arcade-muted">
    {t(phaseGuidanceKey(gameState.phase, viewerHost))}
  </p>
)}
```

### Pattern 3: Badge Visibility Guard

**What:** A `showPhaseBadge` boolean (derived from phase) controls conditional render. Same guard for guidance text. Keeps JSX clean — no duplicated phase checks scattered across the component.

**When to use:** Phases where the label/guidance must be hidden (GAME_ENDED and ROLE_DISTRIBUTION).

```typescript
// Compute once at top of component
const showPhaseInfo =
  gameState.phase !== Phase.GAME_ENDED &&
  gameState.phase !== Phase.ROLE_DISTRIBUTION;
```

### Anti-Patterns to Avoid

- **Hardcoded Vietnamese in JSX:** The current `phaseGuide` object in `phasePresentation.ts` has English strings returned directly into `guide.title` / `guide.description`. These are rendered in JSX without `t()`. This violates the i18n rule and must be replaced — not wrapped with `t()` (keys cannot be translated strings; they must be literal key paths).
- **Raw enum displayed to user:** Current line `{t('game.phase').toUpperCase()}: {gameState.phase}` shows the raw enum value (e.g., `ROUND_VOTING`) to players. This must be replaced by `t(phaseLabel[gameState.phase])`.
- **Duplicating phase-to-label logic in multiple components:** Keep the mapping exclusively in `phasePresentation.ts`; import from there in any component that needs it.
- **Adding i18n keys only to vi.json:** All four locale files (vi, en, ko, zh) must receive the same key structure, or the fallback chain renders raw keys as visible strings.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Language-keyed string lookup | Custom string map per locale | `t(key)` from `useTranslation()` | i18next handles fallback chain, missing-key warnings, pluralization, interpolation |
| Phase-to-display-name translation | `switch(phase)` returning translated strings | i18n key map + `t()` | Pure function + key map is testable without rendering; `t()` handles locale switching automatically |
| Color token for badge | Hardcoded hex in JSX | Existing `phaseTone` CSS class map + CSS vars from `colors.css` | Design system single-source-of-truth rule; AppColor.ts → colors.css → Tailwind/CSS classes |

**Key insight:** The entire "display the right text for the right phase/role" problem is already solved by the `t(key)` call pattern. The only real work is: define the key paths, populate locale JSON, update the mapping in `phasePresentation.ts`, and swap render calls in `ActionBoard`.

---

## Common Pitfalls

### Pitfall 1: Wrapping Already-Translated Strings as i18n Keys

**What goes wrong:** Developer takes the existing English string from `phaseGuide` (e.g., `"Wait for everyone, then start"`) and passes it as the key to `t()`. i18next treats it as a lookup key, fails to find it in JSON, and renders the string verbatim — no actual i18n happens for other locales.

**Why it happens:** Misunderstanding that `t()` takes a **key path** (like `"phase.label.waiting"`), not the display value.

**How to avoid:** Always use dot-notation key paths as `t()` arguments. The display value lives only inside the JSON locale files.

**Warning signs:** The UI shows English text even after switching to Vietnamese, or a DevTools console warning: `i18next: key 'Wait for everyone...' for language 'vi' not found`.

### Pitfall 2: Missing Key in One or More Locale Files

**What goes wrong:** New keys are added to `vi.json` but not to `en.json`, `ko.json`, or `zh.json`. When the user switches to English, the UI shows the raw key string (e.g., `phase.label.waiting`) instead of a translated label.

**Why it happens:** Only testing in the default locale (Vietnamese).

**How to avoid:** Add all new keys to all four locale files simultaneously. The existing `i18nDefaults.test.ts` pattern can be extended to assert key parity.

**Warning signs:** Switching language in DevTools shows raw key strings for the new labels.

### Pitfall 3: phasePresentation.ts Returning Translated Strings Instead of Keys

**What goes wrong:** `phaseGuidanceKey()` is implemented to return translated strings (e.g., `isHost ? "Nhấn Start khi đủ người" : "Chờ host bắt đầu"`) instead of i18n key strings. Result: guidance text is always Vietnamese regardless of selected locale.

**Why it happens:** Shortcut to avoid adding locale JSON entries.

**How to avoid:** The function must return key strings (`"phase.guidance.host.waiting"`). The `t()` call in JSX performs the translation.

**Warning signs:** Guidance text does not change when user switches language.

### Pitfall 4: phasePresentation.ts Exceeding 300 Lines

**What goes wrong:** Adding `phaseLabel`, `phaseGuidanceKey`, `phaseTone`, and `phaseGuide` all in one file pushes it past 300 lines (project rule violation).

**Why it happens:** All phase metadata accumulates in one file.

**How to avoid:** Current `phasePresentation.ts` is 73 lines. Adding `phaseLabel` (15 lines) + `phaseGuidanceKey` (25 lines) totals ~113 lines — well within limit. The old `phaseGuide` object (English hardcoded, 56 lines) can be deleted entirely once replaced by i18n keys, which reclaims space.

**Warning signs:** File exceeds 150 lines — monitor and split if needed.

### Pitfall 5: ActionBoard.tsx Exceeding 300 Lines

**What goes wrong:** Adding `showPhaseInfo` logic and restructuring the badge section adds 10-15 lines, pushing `ActionBoard.tsx` over 300 lines (currently 177 lines).

**Why it happens:** Incremental additions without monitoring file length.

**How to avoid:** Current file is 177 lines. Adding ~15 lines leaves comfortable room (192 lines). No split needed unless other phases also modify this file.

---

## Code Examples

Verified patterns from official sources:

### Basic useTranslation with dot-notation key

```tsx
// Source: Context7 /i18next/react-i18next — useTranslation hook
import { useTranslation } from 'react-i18next';

function ActionBoard() {
  const { t } = useTranslation();

  return (
    <p>{t('phase.label.waiting')}</p>
    // Renders: "Chờ" in vi, "Waiting" in en
  );
}
```

### Replacing raw enum display

```tsx
// BEFORE (current code in ActionBoard.tsx line 76):
<p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>
  {t('game.phase').toUpperCase()}: {gameState.phase}
</p>

// AFTER:
{showPhaseInfo && (
  <p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>
    {t(phaseLabel[gameState.phase]).toUpperCase()}
  </p>
)}
```

### Role-differentiated guidance rendering

```tsx
// Source: Pattern derived from react-i18next useTranslation + project's isHost selector
const showPhaseInfo =
  gameState.phase !== Phase.GAME_ENDED &&
  gameState.phase !== Phase.ROLE_DISTRIBUTION;

{showPhaseInfo && (
  <p className="arcade-muted">
    {t(phaseGuidanceKey(gameState.phase, viewerHost))}
  </p>
)}
```

### Vitest unit test for phaseGuidanceKey (no rendering required)

```typescript
// Source: Project test pattern (roleRevealTrigger.test.ts style)
import { describe, test, expect } from 'vitest';
import { Phase } from '@imposter/shared';
import { phaseGuidanceKey, phaseLabel } from '../shared/phasePresentation';

describe('phaseLabel', () => {
  test('GAME_ENDED maps to ended key', () => {
    expect(phaseLabel[Phase.GAME_ENDED]).toBe('phase.label.ended');
  });
  test('all Phase enum values have a label key', () => {
    Object.values(Phase).forEach((phase) => {
      expect(phaseLabel[phase]).toBeTruthy();
    });
  });
});

describe('phaseGuidanceKey', () => {
  test('ROUND_VOTING host returns voting host key', () => {
    expect(phaseGuidanceKey(Phase.ROUND_VOTING, true))
      .toBe('phase.guidance.host.voting');
  });
  test('ROUND_VOTING non-host returns voting player key', () => {
    expect(phaseGuidanceKey(Phase.ROUND_VOTING, false))
      .toBe('phase.guidance.player.voting');
  });
  test('all phases return a non-empty key for host', () => {
    Object.values(Phase).forEach((phase) => {
      expect(phaseGuidanceKey(phase, true)).toBeTruthy();
    });
  });
  test('all phases return a non-empty key for non-host', () => {
    Object.values(Phase).forEach((phase) => {
      expect(phaseGuidanceKey(phase, false)).toBeTruthy();
    });
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Hardcoded English strings in `phaseGuide` object | i18n key map + locale JSON for all 4 languages | Enables locale switching without code changes |
| Raw `Phase` enum string shown to user (`ROUND_VOTING`) | Short human-readable translated label (`Bầu chọn`) | Meets PHASE-01 requirement |
| Single non-role-differentiated `guide.description` | `phaseGuidanceKey(phase, isHost)` returns role-specific key | Meets PHASE-02 requirement |

**Deprecated/outdated:**
- `phaseGuide` object in `phasePresentation.ts`: Replace entirely with `phaseLabel` + `phaseGuidanceKey`. The old object mixes display concerns with hardcoded locale — not compatible with the i18n rule.

---

## Open Questions

1. **Exact Vietnamese wording for all 11 phases × 2 roles**
   - What we know: Locked decisions specify wording for WAITING and VOTING; others are Claude's discretion.
   - What's unclear: Exact text for ROUND_DESCRIPTION (host vs. player), ROUND_RESULT, WHITE_TRANSITION, WIN_LOSE_CHECK, LOBBY_READY guidance.
   - Recommendation: Use natural 1-line Vietnamese per the locked decision pattern. Plan phase can finalize exact strings — they live only in JSON, not in logic.

2. **Background-fill vs text-color for phase badge**
   - What we know: Current `.arcade-phase-tag` uses `border: 3px solid currentColor` + text color from `phaseTone`. A "pill" per the design decision may need a subtle background fill.
   - What's unclear: Whether the user wants a filled background (e.g., `background: color-mix(in srgb, currentColor 15%, transparent)`) or just the existing border+text approach.
   - Recommendation: Claude's discretion — implement with a subtle tinted background using `color-mix` on `currentColor`. This fits the retro arcade aesthetic and requires only a CSS rule addition, not a new design token.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — section omitted.

*(The config.json has no `nyquist_validation` key. Per instructions, skip this section.)*

The project uses **Vitest** (`^3.0.8`) with `vitest run` as the test command. Existing tests in `apps/web/src/domain/__tests__/` are pure logic tests (no DOM rendering). The recommended test file for this phase follows the same pattern.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.8 |
| Config file | none — configured via `package.json` scripts |
| Quick run command | `yarn test` (from `apps/web/`) |
| Full suite command | `yarn test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PHASE-01 | `phaseLabel` maps every `Phase` enum value to a non-empty i18n key string | unit | `yarn test` | No — Wave 0 gap |
| PHASE-02 | `phaseGuidanceKey(phase, isHost)` returns role-specific key for all phases | unit | `yarn test` | No — Wave 0 gap |
| PHASE-01/02 | All 4 locale JSON files contain the new key paths (`phase.label.*`, `phase.guidance.*`) | unit | `yarn test` | No — Wave 0 gap |

### Wave 0 Gaps

- [ ] `apps/web/src/domain/__tests__/phasePresentation.test.ts` — covers PHASE-01, PHASE-02 with pure function assertions
- [ ] Key parity assertion: verify same key paths exist in vi.json, en.json, ko.json, zh.json

---

## Sources

### Primary (HIGH confidence)

- Context7 `/i18next/react-i18next` — `useTranslation` hook API, `t(key)` dot-notation key paths, locale JSON structure
- Project codebase direct inspection — `phasePresentation.ts`, `ActionBoard.tsx`, `i18nSetup.ts`, all 4 locale JSON files, `components.css`, `AppColor.ts`
- `@imposter/shared` Phase enum — all 11 values confirmed

### Secondary (MEDIUM confidence)

- Context7 `/i18next/react-i18next` Trans component docs — confirmed `t()` is sufficient for simple key-to-string lookups; Trans not needed for this phase
- Existing test files (`roleRevealTrigger.test.ts`, `i18nDefaults.test.ts`) — confirmed Vitest pattern and test structure for pure function tests without DOM

### Tertiary (LOW confidence)

- None — all claims verified against codebase or Context7.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use; confirmed via package.json
- Architecture: HIGH — phasePresentation.ts pattern confirmed in codebase; i18n key-map pattern confirmed via Context7
- Pitfalls: HIGH — derived from direct codebase inspection (hardcoded strings identified at specific line numbers) and confirmed i18next behavior

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable libraries, no fast-moving APIs)
