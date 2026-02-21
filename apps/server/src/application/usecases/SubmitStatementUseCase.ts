import { canSubmitStatement, markStatementSubmitted } from "../../domain/gameRules";
import { GameStateRepository } from "../model/GameStateRepository";

interface Input {
  roomId: string;
  playerId: string;        // phải là host
  targetSpeakerId: string; // player đang đến lượt nói
  statement: string;
}

export class SubmitStatementUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) throw new Error("Room not found");

    if (gameState.hostPlayerId !== input.playerId) {
      throw new Error("Only host can submit statements");
    }

    if (!canSubmitStatement(gameState, input.targetSpeakerId)) {
      throw new Error("Not your speaking turn");
    }

    markStatementSubmitted(gameState, input.targetSpeakerId, input.statement);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return gameState;
  }
}
