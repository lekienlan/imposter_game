import { RoomPreviewResponse } from "@imposter/shared";
import { GameStateRepository } from "./GameStateRepository";

interface Input {
  roomId: string;
}

export class PreviewRoomUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input): Promise<RoomPreviewResponse> {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    const hostName = gameState.players.find((p) => p.isHost)?.name ?? "";
    const playerNames = gameState.players.map((p) => p.name);

    return {
      roomId: gameState.roomId,
      hostName,
      phase: gameState.phase,
      playerCount: gameState.players.length,
      playerNames
    };
  }
}
