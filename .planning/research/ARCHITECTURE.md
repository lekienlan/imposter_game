# Architecture Research

**Domain:** Social deduction game UX improvements (React Clean Architecture)
**Researched:** 2026-02-28
**Confidence:** HIGH — based on direct codebase analysis of all relevant source files

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                               │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  App.tsx   │  │ GameScreen  │  │ ActionBoard │  │  VotingPanel    │  │
│  │ (root mgr) │  │ (layout)    │  │ (phase UI)  │  │  (vote UI)      │  │
│  └─────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│        │ owns state      │ receives props  │ renders phase    │ host-only  │
├────────┴────────────────┴────────────────┴──────────────────┴────────────┤
│                           DOMAIN LAYER (Web)                              │
│  ┌──────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │ gameSelectors.ts │  │ useGatewayEvents.ts  │  │ HandlePhaseUpdate   │ │
│  │ getViewer()      │  │ (event→state bridge) │  │ (state transition)  │ │
│  │ isHost()         │  └──────────────────────┘  └─────────────────────┘ │
│  │ alivePlayers()   │                                                     │
│  └──────────────────┘                                                     │
├───────────────────────────────────────────────────────────────────────────┤
│                         INFRASTRUCTURE LAYER (Web)                        │
│  ┌──────────────────────┐  ┌─────────────────────────────────────────┐   │
│  │    GameGateway.ts    │  │           socketGateway.ts              │   │
│  │   (interface)        │  │      (Socket.IO implementation)         │   │
│  └──────────────────────┘  └─────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
         ↕ Socket.IO events (state:update, vote:submit, etc.)
┌───────────────────────────────────────────────────────────────────────────┐
│                              SERVER                                        │
│  infrastructure/socketHandlers.ts → application/usecases/ → utils/       │
│                                                  (gameRules.ts)           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `App.tsx` | Owns all session state (roomId, playerId, gameState, UI flags). Passes props down, passes callbacks to children. | `useGatewayEvents`, all screen components |
| `GameScreen.tsx` | Layout shell for the in-game view. No logic — passes everything through as props. | `ActionBoard`, `ViewerCard`, `PlayersPanel`, `WordRevealPopup` |
| `ActionBoard.tsx` | Renders the phase-aware action panel. Reads `gameState.phase` to choose which sub-panel to display. Contains phase title/guide via `phasePresentation.ts`. | `RoundActionPanel`, `VotingPanel`, `phasePresentation.ts` |
| `VotingPanel.tsx` | Renders host vs non-host vote UX. Uses `isHost()` selector to branch. Local `selectedTarget` state for two-step vote. | `gameSelectors.ts` (isHost), `onSubmitVote` callback |
| `ViewerCard.tsx` | Displays viewer's own name, role (hidden as `???` pre-game-end), and secret word. Role revealed only at `GAME_ENDED`. | Receives `viewer: Player`, `isGameOver: boolean` |
| `PlayersPanel.tsx` | List of all players with alive/out status and statements. Highlights current speaker during `ROUND_DESCRIPTION`. | Receives props only |
| `RoundActionPanel.tsx` | Statement input form (host + `ROUND_DESCRIPTION`) and start-voting button (host + `ROUND_DISCUSSION`). | Receives props only |
| `WordRevealPopup.tsx` | Full-screen overlay with countdown, then word display. Closes on user action. After close, word is lost from UI. | Triggered by `isWordPopupOpen` flag in `App.tsx` |
| `GameOverModal.tsx` | End-game table: all players, their revealed roles, win/lose status. Shows after `GameEndRoleRevealModal` is dismissed. | Receives `gameState` only |
| `GameEndRoleRevealModal.tsx` | Personal role-reveal first-person screen shown immediately on `GAME_ENDED`. Closes to `GameOverModal`. | Receives `viewer`, `gameState` |
| `phasePresentation.ts` | Pure data maps: `phaseTone` (CSS class per phase) and `phaseGuide` (title + description + tip per phase). No logic. | Imported by `ActionBoard` |
| `gameSelectors.ts` | Pure functions deriving computed state: `getViewer`, `isHost`, `alivePlayers`. | Used by `App.tsx`, `GameScreen.tsx`, `VotingPanel.tsx`, `ActionBoard.tsx` |
| `useGatewayEvents.ts` | Registers all socket event handlers. Bridges server events to `App.tsx` state setters. Controls `isWordPopupOpen`. | `GameGateway`, `HandlePhaseUpdate`, all `App.tsx` state setters |

