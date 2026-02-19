import { advanceAfterRound, applyRoundResult } from "../domain/gameRules";
import { GameStateRepository } from "./GameStateRepository";

interface Input {
  roomId: string;
  eliminatedPlayerId: string | null;
}

export class EliminatePlayerUseCase {
  constructor(
    private readonly repository: GameStateRepository,
    private readonly random: () => number = Math.random
  ) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    const eliminatedRole = applyRoundResult(gameState, input.eliminatedPlayerId);
    advanceAfterRound(gameState, eliminatedRole, this.random);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return gameState;
  }
}
