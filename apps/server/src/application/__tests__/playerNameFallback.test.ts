import { describe, expect, test } from 'vitest';
import { GameMode, GameState } from '@imposter/shared';
import { CreateRoomUseCase } from '../usecases/CreateRoomUseCase';
import { GameStateRepository } from '../../infrastructure/model/GameStateRepository';
import { JoinRoomUseCase } from '../usecases/JoinRoomUseCase';

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

const settings: GameState['settings'] = {
  mode: GameMode.CLASSIC,
  whiteEnabled: true,
  wordPairs: [{ citizen: 'Apple', spy: 'Pear' }],
};

describe('player name fallback', () => {
  test('assigns Player 1 when host creates room with empty name', async () => {
    const repository = new InMemoryGameStateRepository();
    const useCase = new CreateRoomUseCase(repository);

    const { gameState } = await useCase.execute({ playerName: '   ', settings });

    expect(gameState.players[0]?.name).toBe('Player 1');
  });

  test('assigns Player {order} when joining with empty name', async () => {
    const repository = new InMemoryGameStateRepository();
    const createRoomUseCase = new CreateRoomUseCase(repository);
    const joinRoomUseCase = new JoinRoomUseCase(repository);
    const { gameState } = await createRoomUseCase.execute({ playerName: '', settings });

    await joinRoomUseCase.execute({ roomId: gameState.roomId, playerName: '' });
    const joinedResult = await joinRoomUseCase.execute({
      roomId: gameState.roomId,
      playerName: '  ',
    });

    expect(joinedResult.gameState.players[1]?.name).toBe('Player 2');
    expect(joinedResult.gameState.players[2]?.name).toBe('Player 3');
  });

  test('keeps duplicate-name check for explicit input after trim', async () => {
    const repository = new InMemoryGameStateRepository();
    const createRoomUseCase = new CreateRoomUseCase(repository);
    const joinRoomUseCase = new JoinRoomUseCase(repository);
    const { gameState } = await createRoomUseCase.execute({ playerName: 'Alice', settings });

    await expect(
      joinRoomUseCase.execute({ roomId: gameState.roomId, playerName: ' Alice ' }),
    ).rejects.toThrow('Player name already taken');
  });
});
