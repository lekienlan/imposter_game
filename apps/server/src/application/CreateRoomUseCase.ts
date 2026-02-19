import { GameState, Phase, Winner } from "@imposter/shared";
import { nanoid } from "nanoid";
import { GameStateRepository } from "./GameStateRepository";
import { resolvePlayerName } from "./resolvePlayerName";

interface Input {
  playerName: string;
  settings: GameState["settings"];
}

interface Output {
  gameState: GameState;
  playerId: string;
}

export class CreateRoomUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input): Promise<Output> {
    const roomId = nanoid(6).toUpperCase();
    const playerId = nanoid(8);
    const now = Date.now();
    const resolvedPlayerName = resolvePlayerName([], input.playerName);

    const gameState: GameState = {
      roomId,
      createdAt: now,
      updatedAt: now,
      hostPlayerId: playerId,
      phase: Phase.WAITING_FOR_PLAYERS,
      players: [
        {
          id: playerId,
          name: resolvedPlayerName,
          isHost: true,
          isAlive: true,
          joinedAt: now,
          role: null,
          word: null,
          statement: null,
          votedFor: null
        }
      ],
      settings: input.settings,
      round: 0,
      activeWordPair: null,
      speakingOrder: [],
      pendingSpeakerIds: [],
      votes: [],
      voteRound: 1,
      firstRoundTopTargetIds: [],
      eliminatedPlayerId: null,
      winner: Winner.NONE,
      winnerReason: null
    };

    await this.repository.save(gameState);
    return { gameState, playerId };
  }
}
