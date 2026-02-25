import { GameStateRepository } from '../../infrastructure/model/GameStateRepository';

interface Input {
  roomId: string;
  playerId: string;
}

export class DisbandRoomUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input): Promise<void> {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error('Room not found');
    }
    if (input.playerId !== gameState.hostPlayerId) {
      throw new Error('Only the host can disband the room');
    }
    await this.repository.delete(input.roomId);
  }
}
