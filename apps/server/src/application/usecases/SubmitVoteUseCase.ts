import { GameMode, Phase, Role, Vote } from "@imposter/shared";
import { resolveVoting, upsertVote } from "../domain/gameRules";
import { GameStateRepository } from "./GameStateRepository";

interface Input {
  roomId: string;
  playerId: string;
  targetPlayerId: string | null;
}

export class SubmitVoteUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) {
      throw new Error("Room not found");
    }

    if (gameState.phase !== Phase.ROUND_VOTING) {
      throw new Error("Not voting phase");
    }

    const voter = gameState.players.find((player) => player.id === input.playerId);
    if (!voter || !voter.isAlive) {
      throw new Error("Invalid voter");
    }

    if (gameState.settings.mode === GameMode.HARDCORE) {
      if (voter.role !== Role.CITIZEN) {
        throw new Error("Only citizens can cast real votes in HARDCORE");
      }
      if (!input.targetPlayerId) {
        throw new Error("Skip is not allowed in HARDCORE");
      }
    }

    const target = input.targetPlayerId ? gameState.players.find((player) => player.id === input.targetPlayerId) : null;
    if (input.targetPlayerId && (!target || !target.isAlive)) {
      throw new Error("Invalid vote target");
    }

    const vote: Vote = {
      voterId: input.playerId,
      targetPlayerId: input.targetPlayerId,
      submittedAt: Date.now()
    };

    upsertVote(gameState, vote);
    voter.votedFor = input.targetPlayerId;
    const resolution = resolveVoting(gameState);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return { gameState, resolution };
  }
}