---

## Recommended Project Structure for UX Additions

The four UX improvements map directly to existing directories without new layer violations:

```
apps/web/src/
├── domain/
│   └── utils/
│       └── gameSelectors.ts          # ADD: phaseLabel(), phaseStepIndex(),
│                                     #      phaseIsActive(), canViewerSeeWord()
│                                     #      (pure functions — no UI, no React)
│
└── presentation/
    ├── shared/
    │   ├── phasePresentation.ts      # ADD: phaseSteps[] ordered array for stepper
    │   ├── PhaseIndicator.tsx        # NEW: persistent phase stepper component
    │   └── WordBadge.tsx             # NEW: persistent word display badge
    │
    ├── voting/
    │   └── VotingPanel.tsx           # MODIFY: improve non-host messaging clarity
    │
    ├── game-over/
    │   └── GameOverModal.tsx         # MODIFY: add visual winner highlight,
    │                                 #         reason callout, imposter reveal row
    │
    └── game/
        ├── GameScreen.tsx            # MODIFY: integrate PhaseIndicator and WordBadge
        └── ViewerCard.tsx            # MODIFY: add "tap to reveal word again" trigger
```

### Structure Rationale

- **`domain/utils/gameSelectors.ts`:** All new derived-state logic (phase step index, is-phase-active, viewer-can-see-word) belongs here as pure functions. Components must not compute these inline.
- **`presentation/shared/PhaseIndicator.tsx`:** A new shared component receiving `phase: Phase` and `isHost: boolean` as props. No internal logic beyond rendering.
- **`presentation/shared/WordBadge.tsx`:** A persistent word display triggered from `ViewerCard` or `GameScreen`. Receives word as prop, renders inline or as toggleable overlay.
- **`presentation/shared/phasePresentation.ts`:** Extend with a `phaseSteps` ordered array that defines step order and human labels for the stepper. Keep as pure data (no React).

---

## Architectural Patterns

### Pattern 1: Contextual State via Prop Drilling (Current Pattern — Continue Using)

**What:** `App.tsx` derives `viewerHost` and `viewer` from `gameSelectors.ts`, then passes them as props through `GameScreen → ActionBoard → VotingPanel`. Components receive context they need without importing state directly.

**When to use:** For all four UX improvements. Compute `isHost`, `canViewWord`, `currentPhaseIndex` in `App.tsx` or `GameScreen.tsx` using selectors, then pass as typed props.

**Trade-offs:** Slightly verbose prop interfaces, but maintains zero coupling between presentation and business logic. Presentation components remain pure UI.

**Example:**
```typescript
// In App.tsx (or GameScreen.tsx)
const viewerHost = isHost(gameState, playerId);
const canSeeWord = gameState.phase !== Phase.GAME_CREATION && !!viewer?.word;

// Pass down:
<PhaseIndicator phase={gameState.phase} isHost={viewerHost} />
<WordBadge word={viewer?.word ?? null} visible={canSeeWord} />
```

### Pattern 2: Pure Data Maps in phasePresentation.ts (Current Pattern — Extend)

**What:** `phasePresentation.ts` is a pure TypeScript file (no React, no hooks) that maps `Phase` enum values to display data. `phaseTone` and `phaseGuide` are already here.

**When to use:** Add a `phaseSteps` array here for the phase indicator stepper. This keeps visual ordering logic out of components and out of domain selectors.

**Trade-offs:** Centralizes phase display data but couples it to `@imposter/shared` Phase enum. Acceptable because this file already has that dependency.

