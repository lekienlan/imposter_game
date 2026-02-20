# Presentation Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the flat `apps/web/src/presentation/` directory into phase-grouped subfolders, extracting phase-specific sub-components from `ActionBoard` and `GameScreen`.

**Architecture:** Move existing files into `lobby/`, `role-reveal/`, `game/`, and `shared/` folders. Extract three phase-specific panels from `ActionBoard` into `round/`, `voting/`, and `game-over/` folders. Extract `ViewerCard` from `GameScreen`. Update all imports accordingly.

**Tech Stack:** TypeScript, React, `@imposter/shared` (Phase, GameState, Player enums/models), `pixel-retroui`, `react-i18next`

---

## Final folder structure

```
apps/web/src/presentation/
  App.tsx                          (no move, update imports only)
  lobby/
    LobbyScreen.tsx
    CreateRoomForm.tsx
    JoinRoomForm.tsx
    RoomPreviewPanel.tsx
  role-reveal/
    WordRevealPopup.tsx
  round/
    RoundActionPanel.tsx           ← NEW: extracted from ActionBoard
  voting/
    VotingPanel.tsx                ← NEW: extracted from ActionBoard
  game-over/
    GameOverPanel.tsx              ← NEW: extracted from ActionBoard
  game/
    GameScreen.tsx
    ViewerCard.tsx                 ← NEW: extracted from GameScreen
    PlayersPanel.tsx
    ActionBoard.tsx                ← TRIMMED: delegates to phase panels
  shared/
    LanguageSwitcher.tsx
    ShareButton.tsx
    ShareModal.tsx
    phasePresentation.ts
  styles/                          (unchanged)
  index.css                        (unchanged)
```

---

### Task 1: Create lobby/ folder and move lobby components

**Files:**
- Create: `apps/web/src/presentation/lobby/LobbyScreen.tsx`
- Create: `apps/web/src/presentation/lobby/CreateRoomForm.tsx`
- Create: `apps/web/src/presentation/lobby/JoinRoomForm.tsx`
- Create: `apps/web/src/presentation/lobby/RoomPreviewPanel.tsx`
- Delete: `apps/web/src/presentation/LobbyScreen.tsx`
- Delete: `apps/web/src/presentation/CreateRoomForm.tsx`
- Delete: `apps/web/src/presentation/JoinRoomForm.tsx`
- Delete: `apps/web/src/presentation/RoomPreviewPanel.tsx`

**Step 1: Move the four lobby files**

```bash
cd apps/web/src/presentation
mkdir -p lobby
mv LobbyScreen.tsx lobby/
mv CreateRoomForm.tsx lobby/
mv JoinRoomForm.tsx lobby/
mv RoomPreviewPanel.tsx lobby/
```

**Step 2: Fix cross-imports inside lobby files**

Open each moved file and update any relative imports that pointed to sibling files that are now in the same folder. For example, if `LobbyScreen.tsx` imports `./CreateRoomForm`, it should still work as `./CreateRoomForm` since they are now siblings inside `lobby/`. Verify no broken references.

**Step 3: Update App.tsx imports**

In `apps/web/src/presentation/App.tsx`, change:
```ts
// Before
import { LobbyScreen } from "./LobbyScreen";

// After
import { LobbyScreen } from "./lobby/LobbyScreen";
```

**Step 4: Verify the app compiles**

```bash
cd /Users/lanle98/Desktop/imposter_game
yarn workspace @imposter/web build 2>&1 | tail -30
```
Expected: No TypeScript errors related to the moved files.

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: move lobby components into presentation/lobby/"
```

---

### Task 2: Create role-reveal/ folder and move WordRevealPopup

**Files:**
- Create: `apps/web/src/presentation/role-reveal/WordRevealPopup.tsx`
- Delete: `apps/web/src/presentation/WordRevealPopup.tsx`

**Step 1: Move the file**

```bash
mkdir -p apps/web/src/presentation/role-reveal
mv apps/web/src/presentation/WordRevealPopup.tsx apps/web/src/presentation/role-reveal/
```

**Step 2: Update import in GameScreen.tsx**

In `apps/web/src/presentation/game/GameScreen.tsx` (will be moved in Task 5, but for now still at old path), change:
```ts
// Before
import { WordRevealPopup } from "./WordRevealPopup";

