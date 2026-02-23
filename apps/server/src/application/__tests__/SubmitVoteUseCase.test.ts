import { describe, expect, test } from 'vitest';
import { GameMode, GameState, Phase, Role, Winner } from '@imposter/shared';
import { GameStateRepository } from '../model/GameStateRepository';
import { SubmitVoteUseCase } from '../usecases/SubmitVoteUseCase';

class InMemoryRepo implements GameStateRepository {
  private store = new Map<string, GameState>();
  async getByRoomId(roomId: string) {
    return this.store.get(roomId) ?? null;
  }
  async save(gameState: GameState) {
    this.store.set(gameState.roomId, gameState);
  }
  async touch(_roomId: string) {}
  async delete(_roomId: string) {}
}

const makeVotingState = (): GameState => ({
  roomId: 'R1',
  hostPlayerId: 'host',
  phase: Phase.ROUND_VOTING,
  players: [
    {
      id: 'host',
      name: 'Host',
      isHost: true,
      isAlive: true,
      joinedAt: 1,
      role: Role.CITIZEN,
      word: 'apple',
      statement: null,
      votedFor: null,
    },
    {
      id: 'p2',
      name: 'Bob',
      isHost: false,
      isAlive: true,
      joinedAt: 2,
      role: Role.SPY,
      word: 'pear',
      statement: null,
      votedFor: null,
    },
    {
      id: 'p3',
      name: 'Cat',
      isHost: false,
      isAlive: true,
      joinedAt: 3,
      role: Role.CITIZEN,
      word: 'apple',
      statement: null,
      votedFor: null,
    },
  ],
  round: 1,
  activeWordPair: { citizen: 'apple', spy: 'pear' },
  speakingOrder: [],
  pendingSpeakerIds: [],
  votes: [],
  voteRound: 1,
  firstRoundTopTargetIds: [],
  eliminatedPlayerId: null,
  winner: Winner.NONE,
  winnerReason: null,
  settings: { mode: GameMode.CLASSIC, whiteEnabled: false, wordPairs: [] },
  createdAt: 1,
  updatedAt: 1,
});

describe('SubmitVoteUseCase – host authorization', () => {
  test('host vote resolves immediately to ELIMINATED', async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeVotingState());
    const useCase = new SubmitVoteUseCase(repo);
    const { gameState, resolution } = await useCase.execute({
      roomId: 'R1',
      playerId: 'host',
      targetPlayerId: 'p2',
    });
    expect(gameState.votes.some((v) => v.voterId === 'host' && v.targetPlayerId === 'p2')).toBe(
      true,
    );
    expect(resolution.status).toBe('ELIMINATED');
    expect(resolution.eliminatedPlayerId).toBe('p2');
  });

  test('non-host cannot cast vote', async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeVotingState());
    const useCase = new SubmitVoteUseCase(repo);
    await expect(
      useCase.execute({ roomId: 'R1', playerId: 'p2', targetPlayerId: 'p3' }),
    ).rejects.toThrow('Only host can submit votes');
  });
});