**Example:**
```typescript
// phasePresentation.ts — extend with:
export const phaseSteps: Phase[] = [
  Phase.WAITING_FOR_PLAYERS,
  Phase.ROLE_DISTRIBUTION,
  Phase.ROUND_DESCRIPTION,
  Phase.ROUND_DISCUSSION,
  Phase.ROUND_VOTING,
  Phase.ROUND_RESULT,
  Phase.GAME_ENDED,
];
// Component reads index from this array to render stepper position
```

### Pattern 3: Domain Selector for Derived UI State (Extend gameSelectors.ts)

**What:** New pure functions in `gameSelectors.ts` that answer UI-relevant questions without any presentation concern. Components call these functions with `(gameState, playerId)` to get booleans or labels.

**When to use:** When a component needs to know something derived from game state that involves any business logic (even simple). Do not inline the derivation in the component.

**Trade-offs:** Minor indirection, but keeps components testable and replaceable.

**Example:**
```typescript
// gameSelectors.ts — new additions:
export const canViewerSeeWord = (gameState: GameState, playerId: string): boolean => {
  const viewer = getViewer(gameState, playerId);
  return !!viewer?.word && gameState.phase !== Phase.GAME_CREATION;
};

export const phaseStepIndex = (phase: Phase): number =>
  phaseSteps.indexOf(phase); // phaseSteps imported from phasePresentation
```

Note: `phaseStepIndex` may import from `phasePresentation.ts` (presentation layer) which would violate the layer rule. **Better approach:** define the ordered array in `gameSelectors.ts` itself, or in a shared constants file in `domain/utils/`. Do NOT import from `presentation/` into `domain/`.

### Pattern 4: isWordPopupOpen as Lifting Point for Persistent Word Access

**What:** `isWordPopupOpen` is currently owned by `App.tsx` and driven by `useGatewayEvents`. To add persistent word access (re-open after popup closes), add a companion `onReopenWordPopup` callback or store the `word` separately in `ViewerCard` as a local "peek" toggle.

**When to use:** The simplest approach is a local `useState` toggle inside `ViewerCard` (or a new `WordBadge` component) that shows `viewer.word` inline. This avoids lifting state higher and does not touch gateway logic.

**Trade-offs:** Local toggle in `ViewerCard` means word is always visible in card (not as popup). This is the preferred approach — simpler, no new state in `App.tsx`, satisfies the requirement that word is "accessible after popup closes."

**Example:**
```typescript
// ViewerCard.tsx — add inline word toggle instead of popup:
// viewer.word is already received as a prop.
// If game phase is past ROLE_DISTRIBUTION, always show word inline in card.
// No new state needed — word is always visible in ViewerCard when available.
```

---

## Data Flow

### UX State Data Flow

```
Server (GameState via socket)
    ↓  socket 'state:update'
useGatewayEvents.ts
    ↓  setGameState(), setIsWordPopupOpen()
App.tsx  (owns: gameState, playerId, isWordPopupOpen)
    ↓  derive: viewer = getViewer(gameState, playerId)
    ↓  derive: viewerHost = isHost(gameState, playerId)
    ↓  derive: alivePlayers = alivePlayers(gameState)
    ↓  pass as props
GameScreen.tsx
    ↓  pass viewerHost, viewer, gameState, isWordPopupOpen
ActionBoard.tsx           ViewerCard.tsx         PlayersPanel.tsx
    ↓ phase → sub-panels      ↓ viewer.word            ↓ players list
VotingPanel.tsx           (word always present)
    ↓ isHost check
    ↓ two-step local state
    onSubmitVote()
    ↓
gateway.submitVote()
    ↓
Server
```

### Phase Indicator Data Flow

```
gameState.phase  (from App.tsx state)
    ↓ passed as prop
PhaseIndicator.tsx
    ↓ reads phaseSteps[] from phasePresentation.ts
    ↓ computes currentIndex = phaseSteps.indexOf(phase)
    ↓ renders stepper: completed | active | upcoming
    (no callbacks, no state — pure display)
```

### Vote Contextual UI Data Flow

