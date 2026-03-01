# Phase 1: Selector Foundation - Research

**Researched:** 2026-03-01
**Domain:** TypeScript pure-function extraction / domain-layer architecture
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- All implementation decisions are deferred to Claude (pure technical refactor with no user-facing decisions)

### Claude's Discretion
- File placement within domain layer
- Test coverage approach and depth
- Whether to extract additional inline derived state beyond the 5 named functions
- How aggressively to clean up inline logic after extraction

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 1 is a pure refactor: extract five derived-state helper functions that are currently duplicated across presentation components into a single authoritative module in the domain layer. No new behavior is introduced. The existing `gameSelectors.ts` at `apps/web/src/domain/utils/gameSelectors.ts` already exports `getViewer`, `isHost`, and `alivePlayers`, establishing the correct pattern and location. The five functions to add (`didPlayerWin`, `getRoleLabel`, `getRoleColorClass`, `canViewerSeeWord`, `isGameOver`) currently live inline inside `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx` (with identical duplication across both files), and as an inline expression in `GameScreen.tsx`.

The codebase already has a working Vitest infrastructure (`vitest ^3.0.8`, `jsdom ^28.1.0`) with four test files under `apps/web/src/domain/__tests__/` following the established pattern of co-located pure-function tests. The phase requires adding a fifth test file (`gameSelectors.test.ts`) in that directory. All types needed (`GameState`, `Player`, `Role`, `Winner`, `Phase`) are exported from `@imposter/shared`.

**Primary recommendation:** Add all five functions to `apps/web/src/domain/utils/gameSelectors.ts`, write unit tests in `apps/web/src/domain/__tests__/gameSelectors.test.ts`, then replace the inline duplicates in both modal files with imports. The `isGameOver` inline expression in `GameScreen.tsx` should also be replaced with the selector call.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5.7.3 | Type-safe pure functions | Already in project; enums/interfaces from `@imposter/shared` are the inputs |
| `@imposter/shared` | 1.0.0 | `GameState`, `Player`, `Role`, `Winner`, `Phase` types | Single source of truth for domain types per project rule |
| Vitest | ^3.0.8 | Unit test runner | Already installed; used by all four existing domain test files |
| jsdom | ^28.1.0 | Browser environment for Vitest | Already installed as dev dependency |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | (already in project) | Translation | `getRoleLabel` returns i18n-keyed strings — NOTE: see architecture decision below |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure function in domain | Class-based selector | Functions are simpler, easier to test, match existing `gameSelectors.ts` style |
| i18n-aware `getRoleLabel` in selectors | i18n-agnostic selector + translation in component | i18n in domain violates layer purity — see Architecture Patterns below |

**Installation:** No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── domain/
│   └── utils/
│       └── gameSelectors.ts       ← ADD 5 new functions here (existing file)
├── domain/
│   └── __tests__/
│       └── gameSelectors.test.ts  ← NEW: unit tests for the 5 functions
├── presentation/
│   └── game-over/
│       ├── GameOverModal.tsx      ← REPLACE inline functions with imports
│       └── GameEndRoleRevealModal.tsx  ← REPLACE inline functions with imports
│   └── game/
│       └── GameScreen.tsx         ← REPLACE inline `gameState.phase === Phase.GAME_ENDED`
```

### Pattern 1: i18n-Agnostic Domain Selector (CRITICAL)

**What:** `getRoleLabel` currently uses `t()` (react-i18next) inline in both modal components. Moving it as-is into the domain layer would introduce a React hook dependency into domain code, violating the layer rule ("domain phải thuần logic, không phụ thuộc framework").

**Decision:** `getRoleLabel` in `gameSelectors.ts` MUST return the raw role key (`Role.CITIZEN`, `Role.SPY`, `Role.WHITE`) or a neutral fallback string — NOT a translated string. Translation stays in the component. Alternatively, `getRoleLabel` can return a stable i18n key string that the component passes to `t()`.

**Recommended approach:** Return the Role enum value directly (or an uppercase label constant), and let the component call `t()` on it. This matches the domain-purity rule.

**Example:**
```typescript
// apps/web/src/domain/utils/gameSelectors.ts
import { GameState, Player, Role, Winner, Phase } from '@imposter/shared';

