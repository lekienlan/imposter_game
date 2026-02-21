import { GameStateRepository } from "../model/GameStateRepository";
import { resetGameState } from "../../domain/resetGameState";

interface Input {
  roomId: string;
  playerId: string;
}

export class ResetGameUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    const resetState = resetGameState(gameState);
    await this.repository.save(resetState);
    return resetState;
  }
}
