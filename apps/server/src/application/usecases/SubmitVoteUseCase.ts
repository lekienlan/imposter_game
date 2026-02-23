import { Phase, Vote } from '@imposter/shared';
import { resolveVoting, upsertVote, retractVote } from '../../domain/gameRules';
import { GameStateRepository } from '../model/GameStateRepository';

interface Input {
  roomId: string;
  playerId: string;
  targetPlayerId: string | null;
}

export class SubmitVoteUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error('Room not found');
    }

    if (gameState.phase !== Phase.ROUND_VOTING) {
      throw new Error('Not voting phase');
    }

    if (gameState.hostPlayerId !== input.playerId) {
      throw new Error('Only host can submit votes');
    }

    const voter = gameState.players.find((player) => player.id === input.playerId);
    if (!voter || !voter.isAlive) {
      throw new Error('Invalid voter');
    }

    const target = input.targetPlayerId
      ? gameState.players.find((player) => player.id === input.targetPlayerId)
      : null;
    if (input.targetPlayerId && (!target || !target.isAlive)) {
      throw new Error('Invalid vote target');
    }

    const existingVote = gameState.votes.find((v) => v.voterId === input.playerId);
    const isSameTarget = existingVote?.targetPlayerId === input.targetPlayerId;

    if (isSameTarget) {
      retractVote(gameState, input.playerId);
    } else {
      const vote: Vote = {
        voterId: input.playerId,
        targetPlayerId: input.targetPlayerId,
        submittedAt: Date.now(),
      };
      upsertVote(gameState, vote);
      voter.votedFor = input.targetPlayerId;
    }
    const resolution = resolveVoting(gameState);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return { gameState, resolution };
  }
}