// Returns role key suitable for t('role.citizen') etc., or display fallback
export const getRoleLabel = (role: Role | null): string => {
  switch (role) {
    case Role.CITIZEN: return 'CITIZEN';
    case Role.SPY:     return 'SPY';
    case Role.WHITE:   return 'WHITE ROLE';
    default:           return 'UNKNOWN';
  }
};

export const getRoleColorClass = (role: Role | null): string => {
  switch (role) {
    case Role.CITIZEN: return 'text-blue-400';
    case Role.SPY:     return 'text-red-400';
    case Role.WHITE:   return 'text-neutral-400';
    default:           return 'text-neutral-400';
  }
};

export const didPlayerWin = (player: Player, winner: Winner): boolean => {
  if (winner === Winner.CITIZENS && (player.role === Role.CITIZEN || player.role === Role.WHITE)) return true;
  if (winner === Winner.SPIES && player.role === Role.SPY) return true;
  return false;
};

export const isGameOver = (gameState: GameState): boolean =>
  gameState.phase === Phase.GAME_ENDED;

export const canViewerSeeWord = (viewer: Player | undefined, gameState: GameState): boolean =>
  viewer?.word != null && !isGameOver(gameState);
```

### Pattern 2: Existing Selector Conventions (from codebase)

The existing three selectors in `gameSelectors.ts` use:
- Arrow function exports (not named function declarations)
- Explicit parameter types via `@imposter/shared` imports
- No side effects; no React hooks; no framework dependencies

New selectors MUST follow the same convention.

### Pattern 3: Vitest Test File for Pure Functions

**What:** The existing `roleRevealTrigger.test.ts` shows the established pattern — define the function under test inline, then `describe`/`test`/`expect`. For `gameSelectors.ts`, the functions should be imported from the module instead.

**Example:**
```typescript
// apps/web/src/domain/__tests__/gameSelectors.test.ts
import { describe, test, expect } from 'vitest';
import { didPlayerWin, getRoleLabel, getRoleColorClass, canViewerSeeWord, isGameOver } from '../utils/gameSelectors';
import { Role, Winner, Phase } from '@imposter/shared';

