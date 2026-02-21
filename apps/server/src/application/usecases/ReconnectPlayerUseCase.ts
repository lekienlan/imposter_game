import { GameStateRepository } from "../model/GameStateRepository";

interface Input {
  roomId: string;
  playerId: string;
}

export class ReconnectPlayerUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    const player = gameState.players.find((candidate) => candidate.id === input.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    await this.repository.touch(input.roomId);
    return gameState;
  }
}
