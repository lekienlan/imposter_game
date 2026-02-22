import { describe, expect, test } from "vitest";
import { GameMode, GameState, Phase, Winner } from "@imposter/shared";
import { GameStateRepository } from "../model/GameStateRepository";
import { SubmitStatementUseCase } from "../usecases/SubmitStatementUseCase";

class InMemoryRepo implements GameStateRepository {
  private store = new Map<string, GameState>();
  async getByRoomId(roomId: string) { return this.store.get(roomId) ?? null; }
  async save(gameState: GameState) { this.store.set(gameState.roomId, gameState); }
  async touch(_roomId: string) {}
  async delete(_roomId: string) {}
}

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  roomId: "R1", hostPlayerId: "host",
  phase: Phase.ROUND_DESCRIPTION,
  players: [
    { id: "host", name: "Host", isHost: true, isAlive: true, joinedAt: 1, role: null, word: null, statement: null, votedFor: null },
    { id: "p2",   name: "Bob",  isHost: false, isAlive: true, joinedAt: 2, role: null, word: null, statement: null, votedFor: null },
  ],
  round: 1, activeWordPair: null,
  speakingOrder: ["p2"], pendingSpeakerIds: ["p2"],
  votes: [], voteRound: 1, firstRoundTopTargetIds: [],
  eliminatedPlayerId: null, winner: Winner.NONE, winnerReason: null,
  settings: { mode: GameMode.CLASSIC, whiteEnabled: false, wordPairs: [] },
  createdAt: 1, updatedAt: 1,
  ...overrides,
});

describe("SubmitStatementUseCase – host authorization", () => {
  test("host can submit statement on behalf of current speaker", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState());
    const useCase = new SubmitStatementUseCase(repo);
    const result = await useCase.execute({ roomId: "R1", playerId: "host", targetSpeakerId: "p2", statement: "hello" });
    const p2 = result.players.find(p => p.id === "p2");
    expect(p2?.statement).toBe("hello");
  });

  test("non-host cannot submit statement", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState());
    const useCase = new SubmitStatementUseCase(repo);
    await expect(
      useCase.execute({ roomId: "R1", playerId: "p2", targetSpeakerId: "p2", statement: "hello" })
    ).rejects.toThrow("Only host can submit statements");
  });

  test("host cannot submit for a player who is not the current speaker", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState({ pendingSpeakerIds: ["p2"] }));
    const useCase = new SubmitStatementUseCase(repo);
    await expect(
      useCase.execute({ roomId: "R1", playerId: "host", targetSpeakerId: "host", statement: "hello" })
    ).rejects.toThrow("Not your speaking turn");
  });
});