describe('didPlayerWin', () => {
  test('citizen wins when CITIZENS win', () => {
    // ...
  });
  test('spy loses when CITIZENS win', () => {
    // ...
  });
});
```

**Run command:** `cd apps/web && yarn test` (runs `vitest run`)

### Anti-Patterns to Avoid

- **Putting `t()` / `useTranslation()` in domain selectors:** Domain functions must not import React hooks or i18next. This breaks testability and layer isolation.
- **Duplicating logic when importing:** After extracting, remove ALL inline definitions from `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx`. Do not keep both.
- **Passing `gameState.winner` directly into `didPlayerWin` without considering null/NONE:** `Winner.NONE` is a valid enum value — the function must handle it (returns `false`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type definitions for Player/Role/Winner/Phase | Redefining enums or interfaces | Import from `@imposter/shared` | Project rule; prevents divergence |
| Test runner setup | Custom test harness | Vitest (already configured) | Already in vite.config.ts or package.json |
| i18n in domain functions | `t()` calls inside selectors | Return stable string constants; translate at component level | Hooks cannot be called outside React components; domain must be framework-free |

**Key insight:** The inline functions in `GameOverModal.tsx` and `GameEndRoleRevealModal.tsx` are character-for-character identical. This is the only custom logic in this phase — the "don't hand-roll" constraint is about not re-creating what already exists in `@imposter/shared`.

---

## Common Pitfalls

### Pitfall 1: `didPlayerWin` Signature — Coupling to GameState vs Taking Winner Directly

**What goes wrong:** Passing the full `GameState` object to `didPlayerWin` forces tests to construct entire GameState mocks. Passing `winner: Winner` as a parameter is simpler and sufficient.

**Why it happens:** Refactors often copy the original signature which captured `gameState` from closure.

**How to avoid:** Accept `(player: Player, winner: Winner)` as parameters — matches what the callers already have.

**Warning signs:** Test setup requires building a full `GameState` object just to test win/loss logic.

### Pitfall 2: Forgetting `canViewerSeeWord` Semantics

**What goes wrong:** `canViewerSeeWord` is listed as a required export but has no inline equivalent to copy from. Its semantics must be inferred from context.

**Why it happens:** It's a new gating function, not an extraction.

**How to avoid:** `canViewerSeeWord` should return `true` only if: (a) the viewer has a non-null word, AND (b) game is NOT over (role reveal rules say word display is tied to non-ended state). This is inferred from `ViewerCard.tsx` which shows `viewer?.word ?? t('game.wordLocked')` without phase gating — the gating is done upstream. Verify against phase 2-5 requirements before finalizing semantics.

**Warning signs:** Downstream phases have conflicting expectations about when word is visible.

### Pitfall 3: Inline `isGameOver` Left Behind in GameScreen.tsx

**What goes wrong:** `GameScreen.tsx` line 48 has `const isGameOver = gameState.phase === Phase.GAME_ENDED;`. After extraction, this inline expression may be left unchanged, meaning the selector is never actually used in GameScreen.

**How to avoid:** Replace with `import { isGameOver } from '../../domain/utils/gameSelectors'` and call `isGameOver(gameState)`.

**Warning signs:** `Phase` is still imported in `GameScreen.tsx` only for the `isGameOver` expression after the refactor.

### Pitfall 4: `getRoleColorClass` Returns Tailwind Classes — Design Token Rule

**What goes wrong:** `getRoleColorClass` returns hardcoded Tailwind color class strings (`'text-blue-400'`, `'text-red-400'`, `'text-neutral-400'`). The design token rule says not to hardcode colors if they exist in `AppColor.ts`.

**Why it happens:** The function is being copied verbatim from the modal components.

**How to avoid:** Confirm that the Tailwind color aliases (`blue-400`, `red-400`, `neutral-400`) are defined via the design token system before copying them verbatim. If they are, the class strings are acceptable (they reference the token, not a raw hex). If not, flag for design token alignment.

**Warning signs:** The class names differ from what's in `AppColor.ts` or the Tailwind config.

---

## Code Examples

### Current Inline Duplication (what will be removed)

```typescript
// IN GameOverModal.tsx AND GameEndRoleRevealModal.tsx — exact same code in both:
const didPlayerWin = (player: Player) => {
  if (gameState.winner === Winner.CITIZENS &&
     (player.role === Role.CITIZEN || player.role === Role.WHITE)) return true;
  if (gameState.winner === Winner.SPIES && player.role === Role.SPY) return true;
  return false;
};

const getRoleLabel = (role: Role | null) => {
  switch (role) {
    case Role.CITIZEN: return t('role.citizen', 'CITIZEN');
    case Role.SPY:     return t('role.spy', 'SPY');
    case Role.WHITE:   return t('role.white', 'WHITE ROLE');
    default:           return t('role.unknown', 'UNKNOWN');
  }
};

const getRoleColorClass = (role: Role | null) => {
  switch (role) {
    case Role.CITIZEN: return 'text-blue-400';
    case Role.SPY:     return 'text-red-400';
    case Role.WHITE:   return 'text-neutral-400';
    default:           return 'text-neutral-400';
  }
};
```

### Target: Selectors Module (what will be added)

```typescript
// apps/web/src/domain/utils/gameSelectors.ts (additions)
import { GameState, Player, Role, Winner, Phase } from '@imposter/shared';

export const didPlayerWin = (player: Player, winner: Winner): boolean => {
  if (winner === Winner.CITIZENS && (player.role === Role.CITIZEN || player.role === Role.WHITE)) return true;
  if (winner === Winner.SPIES && player.role === Role.SPY) return true;
  return false;
};

export const getRoleLabel = (role: Role | null): string => {
  switch (role) {
    case Role.CITIZEN: return 'CITIZEN';
    case Role.SPY:     return 'SPY';
    case Role.WHITE:   return 'WHITE ROLE';
    default:           return 'UNKNOWN';
  }
};

export const getRoleColorClass = (role: Role | null): string => {
  switch (role) {
    case Role.CITIZEN: return 'text-blue-400';
    case Role.SPY:     return 'text-red-400';
    case Role.WHITE:   return 'text-neutral-400';
    default:           return 'text-neutral-400';
  }
};

