import Redis from "ioredis";
import { GameState } from "@imposter/shared";
import { GameStateRepository } from "../application/GameStateRepository";

export class RedisGameStateRepository implements GameStateRepository {
  private readonly ttlSeconds = 60 * 60 * 4;

  constructor(private readonly redis: Redis) {}

  private key(roomId: string): string {
    return `room:${roomId}`;
  }

  async getByRoomId(roomId: string): Promise<GameState | null> {
    const raw = await this.redis.get(this.key(roomId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as GameState;
  }

  async save(gameState: GameState): Promise<void> {
    await this.redis.set(this.key(gameState.roomId), JSON.stringify(gameState), "EX", this.ttlSeconds);
  }

  async touch(roomId: string): Promise<void> {
    await this.redis.expire(this.key(roomId), this.ttlSeconds);
  }
}