```
gameState (from App.tsx)
playerId  (from App.tsx)
    ↓
VotingPanel.tsx
    ├─ isHost(gameState, playerId) → true
    │      renders: player selection grid + Submit button
    │      local state: selectedTarget
    │      onSubmitVote() → gateway call
    └─ isHost(gameState, playerId) → false
           renders: "Waiting for host to vote" message
           (dead players: renders null)
```

### End Game Results Data Flow

```
gameState.phase === GAME_ENDED
    ↓
App.tsx sets isRoleRevealOpen = true
    ↓
GameEndRoleRevealModal (personal reveal: viewer's role + win/lose)
    → onClose → isRoleRevealOpen = false
    ↓
GameOverModal (all-player table: name, role, win/lose status)
    ↓ reads gameState.winner for title/color
    ↓ reads gameState.winnerReason for reason text
    ↓ each player: didPlayerWin() using role vs winner enum
    (all logic currently inline — can extract to gameSelectors.ts)
```

### Key Data Flows

1. **Phase display:** `gameState.phase` → `phasePresentation.ts` maps → CSS class + guide text → rendered in `ActionBoard`. To add phase stepper: same flow, new component reads same `phase` prop.
2. **Host vs non-host:** `isHost(gameState, playerId)` → boolean → passed as `viewerHost` prop → consumed in `ActionBoard`, `VotingPanel`, `RoundActionPanel`. No new mechanism needed for new UX.
3. **Word persistence:** `viewer.word` already exists in `ViewerCard` as `wordDisplay`. The word never disappears from state — only the popup closes. Persistent word display requires only CSS/layout change in `ViewerCard`, not a new data flow.
4. **End game data:** All player roles visible after `GAME_ENDED` because `sanitizeGameStateForViewer` on the server reveals roles at that phase. `GameOverModal` receives `gameState` with all roles already populated.

---

## Component Boundaries for the Four UX Improvements

### 1. Phase Indicator

| Concern | Location | Rule |
|---------|----------|------|
| Ordered step list | `phasePresentation.ts` (presentation/shared) | Pure data, no React |
| Current index derivation | Component inline OR new `phaseStepIndex()` in `domain/utils/gameSelectors.ts` | Must not import from presentation |
| Rendering | New `PhaseIndicator.tsx` in `presentation/shared/` | Receives `phase: Phase` prop only |
| Integration | `GameScreen.tsx` renders `<PhaseIndicator phase={gameState.phase} />` | No new state needed |

### 2. Contextual Vote UI

| Concern | Location | Rule |
|---------|----------|------|
| Host check | `isHost()` in `gameSelectors.ts` — already exists | No change needed |
| Non-host message text | i18n key `game.waitingForHostVote` — already exists in `VotingPanel` | Improve text/styling only |
| Host vote UI | `VotingPanel.tsx` — already exists, already two-step | Improve visual clarity |
| Non-host explanation | `VotingPanel.tsx` non-host branch | Currently minimal — add more context |

### 3. Persistent Word Display

| Concern | Location | Rule |
|---------|----------|------|
| Word data | `viewer.word` from `GameState.players` — already present | No change |
| Display logic | `ViewerCard.tsx` — already shows `wordDisplay` | Remove `t('game.wordLocked')` fallback once phase > ROLE_DISTRIBUTION |
| Popup re-access | Add "show word" button in `ViewerCard` OR keep word always visible | Local UI only, no state lift |
| Condition for showing | `viewer?.word && gameState.phase !== Phase.GAME_CREATION` | Move to `canViewerSeeWord()` selector |

### 4. End Game Results Screen

| Concern | Location | Rule |
|---------|----------|------|
| Winner determination per player | `didPlayerWin()` — currently inline in both `GameOverModal` and `GameEndRoleRevealModal` | Extract to `gameSelectors.ts` |
| Role label mapping | `getRoleLabel()` — duplicated in both modals | Extract to shared utility in `domain/utils/` |
| Role color class | `getRoleColorClass()` — duplicated in both modals | Extract or use design token map |
| Winner display | `GameOverModal.tsx` — shows table | Enhance with visual imposter highlight |
| Personal result | `GameEndRoleRevealModal.tsx` — personal view | Already adequate; minor styling |

