import { describe, expect, test } from 'vitest';
import { GameMode, GameState, Phase, Winner } from '@imposter/shared';
import { GameStateRepository } from '../model/GameStateRepository';
import { PreviewRoomUseCase } from '../usecases/PreviewRoomUseCase';

class InMemoryGameStateRepository implements GameStateRepository {
  private readonly store = new Map<string, GameState>();

  async getByRoomId(roomId: string): Promise<GameState | null> {
    return this.store.get(roomId) ?? null;
  }

  async save(gameState: GameState): Promise<void> {
    this.store.set(gameState.roomId, gameState);
  }

  async touch(_roomId: string): Promise<void> {
    return Promise.resolve();
  }

  async delete(_roomId: string): Promise<void> {
    return Promise.resolve();
  }
}

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  roomId: 'ROOM1',
  hostPlayerId: 'p1',
  phase: Phase.WAITING_FOR_PLAYERS,
  players: [
    {
      id: 'p1',
      name: 'Alice',
      isHost: true,
      isAlive: true,
      joinedAt: 1000,
      role: null,
      word: null,
      statement: null,
      votedFor: null,
    },
    {
      id: 'p2',
      name: 'Bob',
      isHost: false,
      isAlive: true,
      joinedAt: 2000,
      role: null,
      word: null,
      statement: null,
      votedFor: null,
    },
  ],
  round: 0,
  activeWordPair: null,
  speakingOrder: [],
  pendingSpeakerIds: [],
  votes: [],
  voteRound: 0,
  firstRoundTopTargetIds: [],
  eliminatedPlayerId: null,
  winner: Winner.NONE,
  winnerReason: null,
  settings: {
    mode: GameMode.CLASSIC,
    whiteEnabled: false,
    wordPairs: [{ citizen: 'Apple', spy: 'Pear' }],
  },
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
});

describe('PreviewRoomUseCase', () => {
  test('returns correct preview data for existing room', async () => {
    const repository = new InMemoryGameStateRepository();
    const gameState = makeGameState();
    await repository.save(gameState);

    const useCase = new PreviewRoomUseCase(repository);
    const result = await useCase.execute({ roomId: 'ROOM1' });

    expect(result.roomId).toBe('ROOM1');
    expect(result.hostName).toBe('Alice');
    expect(result.phase).toBe(Phase.WAITING_FOR_PLAYERS);
    expect(result.playerCount).toBe(2);
    expect(result.playerNames).toEqual(['Alice', 'Bob']);
  });

  test('throws error when room does not exist', async () => {
    const repository = new InMemoryGameStateRepository();
    const useCase = new PreviewRoomUseCase(repository);

    await expect(useCase.execute({ roomId: 'NOPE' })).rejects.toThrow('Room not found');
  });

  test('returns empty hostName when no host player found', async () => {
    const repository = new InMemoryGameStateRepository();
    const gameState = makeGameState({
      players: [
        {
          id: 'p1',
          name: 'Alice',
          isHost: false,
          isAlive: true,
          joinedAt: 1000,
          role: null,
          word: null,
          statement: null,
          votedFor: null,
        },
      ],
    });
    await repository.save(gameState);

    const useCase = new PreviewRoomUseCase(repository);
    const result = await useCase.execute({ roomId: 'ROOM1' });

    expect(result.hostName).toBe('');
  });
});
