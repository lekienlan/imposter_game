import { canSubmitStatement, markStatementSubmitted } from "../domain/gameRules";
import { GameStateRepository } from "./GameStateRepository";

interface Input {
  roomId: string;
  playerId: string;
  statement: string;
}

export class SubmitStatementUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    if (!canSubmitStatement(gameState, input.playerId)) {
      throw new Error("Not your speaking turn");
    }

    markStatementSubmitted(gameState, input.playerId, input.statement);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return gameState;
  }
}