// After
import { WordRevealPopup } from "../role-reveal/WordRevealPopup";
```

**Step 3: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```
Expected: No errors.

**Step 4: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: move WordRevealPopup into presentation/role-reveal/"
```

---

### Task 3: Create shared/ folder and move shared components

**Files:**
- Create: `apps/web/src/presentation/shared/LanguageSwitcher.tsx`
- Create: `apps/web/src/presentation/shared/ShareButton.tsx`
- Create: `apps/web/src/presentation/shared/ShareModal.tsx`
- Create: `apps/web/src/presentation/shared/phasePresentation.ts`
- Delete originals

**Step 1: Move the files**

```bash
mkdir -p apps/web/src/presentation/shared
mv apps/web/src/presentation/LanguageSwitcher.tsx apps/web/src/presentation/shared/
mv apps/web/src/presentation/ShareButton.tsx apps/web/src/presentation/shared/
mv apps/web/src/presentation/ShareModal.tsx apps/web/src/presentation/shared/
mv apps/web/src/presentation/phasePresentation.ts apps/web/src/presentation/shared/
```

**Step 2: Update imports in App.tsx**

```ts
// Before
import { LanguageSwitcher } from "./LanguageSwitcher";

// After
import { LanguageSwitcher } from "./shared/LanguageSwitcher";
```

**Step 3: Update imports in ActionBoard.tsx**

`ActionBoard.tsx` imports both `ShareButton` and `phasePresentation`. Update:
```ts
// Before
import { phaseGuide, phaseTone } from "./phasePresentation";
import { ShareButton } from "./ShareButton";

// After
import { phaseGuide, phaseTone } from "../shared/phasePresentation";
import { ShareButton } from "../shared/ShareButton";
```
(Note: ActionBoard will be moved to `game/` in Task 5 — adjust relative paths accordingly when that happens.)

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: move shared presentation components into presentation/shared/"
```

---

### Task 4: Extract ViewerCard from GameScreen

**Files:**
- Create: `apps/web/src/presentation/game/ViewerCard.tsx` (new)
- Modify: `apps/web/src/presentation/GameScreen.tsx`

**Step 1: Create game/ folder**

```bash
mkdir -p apps/web/src/presentation/game
```

**Step 2: Create ViewerCard.tsx**

Create `apps/web/src/presentation/game/ViewerCard.tsx` with the following content:

```tsx
import { useTranslation } from "react-i18next";
import { Card } from "pixel-retroui";
import { Player } from "@imposter/shared";

interface Props {
  viewer: Player | undefined;
}

export const ViewerCard = ({ viewer }: Props) => {
  const { t } = useTranslation();

  return (
    <Card
      className="arcade-card"
      bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
      textColor="var(--neutral-white)"
      borderColor="var(--blue-500)"
      shadowColor="var(--blue-900)"
    >
      <div className="arcade-stack">
        <h2 className="arcade-panel-title">{t("game.you").toUpperCase()}</h2>
        {viewer ? (
          <dl className="arcade-dl">
            <div>
              <dt>{t("game.role").toUpperCase()}</dt>
              <dd>{viewer.role ?? t("game.roleLocked")}</dd>
            </div>
            <div>
              <dt>{t("game.name").toUpperCase()}</dt>
              <dd>{viewer.name}</dd>
            </div>
            <div>
              <dt>{t("game.word").toUpperCase()}</dt>
              <dd>{viewer.word ?? t("game.wordLocked")}</dd>
            </div>
          </dl>
        ) : (
          <p className="arcade-muted">{t("game.viewerUnavailable").toUpperCase()}</p>
        )}
      </div>
    </Card>
  );
};
```

