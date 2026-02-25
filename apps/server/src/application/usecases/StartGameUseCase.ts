import { Phase, Winner } from '@imposter/shared';
import { GameStateRepository } from '../../infrastructure/model/GameStateRepository';
import {
  applyRolesAndWords,
  assignRoles,
  beginRoundDescription,
  pickWordPair,
} from '../../utils/gameRules';

interface Input {
  roomId: string;
  playerId: string;
}

export class StartGameUseCase {
  constructor(
    private readonly repository: GameStateRepository,
    private readonly random: () => number = Math.random,
  ) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error('Room not found');
    }

    if (gameState.hostPlayerId !== input.playerId) {
      throw new Error('Only host can start');
    }

    if (gameState.players.length < 3) {
      throw new Error('Need at least 3 players');
    }

    gameState.phase = Phase.LOBBY_READY;
    const roles = assignRoles(gameState.players, gameState.settings, this.random);
    const wordPair = pickWordPair(gameState.settings.wordPairs, this.random);

    gameState.players = applyRolesAndWords(gameState.players, roles, wordPair);
    gameState.activeWordPair = wordPair;
    gameState.round = 1;
    gameState.phase = Phase.ROLE_DISTRIBUTION;
    gameState.winner = Winner.NONE;
    gameState.winnerReason = null;
    beginRoundDescription(gameState, this.random);
    gameState.updatedAt = Date.now();

    await this.repository.save(gameState);
    return gameState;
  }
}