export const isGameOver = (gameState: GameState): boolean =>
  gameState.phase === Phase.GAME_ENDED;

export const canViewerSeeWord = (viewer: Player | undefined, gameState: GameState): boolean =>
  viewer?.word != null && !isGameOver(gameState);
```

### Target: Updated Import in GameOverModal.tsx

```typescript
// Replace the three inline functions with:
import { didPlayerWin, getRoleLabel, getRoleColorClass } from '../../domain/utils/gameSelectors';

// Usage change: didPlayerWin now takes winner as second arg
const isWinner = didPlayerWin(player, gameState.winner);
```

### Target: Updated Import in GameEndRoleRevealModal.tsx

```typescript
import { didPlayerWin, getRoleLabel, getRoleColorClass } from '../../domain/utils/gameSelectors';

// Same signature change
const viewerWon = viewer ? didPlayerWin(viewer, gameState.winner) : false;
```

### Target: Updated GameScreen.tsx

```typescript
import { isHost, isGameOver } from '../../domain/utils/gameSelectors';

// Replace:
// const isGameOver = gameState.phase === Phase.GAME_ENDED;
// With:
const gameOver = isGameOver(gameState);
// (or keep name as isGameOver — but avoid shadowing the import)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline logic inside components | Pure domain selectors in `domain/utils/` | Established by existing `gameSelectors.ts` | Enables unit testing without mounting components |
| Vitest v2 | Vitest v3 (`^3.0.8`) | 2024-2025 | Vitest 3 has improved snapshot support and browser mode — no API changes needed for this phase |

**Deprecated/outdated:**
- None relevant to this phase. Vitest 3 is fully backward-compatible with the test patterns used in the four existing test files.

---

## Open Questions

1. **`getRoleLabel` i18n handling**
   - What we know: Both modal components call `t('role.citizen', 'CITIZEN')` — the translation key with a fallback. The selector cannot use `t()` in domain.
   - What's unclear: Whether downstream phase 5 needs translated strings from the selector, or if returning the fallback string constant is sufficient.
   - Recommendation: Return plain English constants from selector. Components call `t()` on the result or translate themselves. This is safe and testable.

2. **`canViewerSeeWord` semantics**
   - What we know: The function is listed as a required export but has no existing inline implementation to extract from.
   - What's unclear: The exact condition (e.g., does it also gate on phase = ROUND_DESCRIPTION etc.?).
   - Recommendation: Implement as `viewer?.word != null && !isGameOver(gameState)`. Validate against Phase 4 context before finalizing.

3. **`isGameOver` naming conflict in GameScreen.tsx**
   - What we know: `GameScreen.tsx` declares `const isGameOver = ...` as a local variable. Importing a function named `isGameOver` creates a naming conflict.
   - What's unclear: Whether to rename the local variable or rename the import.
   - Recommendation: Call the imported function `isGameOver` and rename the local to `gameIsOver` or just remove the local and use the function call inline at the prop site.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `apps/web/src/domain/utils/gameSelectors.ts` — established selector pattern and location
- Direct code inspection: `apps/web/src/presentation/game-over/GameOverModal.tsx` — confirmed inline duplication of `didPlayerWin`, `getRoleLabel`, `getRoleColorClass`
- Direct code inspection: `apps/web/src/presentation/game-over/GameEndRoleRevealModal.tsx` — confirmed identical duplication
- Direct code inspection: `apps/web/src/presentation/game/GameScreen.tsx` — confirmed inline `isGameOver` expression on line 48
- Direct code inspection: `apps/web/package.json` — confirmed Vitest 3.0.8 and jsdom installed
- Direct code inspection: `packages/shared/src/index.ts` — confirmed all required types are exported from `@imposter/shared`

### Secondary (MEDIUM confidence)

- Existing test files (`roleRevealTrigger.test.ts`, `reconnectLogic.test.ts`) — confirmed test conventions and import patterns

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified by reading package.json directly
- Architecture: HIGH — existing `gameSelectors.ts` file establishes the exact pattern; no speculation
- Pitfalls: HIGH — identified by reading actual source files that contain the inline logic

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable, pure TypeScript refactor — no fast-moving ecosystem concerns)