---

## Anti-Patterns

### Anti-Pattern 1: Computing Derived State Inside Components

**What people do:** Write `gameState.players.find(p => p.id === playerId)?.isHost` inline inside a component, or `gameState.phase === Phase.ROUND_VOTING && gameState.hostPlayerId === playerId` inline in JSX.

**Why it's wrong:** Duplicates logic across components, makes testing impossible without rendering, and creates a maintenance surface where the same rule can diverge between components.

**Do this instead:** Add a pure function to `apps/web/src/domain/utils/gameSelectors.ts`. Import and call it in `App.tsx` or `GameScreen.tsx`, pass the result as a prop.

### Anti-Pattern 2: Importing from Presentation into Domain

**What people do:** Import `phasePresentation.ts` (which lives in `presentation/shared/`) from `gameSelectors.ts` (which lives in `domain/utils/`) to access `phaseSteps[]`.

**Why it's wrong:** Violates the dependency rule — domain must not depend on presentation. Would create a circular dependency hazard.

**Do this instead:** Define `phaseSteps[]` in `domain/utils/` (e.g., a new `phaseConstants.ts`), or define it directly in `gameSelectors.ts`. Then import from `domain/utils/` into `phasePresentation.ts` if needed (domain → presentation is allowed).

### Anti-Pattern 3: Adding UI State to App.tsx for Local Concerns

**What people do:** Add `isWordVisible`, `isPhaseHintExpanded`, or similar purely-local UI toggles to `App.tsx` state, then thread them through the prop chain.

**Why it's wrong:** `App.tsx` already has 15+ state variables. Adding more for local component concerns bloats the root and increases prop drilling depth unnecessarily.

**Do this instead:** Keep local UI toggles (`useState`) in the component that owns the interaction. `WordBadge` or `ViewerCard` can maintain `isWordVisible` locally. Only lift state when a sibling or ancestor needs it.

### Anti-Pattern 4: Duplicating Role/Winner Logic Across Modals

**What people do:** Copy `didPlayerWin()` and `getRoleLabel()` from `GameOverModal.tsx` into `GameEndRoleRevealModal.tsx` (this already exists in the codebase).

**Why it's wrong:** Both modals contain identical implementations of `didPlayerWin` and `getRoleLabel`. Any rule change (e.g., new role type) requires updating two files, with a risk of divergence.

**Do this instead:** Extract `didPlayerWin(player, winner)` and `getRoleLabel(role, t)` to `gameSelectors.ts` (logic) and a shared utility file. Import from both modals.

---

## Build Order Implications

The four improvements have the following dependency relationships:

```
Phase Indicator
  └─ depends on: phaseSteps[] data (new constant)
  └─ no dependency on: vote UI, word display, end game

Contextual Vote UI
  └─ depends on: isHost() selector (already exists)
  └─ no dependency on: phase indicator, word display, end game

Persistent Word Display
  └─ depends on: viewer.word (already in GameState/ViewerCard)
  └─ may depend on: canViewerSeeWord() selector (new, trivial)
  └─ no dependency on: phase indicator, vote UI, end game

End Game Results Screen
  └─ depends on: didPlayerWin() (extract from existing inline logic)
  └─ depends on: getRoleLabel() (extract from existing inline logic)
  └─ no dependency on: phase indicator, vote UI, word display
```

**Recommended build order:**

1. **Extract shared selectors first** — `didPlayerWin`, `getRoleLabel`, `canViewerSeeWord` to `gameSelectors.ts`. This is pure refactor with no visible change, reduces risk of regressions, and unblocks items 3 and 4.
2. **Phase Indicator** — lowest coupling, new component, zero risk to existing functionality.
3. **Persistent Word Display** — local change to `ViewerCard`, small scope.
4. **Contextual Vote UI** — modify existing `VotingPanel` non-host branch, medium risk (currently used in gameplay).
5. **End Game Results Screen** — requires extracted selectors from step 1, touches two modal files.