**Step 3: Update GameScreen.tsx to use ViewerCard**

In `apps/web/src/presentation/GameScreen.tsx`:

Remove the inline viewer card JSX (the `<Card>` block containing `arcade-dl` with role/name/word). Remove the `resolveWordDisplay` function. Add the import and use `<ViewerCard viewer={viewer} />` in its place.

```ts
// Add import
import { ViewerCard } from "./game/ViewerCard";
```

Replace the inline Card block (approximately lines 99–125) with:
```tsx
<ViewerCard viewer={viewer} />
```

Also remove the `resolveWordDisplay` function and `isPreGame` variable (no longer needed in GameScreen after extraction; `ViewerCard` handles `viewer.word ?? t("game.wordLocked")` internally).

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: extract ViewerCard from GameScreen"
```

---

### Task 5: Extract RoundActionPanel from ActionBoard

**Files:**
- Create: `apps/web/src/presentation/round/RoundActionPanel.tsx` (new)
- Modify: `apps/web/src/presentation/ActionBoard.tsx`

**Step 1: Create round/ folder**

```bash
mkdir -p apps/web/src/presentation/round
```

**Step 2: Create RoundActionPanel.tsx**

Create `apps/web/src/presentation/round/RoundActionPanel.tsx`:

```tsx
import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameState, Player } from "@imposter/shared";

interface Props {
  gameState: GameState;
  playerId: string;
  viewerHost: boolean;
  viewer: Player | undefined;
  statement: string;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartVoting: () => void;
}

export const RoundActionPanel = ({
  gameState,
  playerId,
  viewerHost,
  viewer,
  statement,
  onStatementChange,
  onSubmitStatement,
  onStartVoting,
}: Props) => {
  const { t } = useTranslation();
  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;

  return (
    <>
      {viewer?.isAlive && currentSpeakerId === viewer.id && (
        <form className="arcade-stack" onSubmit={onSubmitStatement}>
          <label className="arcade-field">
            <span className="arcade-label">{t("game.yourStatement").toUpperCase()}</span>
            <input
              className="arcade-native-input"
              placeholder={t("game.statementPlaceholder")}
              value={statement}
              onChange={(event) => onStatementChange(event.target.value)}
              required
            />
          </label>
          <Button
            type="submit"
            className="arcade-btn"
            bg="var(--yellow-400)"
            textColor="var(--neutral-black)"
            borderColor="var(--neutral-black)"
            shadow="var(--yellow-700)"
          >
            {t("game.sendStatement").toUpperCase()}
          </Button>
        </form>
      )}
      {viewerHost && (
        <Button
          type="button"
          className="arcade-btn arcade-btn-primary"
          onClick={onStartVoting}
          bg="var(--pink-500)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--pink-700)"
        >
          {t("game.startVoting").toUpperCase()}
        </Button>
      )}
    </>
  );
};
```

Note: `RoundActionPanel` renders both `ROUND_DESCRIPTION` and `ROUND_DISCUSSION` content. `ActionBoard` will only render it when `phase` is one of those two — so the internal `viewerHost` button appearing for description phase is safe (it won't be rendered at all during `ROUND_DESCRIPTION` because `ActionBoard` only mounts `RoundActionPanel` during those two phases and the start-voting button is irrelevant for description anyway — if needed, add a `phase` prop and guard it).

**Step 3: Update ActionBoard.tsx to use RoundActionPanel**

In `apps/web/src/presentation/ActionBoard.tsx`:

Add import:
```ts
import { RoundActionPanel } from "../round/RoundActionPanel";
```

Remove the two phase blocks for `ROUND_DESCRIPTION` and `ROUND_DISCUSSION` and replace with:
```tsx
{(gameState.phase === Phase.ROUND_DESCRIPTION || gameState.phase === Phase.ROUND_DISCUSSION) && (
  <RoundActionPanel
    gameState={gameState}
    playerId={playerId}
    viewerHost={viewerHost}
    viewer={viewer}
    statement={statement}
    onStatementChange={onStatementChange}
    onSubmitStatement={onSubmitStatement}
    onStartVoting={onStartVoting}
  />
)}
```

Remove props from `ActionBoard`'s `Props` interface that are now only used by `RoundActionPanel` and not needed elsewhere: `statement`, `onStatementChange`, `onSubmitStatement`, `onStartVoting`. Keep them in `ActionBoard.Props` and pass-through for now to avoid cascading changes — they will remain in the interface for pass-through.

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: extract RoundActionPanel from ActionBoard"
```

