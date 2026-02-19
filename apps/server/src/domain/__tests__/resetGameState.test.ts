import { describe, expect, test } from "vitest";
import { GameMode, Phase, Role, Winner, type GameState } from "@imposter/shared";
import { resetGameState } from "../resetGameState";

const baseState = (): GameState => ({
  roomId: "ROOM1",
  createdAt: 1,
  updatedAt: 1,
  hostPlayerId: "p1",
  phase: Phase.ROUND_VOTING,
  settings: {
    mode: GameMode.CLASSIC,
    whiteEnabled: true,
    wordPairs: [{ citizen: "Cat", spy: "Tiger" }]
  },
  round: 2,
  activeWordPair: { citizen: "Cat", spy: "Tiger" },
  speakingOrder: ["p1", "p2", "p3"],
  pendingSpeakerIds: ["p2"],
  votes: [{ voterId: "p1", targetPlayerId: "p2", submittedAt: 1 }],
  voteRound: 2,
  firstRoundTopTargetIds: ["p2", "p3"],
  eliminatedPlayerId: "p3",
  winner: Winner.SPIES,
  winnerReason: "SPIES_PARITY_OR_CONTROL",
  players: [
    {
      id: "p1",
      name: "A",
      isHost: true,
      isAlive: true,
      joinedAt: 1,
      role: Role.CITIZEN,
      word: "Cat",
      statement: "A",
      votedFor: "p2"
    },
    {
      id: "p2",
      name: "B",
      isHost: false,
      isAlive: false,
      joinedAt: 2,
      role: Role.SPY,
      word: "Tiger",
      statement: "B",
      votedFor: "p1"
    },
    {
      id: "p3",
      name: "C",
      isHost: false,
      isAlive: true,
      joinedAt: 3,
      role: Role.WHITE,
      word: null,
      statement: "C",
      votedFor: null
    }
  ]
});

describe("resetGameState", () => {
  test("returns game to creation phase and clears round state", () => {
    const state = baseState();

    const reset = resetGameState(state);

    expect(reset.phase).toBe(Phase.GAME_CREATION);
    expect(reset.round).toBe(0);
    expect(reset.activeWordPair).toBeNull();
    expect(reset.speakingOrder).toEqual([]);
    expect(reset.pendingSpeakerIds).toEqual([]);
    expect(reset.votes).toEqual([]);
    expect(reset.voteRound).toBe(1);
    expect(reset.firstRoundTopTargetIds).toEqual([]);
    expect(reset.eliminatedPlayerId).toBeNull();
    expect(reset.winner).toBe(Winner.NONE);
    expect(reset.winnerReason).toBeNull();
    expect(reset.players.every((player) => player.isAlive)).toBe(true);
    expect(reset.players.every((player) => player.role === null)).toBe(true);
    expect(reset.players.every((player) => player.word === null)).toBe(true);
    expect(reset.players.every((player) => player.statement === null)).toBe(true);
    expect(reset.players.every((player) => player.votedFor === null)).toBe(true);
  });
});
