import { Phase } from "@imposter/shared";
import { GameStateRepository } from "./GameStateRepository";
import { canTransitionToVoting } from "../domain/gameRules";

interface Input {
  roomId: string;
  playerId: string;
}

export class StartVotingUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    if (gameState.hostPlayerId !== input.playerId) {
      throw new Error("Only host can start voting");
    }

    if (!canTransitionToVoting(gameState)) {
      throw new Error("Cannot start voting now");
    }

    gameState.votes = [];
    gameState.voteRound = 1;
    gameState.firstRoundTopTargetIds = [];
    gameState.players.forEach((player) => {
      player.votedFor = null;
    });
    gameState.phase = Phase.ROUND_VOTING;
    gameState.updatedAt = Date.now();

    await this.repository.save(gameState);
    return gameState;
  }
}
