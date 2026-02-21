# Re-vote + Vote Highlight Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to change or retract their vote during voting phase, with clear visual highlighting on the selected vote button.

**Architecture:** Server already supports `upsertVote` (replaces existing vote). We add `retractVote` domain logic so clicking the same target twice removes the vote. Client drops `disabled={hasVoted}`, replaces `viewerVotedForName` with `viewerVotedForId` across the prop chain, and highlights the selected button in yellow.

**Tech Stack:** TypeScript, React, Socket.IO, Vitest (server tests), pixel-retroui Button component.

---

### Task 1: Add `retractVote` domain function with tests

**Files:**
- Modify: `apps/server/src/domain/gameRules.ts`
- Test: `apps/server/src/domain/__tests__/gameRules.test.ts`

**Step 1: Write the failing tests**

Open `apps/server/src/domain/__tests__/gameRules.test.ts` and add these tests at the bottom (after the existing `describe` blocks):

```typescript
import { upsertVote, retractVote } from "../gameRules";

describe("retractVote", () => {
  test("removes the vote from votes array", () => {
    const state = baseState(GameMode.CLASSIC);
    upsertVote(state, { voterId: "p1", targetPlayerId: "p2", submittedAt: 1 });
    expect(state.votes).toHaveLength(1);

    retractVote(state, "p1");
    expect(state.votes).toHaveLength(0);
  });

  test("resets the player votedFor to null", () => {
    const state = baseState(GameMode.CLASSIC);
    state.players[0].votedFor = "p2";
    upsertVote(state, { voterId: "p1", targetPlayerId: "p2", submittedAt: 1 });

    retractVote(state, "p1");
    expect(state.players[0].votedFor).toBeNull();
  });

  test("does nothing if voter has no vote", () => {
    const state = baseState(GameMode.CLASSIC);
    expect(() => retractVote(state, "p1")).not.toThrow();
    expect(state.votes).toHaveLength(0);
  });

  test("only removes the matching voter's vote, leaves others", () => {
    const state = baseState(GameMode.CLASSIC);
    upsertVote(state, { voterId: "p1", targetPlayerId: "p2", submittedAt: 1 });
    upsertVote(state, { voterId: "p2", targetPlayerId: "p1", submittedAt: 2 });

    retractVote(state, "p1");
    expect(state.votes).toHaveLength(1);
    expect(state.votes[0].voterId).toBe("p2");
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
cd apps/server && yarn test --run
```

Expected: 4 new tests fail with `retractVote is not a function`.

**Step 3: Implement `retractVote` in gameRules.ts**

Open `apps/server/src/domain/gameRules.ts`. Add this function directly after `upsertVote`:

```typescript
export const retractVote = (gameState: GameState, voterId: string): void => {
  const voteIndex = gameState.votes.findIndex((v) => v.voterId === voterId);
  if (voteIndex < 0) return;
  gameState.votes.splice(voteIndex, 1);
  const player = gameState.players.find((p) => p.id === voterId);
  if (player) {
    player.votedFor = null;
  }
};
```

**Step 4: Run tests to confirm they pass**

```bash
cd apps/server && yarn test --run
```

Expected: All tests pass including the 4 new ones.

**Step 5: Commit**

```bash
git add apps/server/src/domain/gameRules.ts apps/server/src/domain/__tests__/gameRules.test.ts
git commit -m "feat(server): add retractVote domain function"
```

---

### Task 2: Update `SubmitVoteUseCase` to retract on same-target re-vote

**Files:**
- Modify: `apps/server/src/application/usecases/SubmitVoteUseCase.ts`

**Step 1: Update the import line**

In `SubmitVoteUseCase.ts`, change the import to include `retractVote`:

```typescript
import { resolveVoting, upsertVote, retractVote } from "../../domain/gameRules";
```

**Step 2: Replace the vote insertion block**

Find this section (around line 43-47):

```typescript
    const vote: Vote = {
      voterId: input.playerId,
      targetPlayerId: input.targetPlayerId,
      submittedAt: Date.now()
    };

    upsertVote(gameState, vote);
    voter.votedFor = input.targetPlayerId;
```

Replace with:

```typescript
    const existingVote = gameState.votes.find((v) => v.voterId === input.playerId);
    const isSameTarget = existingVote?.targetPlayerId === input.targetPlayerId;

    if (isSameTarget) {
      retractVote(gameState, input.playerId);
    } else {
      const vote: Vote = {
        voterId: input.playerId,
        targetPlayerId: input.targetPlayerId,
        submittedAt: Date.now()
      };
      upsertVote(gameState, vote);
      voter.votedFor = input.targetPlayerId;
    }
```

**Step 3: Build to check for type errors**

```bash
cd apps/server && yarn build
```

Expected: No TypeScript errors.

**Step 4: Commit**

```bash
git add apps/server/src/application/usecases/SubmitVoteUseCase.ts
git commit -m "feat(server): retract vote when same target re-submitted"
```

---

### Task 3: Update client prop chain — replace `viewerVotedForName` with `viewerVotedForId`

**Files:**
- Modify: `apps/web/src/presentation/App.tsx`
- Modify: `apps/web/src/presentation/game/GameScreen.tsx`
- Modify: `apps/web/src/presentation/game/ActionBoard.tsx`

**Step 1: Update `App.tsx`**

Find this block (around line 200):

```typescript
  const viewerVotedForName =
    viewer?.votedFor ? gameState.players.find((player) => player.id === viewer.votedFor)?.name : undefined;
```

Replace with:

