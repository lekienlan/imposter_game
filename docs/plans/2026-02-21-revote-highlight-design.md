# Design: Re-vote with Deselect & Vote Highlight

**Date:** 2026-02-21
**Status:** Approved

## Problem

Once a user submits a vote, all vote buttons are disabled (`disabled={hasVoted}`). Users cannot change their vote. There is also no visual indication of which player was voted for — only a plain text line above the grid.

## Goal

- Allow users to re-vote (change their vote) at any time during the voting phase
- Allow users to deselect their vote by clicking the same player again
- Clearly highlight the currently selected vote button

## Approach

**Option A — same target = retract (chosen):**
No new socket events. Clicking the same player submits the same vote again. The server detects same-target re-vote and removes the vote. Clicking a different player changes the vote.

## Server Changes

### `apps/server/src/domain/gameRules.ts`
- Add `retractVote(gameState: GameState, voterId: string): void`
  - Removes the vote from `votes[]`
  - Resets `player.votedFor = null`

### `apps/server/src/application/SubmitVoteUseCase.ts`
- Before `upsertVote`, check if voter already has a vote for the **same** `targetPlayerId`
- If same → call `retractVote` (remove vote)
- If different → call `upsertVote` (change vote) as before

### `apps/server/src/domain/__tests__/gameRules.test.ts`
- Add unit tests for `retractVote`

## Client Changes

### Prop chain rename: `viewerVotedForName` → `viewerVotedForId`

| File | Change |
|------|--------|
| `App.tsx` | Compute from `gameState.votes.find(v => v.voterId === playerId)?.targetPlayerId` — `undefined` = not voted, `null` = voted skip, `string` = voted player ID |
| `GameScreen.tsx` | Rename prop type |
| `ActionBoard.tsx` | Rename prop type |
| `VotingPanel.tsx` | Full update (see below) |

### `VotingPanel.tsx`
- Accept `viewerVotedForId: string | null | undefined`
- Remove `disabled={hasVoted}` from all buttons
- Highlight selected player button with yellow (bg `var(--yellow-400)`, shadow `var(--yellow-700)`)
- Highlight skip button with yellow if `viewerVotedForId === null` (voted skip)
- Unselected buttons remain blue as today
- Derive display name for "CURRENT VOTE: {name}" from `alivePlayers` using the ID

## UX Summary

- Selected vote = yellow button (same palette as "Start Game")
- Unselected = blue as today
- Click selected button → retracts vote (becomes unselected)
- Click different button → changes vote
- "CURRENT VOTE: {name}" text remains above the grid for clarity
