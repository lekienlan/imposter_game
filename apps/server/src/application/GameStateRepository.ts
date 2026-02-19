import { GameState } from "@imposter/shared";

export interface GameStateRepository {
  getByRoomId(roomId: string): Promise<GameState | null>;
  save(gameState: GameState): Promise<void>;
  touch(roomId: string): Promise<void>;
}
