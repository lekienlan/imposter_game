import { describe, expect, test } from "vitest";
import { GameMode, Phase, Role, Winner, type GameState } from "@imposter/shared";
import { advanceAfterRound, applyRoundResult, resolveVoting } from "../gameRules";

const baseState = (mode: GameMode): GameState => ({
  roomId: "ROOM1",
  createdAt: 1,
  updatedAt: 1,
  hostPlayerId: "p1",
  phase: Phase.ROUND_VOTING,
  settings: {
    mode,
    whiteEnabled: mode === GameMode.CLASSIC,
    wordPairs: [{ citizen: "Cat", spy: "Tiger" }]
  },
  round: 2,
  activeWordPair: { citizen: "Cat", spy: "Tiger" },
  speakingOrder: ["p1", "p2", "p3"],
  pendingSpeakerIds: [],
  votes: [],
  voteRound: 1,
  firstRoundTopTargetIds: [],
  eliminatedPlayerId: null,
  winner: Winner.NONE,
  winnerReason: null,
  players: [
    {
      id: "p1",
      name: "A",
      isHost: true,
      isAlive: true,
      joinedAt: 1,
      role: Role.CITIZEN,
      word: "Cat",
      statement: null,
      votedFor: null
    },
    {
      id: "p2",
      name: "B",
      isHost: false,
      isAlive: true,
      joinedAt: 2,
      role: Role.SPY,
      word: "Tiger",
      statement: null,
      votedFor: null
    },
    {
      id: "p3",
      name: "C",
      isHost: false,
      isAlive: true,
      joinedAt: 3,
      role: mode === GameMode.CLASSIC ? Role.WHITE : Role.SPY,
      word: null,
      statement: null,
      votedFor: null
    }
  ]
});

describe("resolveVoting", () => {
  test("starts a re-vote on first tie", () => {
    const state = baseState(GameMode.CLASSIC);
    state.votes = [
      { voterId: "p1", targetPlayerId: "p2", submittedAt: 1 },
      { voterId: "p2", targetPlayerId: "p1", submittedAt: 1 },
      { voterId: "p3", targetPlayerId: null, submittedAt: 1 }
    ];

    const result = resolveVoting(state);
    expect(result.status).toBe("REVOTE");
    expect(state.voteRound).toBe(2);
    expect(state.votes).toHaveLength(0);
  });
});

describe("advanceAfterRound", () => {
  test("classic loses immediately when white is eliminated in round 1-2", () => {
    const state = baseState(GameMode.CLASSIC);
    state.round = 2;

    const eliminatedRole = applyRoundResult(state, "p3");
    advanceAfterRound(state, eliminatedRole, () => 0.2);

    expect(state.winner).toBe(Winner.SPIES);
    expect(state.phase).toBe(Phase.GAME_ENDED);
  });

  test("hardcore loses immediately when citizen is eliminated", () => {
    const state = baseState(GameMode.HARDCORE);

    const eliminatedRole = applyRoundResult(state, "p1");
    advanceAfterRound(state, eliminatedRole, () => 0.2);

    expect(state.winner).toBe(Winner.SPIES);
    expect(state.phase).toBe(Phase.GAME_ENDED);
  });
});