All four can be built independently after step 1. No item blocks another.

---

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `App.tsx` ↔ `GameScreen.tsx` | Props (gameState, playerId, callbacks) | GameScreen is a pure layout pass-through |
| `GameScreen.tsx` ↔ `ActionBoard.tsx` | Props (all game state slices + callbacks) | ActionBoard is the phase-rendering hub |
| `ActionBoard.tsx` ↔ `VotingPanel.tsx` | Props (gameState, playerId, viewer, alivePlayers, viewerVotedForId, onSubmitVote) | VotingPanel owns local selectedTarget state |
| `ActionBoard.tsx` ↔ `phasePresentation.ts` | Direct import (phaseTone, phaseGuide) | Pure data maps, no runtime coupling |
| `App.tsx` ↔ `useGatewayEvents.ts` | Callback props (all state setters) | Hook registers socket handlers in useEffect |
| `domain/utils/gameSelectors.ts` ↔ presentation | Imported by components and App.tsx | One-way: presentation imports domain, never reverse |
| `@imposter/shared` ↔ all layers | Import of Phase, Role, Winner, GameState types | Shared types prevent duplication |

### New Integration Points for UX Improvements

| New Component | Integrates With | How |
|---------------|-----------------|-----|
| `PhaseIndicator.tsx` | `GameScreen.tsx` or `ActionBoard.tsx` | Receives `phase: Phase` prop; reads `phaseSteps[]` from `phasePresentation.ts` |
| `WordBadge.tsx` (if created) | `ViewerCard.tsx` | Receives `word: string \| null` prop; local visibility toggle |
| Extracted `didPlayerWin()` | `GameOverModal.tsx`, `GameEndRoleRevealModal.tsx` | Both import from `gameSelectors.ts` |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (small rooms, ~10 players) | Current prop drilling + useState is fine. No state manager needed. |
| More UI complexity (more phases, more UI flags) | Consider a `useGameSession` custom hook to bundle session state from App.tsx, reducing prop drilling depth. Still no Zustand/Redux needed. |
| Multiple screens with shared game state | If game state needs to be read outside the current component tree, introduce React Context for `gameState` + `playerId`. Not needed for these four improvements. |

### Scaling Priorities

1. **First bottleneck:** `App.tsx` state explosion — already at 15 state variables. Mitigation: extract unrelated UI state (word popup, role reveal) into a `useGameUIState` hook that lives in `domain/hooks/`.
2. **Second bottleneck:** `ActionBoard.tsx` growing as more phases are added — currently handles phase-to-component mapping inline. Mitigation: if new phases are added, introduce a phase-component registry pattern in `phasePresentation.ts`.

---

## Sources

- Direct analysis of `apps/web/src/presentation/App.tsx` (235 lines)
- Direct analysis of `apps/web/src/presentation/game/GameScreen.tsx`, `ActionBoard.tsx`, `ViewerCard.tsx`, `PlayersPanel.tsx`
- Direct analysis of `apps/web/src/presentation/voting/VotingPanel.tsx`
- Direct analysis of `apps/web/src/presentation/word-reveal/WordRevealPopup.tsx`
- Direct analysis of `apps/web/src/presentation/game-over/GameOverModal.tsx`, `GameEndRoleRevealModal.tsx`
- Direct analysis of `apps/web/src/presentation/shared/phasePresentation.ts`
- Direct analysis of `apps/web/src/domain/utils/gameSelectors.ts`
- Direct analysis of `apps/web/src/domain/hooks/useGatewayEvents.ts`
- Direct analysis of `packages/shared/src/enums/Phase.ts`, `models/GameState.ts`
- `.planning/codebase/ARCHITECTURE.md` (architecture overview)
- `.planning/codebase/STRUCTURE.md` (directory layout)
- `.planning/PROJECT.md` (milestone requirements)
- `CLAUDE.md` (project rules and constraints)

---

*Architecture research for: Social deduction game UX improvements (imposter_game)*
*Researched: 2026-02-28*