---

### Task 6: Extract VotingPanel from ActionBoard

**Files:**
- Create: `apps/web/src/presentation/voting/VotingPanel.tsx` (new)
- Modify: `apps/web/src/presentation/ActionBoard.tsx`

**Step 1: Create voting/ folder**

```bash
mkdir -p apps/web/src/presentation/voting
```

**Step 2: Create VotingPanel.tsx**

Create `apps/web/src/presentation/voting/VotingPanel.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameMode, GameState, Player } from "@imposter/shared";
import { canViewerVote } from "../../domain/gameSelectors";

interface Props {
  gameState: GameState;
  playerId: string;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForName: string | undefined;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const VotingPanel = ({
  gameState,
  playerId,
  viewer,
  alivePlayers,
  viewerVotedForName,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const hasVoted = viewerVotedForName !== undefined;

  if (!viewer?.isAlive) return null;

  return (
    <div className="arcade-stack">
      {canViewerVote(gameState, viewer.id) ? (
        <>
          <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
          {viewerVotedForName && (
            <p className="arcade-muted">{t("game.currentVote").toUpperCase()}: {viewerVotedForName}</p>
          )}
          <div className="arcade-vote-grid">
            {alivePlayers
              .filter((player) => player.id !== playerId)
              .map((player) => (
                <Button
                  key={player.id}
                  type="button"
                  className="arcade-btn"
                  onClick={() => onSubmitVote(player.id)}
                  disabled={hasVoted}
                  bg="var(--blue-400)"
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow="var(--blue-700)"
                >
                  {player.name.toUpperCase()}
                </Button>
              ))}
            {gameState.settings.mode === GameMode.CLASSIC && (
              <Button
                type="button"
                className="arcade-btn"
                onClick={() => onSubmitVote(null)}
                disabled={hasVoted}
                bg="var(--blue-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--blue-700)"
              >
                {t("game.skip").toUpperCase()}
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="arcade-muted">{t("game.hardcoreVoteNotice").toUpperCase()}</p>
      )}
    </div>
  );
};
```

**Step 3: Update ActionBoard.tsx to use VotingPanel**

Add import:
```ts
import { VotingPanel } from "../voting/VotingPanel";
```

Replace the `ROUND_VOTING` block in `ActionBoard` with:
```tsx
{gameState.phase === Phase.ROUND_VOTING && (
  <VotingPanel
    gameState={gameState}
    playerId={playerId}
    viewer={viewer}
    alivePlayers={alivePlayers}
    viewerVotedForName={viewerVotedForName}
    onSubmitVote={onSubmitVote}
  />
)}
```

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: extract VotingPanel from ActionBoard"
```

---

### Task 7: Extract GameOverPanel from ActionBoard

**Files:**
- Create: `apps/web/src/presentation/game-over/GameOverPanel.tsx` (new)
- Modify: `apps/web/src/presentation/ActionBoard.tsx`

**Step 1: Create game-over/ folder**

```bash
mkdir -p apps/web/src/presentation/game-over
```

**Step 2: Create GameOverPanel.tsx**

Create `apps/web/src/presentation/game-over/GameOverPanel.tsx`:

```tsx
import { useTranslation } from "react-i18next";

interface Props {
  winnerReason: string | null | undefined;
}

