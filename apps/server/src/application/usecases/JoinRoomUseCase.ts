import { GameState, Phase } from '@imposter/shared';
import { nanoid } from 'nanoid';
import { GameStateRepository } from '../../infrastructure/model/GameStateRepository';
import { normalizePlayerName, resolvePlayerName } from '../../utils/resolvePlayerName';

interface Input {
  roomId: string;
  playerName: string;
}

interface Output {
  gameState: GameState;
  playerId: string;
}

export class JoinRoomUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input): Promise<Output> {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error('Room not found');
    }

    if (gameState.phase !== Phase.WAITING_FOR_PLAYERS && gameState.phase !== Phase.GAME_CREATION) {
      throw new Error('Game already started');
    }

    const normalizedPlayerName = normalizePlayerName(input.playerName);
    if (
      normalizedPlayerName &&
      gameState.players.some((player) => player.name === normalizedPlayerName)
    ) {
      throw new Error('Player name already taken');
    }

    const playerId = nanoid(8);
    const now = Date.now();
    const resolvedPlayerName = resolvePlayerName(gameState.players, input.playerName);

    gameState.players.push({
      id: playerId,
      name: resolvedPlayerName,
      isHost: false,
      isAlive: true,
      joinedAt: now,
      role: null,
      word: null,
      statement: null,
      votedFor: null,
    });

    gameState.updatedAt = now;
    await this.repository.save(gameState);
    return { gameState, playerId };
  }
}