```typescript
  const viewerVoteEntry = gameState.votes.find((v) => v.voterId === playerId);
  const viewerVotedForId: string | null | undefined =
    viewerVoteEntry !== undefined ? viewerVoteEntry.targetPlayerId : undefined;
```

Then in the `<GameScreen>` JSX, change the prop:

```tsx
viewerVotedForId={viewerVotedForId}
```

(was `viewerVotedForName={viewerVotedForName}`)

**Step 2: Update `GameScreen.tsx`**

In the `Props` interface, change:

```typescript
  viewerVotedForName: string | undefined;
```

to:

```typescript
  viewerVotedForId: string | null | undefined;
```

In the destructured props and in the `<ActionBoard>` JSX, rename accordingly:
- Destructure: `viewerVotedForId` instead of `viewerVotedForName`
- Pass to ActionBoard: `viewerVotedForId={viewerVotedForId}`

**Step 3: Update `ActionBoard.tsx`**

In the `Props` interface, change:

```typescript
  viewerVotedForName: string | undefined;
```

to:

```typescript
  viewerVotedForId: string | null | undefined;
```

In the destructured props and in the `<VotingPanel>` JSX, rename accordingly:
- Destructure: `viewerVotedForId`
- Pass to VotingPanel: `viewerVotedForId={viewerVotedForId}`

**Step 4: Build to check for type errors**

```bash
cd apps/web && yarn build
```

Expected: TypeScript errors in `VotingPanel.tsx` only (prop not yet updated there). Fix those in Task 4.

**Step 5: Commit** (after Task 4 fixes build)

Hold commit — do it together with Task 4.

---

### Task 4: Update `VotingPanel` — enable re-vote + highlight selected button

**Files:**
- Modify: `apps/web/src/presentation/voting/VotingPanel.tsx`

**Step 1: Replace the entire `VotingPanel.tsx` content**

The file is small (under 70 lines). Replace it with:

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
  viewerVotedForId: string | null | undefined;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const VotingPanel = ({
  gameState,
  playerId,
  viewer,
  alivePlayers,
  viewerVotedForId,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const hasVoted = viewerVotedForId !== undefined;
  const votedForName =
    typeof viewerVotedForId === "string"
      ? alivePlayers.find((p) => p.id === viewerVotedForId)?.name
      : undefined;

  if (!viewer?.isAlive) {
    return null;
  }

  return (
    <div className="arcade-stack">
      {canViewerVote(gameState, viewer.id) ? (
        <>
          <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
          {hasVoted && (
            <p className="arcade-muted">
              {t("game.currentVote").toUpperCase()}:{" "}
              {votedForName ?? t("game.skip").toUpperCase()}
            </p>
          )}
          <div className="arcade-vote-grid">
            {alivePlayers
              .filter((player) => player.id !== playerId)
              .map((player) => {
                const isSelected = viewerVotedForId === player.id;
                return (
                  <Button
                    key={player.id}
                    type="button"
                    className="arcade-btn"
                    onClick={() => onSubmitVote(player.id)}
                    bg={isSelected ? "var(--yellow-400)" : "var(--blue-400)"}
                    textColor="var(--neutral-black)"
                    borderColor="var(--neutral-black)"
                    shadow={isSelected ? "var(--yellow-700)" : "var(--blue-700)"}
                  >
                    {player.name.toUpperCase()}
                  </Button>
                );
              })}
            {gameState.settings.mode === GameMode.CLASSIC && (() => {
              const isSkipSelected = viewerVotedForId === null;
              return (
                <Button
                  type="button"
                  className="arcade-btn"
                  onClick={() => onSubmitVote(null)}
                  bg={isSkipSelected ? "var(--yellow-400)" : "var(--blue-400)"}
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow={isSkipSelected ? "var(--yellow-700)" : "var(--blue-700)"}
                >
                  {t("game.skip").toUpperCase()}
                </Button>
              );
            })()}
          </div>
        </>
      ) : (
        <p className="arcade-muted">{t("game.hardcoreVoteNotice").toUpperCase()}</p>
      )}
    </div>
  );
};
```

**Key changes:**
- `viewerVotedForName` → `viewerVotedForId: string | null | undefined`
- `disabled={hasVoted}` removed from all buttons
- Selected player button: yellow bg + yellow shadow
- Skip button: yellow when `viewerVotedForId === null`
- "CURRENT VOTE:" shows name if voted player, or "SKIP" if voted skip

**Step 2: Build to verify no errors**

```bash
cd apps/web && yarn build
```

Expected: Clean build with no TypeScript errors.

**Step 3: Commit both Tasks 3 and 4 together**

```bash
git add \
  apps/web/src/presentation/App.tsx \
  apps/web/src/presentation/game/GameScreen.tsx \
  apps/web/src/presentation/game/ActionBoard.tsx \
  apps/web/src/presentation/voting/VotingPanel.tsx
git commit -m "feat(web): enable re-vote with yellow highlight on selected vote button"
```

---

## Manual Testing Checklist

After all tasks:

1. Start a game with 3+ players and enter voting phase
2. Player A clicks a vote button → button turns yellow, "CURRENT VOTE: X" appears
3. Player A clicks a different player → yellow moves to new player
4. Player A clicks their currently-selected (yellow) player → vote removed, all buttons return to blue, "CURRENT VOTE" line disappears
5. In CLASSIC mode: clicking Skip → Skip button turns yellow; clicking Skip again → deselected
6. In HARDCORE mode: Skip button not shown; only citizens can vote (unchanged behavior)
7. Verify server resolves voting correctly when all required players have voted