export const GameOverPanel = ({ winnerReason }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="arcade-status-box">
      <p className="arcade-kicker">{t("game.finalReason").toUpperCase()}</p>
      <p className="arcade-guide-title">
        {(winnerReason ?? "NO REASON PROVIDED").toUpperCase()}
      </p>
    </div>
  );
};
```

**Step 3: Update ActionBoard.tsx to use GameOverPanel**

Add import:
```ts
import { GameOverPanel } from "../game-over/GameOverPanel";
```

Replace the `GAME_ENDED` block in `ActionBoard` with:
```tsx
{gameState.phase === Phase.GAME_ENDED && (
  <GameOverPanel winnerReason={gameState.winnerReason} />
)}
```

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: extract GameOverPanel from ActionBoard"
```

---

### Task 8: Move game/ files and update all remaining imports

**Files:**
- Move: `apps/web/src/presentation/GameScreen.tsx` → `apps/web/src/presentation/game/GameScreen.tsx`
- Move: `apps/web/src/presentation/ActionBoard.tsx` → `apps/web/src/presentation/game/ActionBoard.tsx`
- Move: `apps/web/src/presentation/PlayersPanel.tsx` → `apps/web/src/presentation/game/PlayersPanel.tsx`
- Modify: `apps/web/src/presentation/App.tsx`

**Step 1: Move files**

```bash
mv apps/web/src/presentation/GameScreen.tsx apps/web/src/presentation/game/
mv apps/web/src/presentation/ActionBoard.tsx apps/web/src/presentation/game/
mv apps/web/src/presentation/PlayersPanel.tsx apps/web/src/presentation/game/
```

**Step 2: Fix imports inside game/ files**

Each file in `game/` imports from sibling files and from parent folders. Update relative paths:

In `game/GameScreen.tsx`:
- `../role-reveal/WordRevealPopup` stays as-is (already set in Task 2, but relative from old location — now from `game/` it becomes `../role-reveal/WordRevealPopup`) ✓
- `./PlayersPanel` ✓ (sibling)
- `./ActionBoard` ✓ (sibling)
- `./ViewerCard` ✓ (sibling)
- `../../domain/gameSelectors` (was `../domain/gameSelectors`) — update depth

In `game/ActionBoard.tsx`:
- `../../domain/gameSelectors` (was `../domain/gameSelectors`)
- `../shared/phasePresentation` ✓
- `../shared/ShareButton` ✓
- `../round/RoundActionPanel` ✓
- `../voting/VotingPanel` ✓
- `../game-over/GameOverPanel` ✓

**Step 3: Update App.tsx**

```ts
// Before
import { GameScreen } from "./GameScreen";

// After
import { GameScreen } from "./game/GameScreen";
```

**Step 4: Verify**

```bash
yarn workspace @imposter/web build 2>&1 | tail -30
```
Expected: Clean build, zero TypeScript errors.

**Step 5: Commit**

```bash
git add apps/web/src/presentation/
git commit -m "refactor: move GameScreen, ActionBoard, PlayersPanel into presentation/game/"
```

---

### Task 9: Final verification

**Step 1: Run full build**

```bash
cd /Users/lanle98/Desktop/imposter_game
yarn workspace @imposter/web build 2>&1 | tail -30
```
Expected: Build succeeds with no errors.

**Step 2: Run type check**

```bash
yarn workspace @imposter/web tsc --noEmit 2>&1 | tail -30
```
Expected: No errors.

**Step 3: Confirm no orphan files remain at old paths**

```bash
ls apps/web/src/presentation/*.tsx apps/web/src/presentation/*.ts 2>&1
```
Expected: Only `App.tsx` and `index.css` remain at the root of `presentation/` (all other `.tsx/.ts` files are in subfolders).

**Step 4: Commit if any cleanup needed, otherwise done**

```bash
git add .
git commit -m "refactor: complete presentation phase-group reorganization"
```
