import {
  ClientToServerEvents,
  CreateRoomRequest,
  GameState,
  JoinRoomRequest,
  ResetGameRequest,
  ReconnectRequest,
  RoomPreviewRequest,
  ServerToClientEvents,
  StartGameRequest,
  StartVotingRequest,
  SubmitStatementRequest,
  SubmitVoteRequest
} from "@imposter/shared";
import { Server, Socket } from "socket.io";
import { CreateRoomUseCase } from "../application/usecases/CreateRoomUseCase";
import { EliminatePlayerUseCase } from "../application/usecases/EliminatePlayerUseCase";
import { JoinRoomUseCase } from "../application/usecases/JoinRoomUseCase";
import { PreviewRoomUseCase } from "../application/usecases/PreviewRoomUseCase";
import { ResetGameUseCase } from "../application/usecases/ResetGameUseCase";
import { ReconnectPlayerUseCase } from "../application/usecases/ReconnectPlayerUseCase";
import { StartGameUseCase } from "../application/usecases/StartGameUseCase";
import { StartVotingUseCase } from "../application/usecases/StartVotingUseCase";
import { SubmitStatementUseCase } from "../application/usecases/SubmitStatementUseCase";
import { SubmitVoteUseCase } from "../application/usecases/SubmitVoteUseCase";
import { sanitizeGameStateForViewer } from "../domain/gameRules";

interface UseCases {
  createRoom: CreateRoomUseCase;
  joinRoom: JoinRoomUseCase;
  previewRoom: PreviewRoomUseCase;
  resetGame: ResetGameUseCase;
  startGame: StartGameUseCase;
  submitStatement: SubmitStatementUseCase;
  startVoting: StartVotingUseCase;
  submitVote: SubmitVoteUseCase;
  eliminatePlayer: EliminatePlayerUseCase;
  reconnectPlayer: ReconnectPlayerUseCase;
}

type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const broadcastState = (io: Server<ClientToServerEvents, ServerToClientEvents>, roomId: string, gameState: GameState) => {
  gameState.players.forEach((player) => {
    io.to(`${roomId}:${player.id}`).emit("state:update", {
      viewerPlayerId: player.id,
      gameState: sanitizeGameStateForViewer(gameState, player.id)
    });
  });
};

export const registerSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: ServerSocket,
  useCases: UseCases
) => {
  const sendError = (message: string) => {
    socket.emit("server:error", { message });
  };

  socket.on("room:create", async (payload: CreateRoomRequest) => {
    try {
      const { gameState, playerId } = await useCases.createRoom.execute(payload);
      socket.join(gameState.roomId);
      socket.join(`${gameState.roomId}:${playerId}`);
      socket.emit("room:created", {
        roomId: gameState.roomId,
        playerId,
        gameState: sanitizeGameStateForViewer(gameState, playerId)
      });
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("room:preview", async (payload: RoomPreviewRequest) => {
    try {
      const result = await useCases.previewRoom.execute(payload);
      socket.emit("room:previewed", result);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("room:join", async (payload: JoinRoomRequest) => {
    try {
      const { gameState, playerId } = await useCases.joinRoom.execute(payload);
      socket.join(gameState.roomId);
      socket.join(`${gameState.roomId}:${playerId}`);
      socket.emit("room:joined", {
        roomId: gameState.roomId,
        playerId,
        gameState: sanitizeGameStateForViewer(gameState, playerId)
      });
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("player:reconnect", async (payload: ReconnectRequest) => {
    try {
      const gameState = await useCases.reconnectPlayer.execute(payload);
      socket.join(gameState.roomId);
      socket.join(`${gameState.roomId}:${payload.playerId}`);
      socket.emit("state:update", {
        viewerPlayerId: payload.playerId,
        gameState: sanitizeGameStateForViewer(gameState, payload.playerId)
      });
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("game:start", async (payload: StartGameRequest) => {
    try {
      const gameState = await useCases.startGame.execute(payload);
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("game:reset", async (payload: ResetGameRequest) => {
    try {
      const gameState = await useCases.resetGame.execute(payload);
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("statement:submit", async (payload: SubmitStatementRequest) => {
    try {
      const gameState = await useCases.submitStatement.execute(payload);
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("voting:start", async (payload: StartVotingRequest) => {
    try {
      const gameState = await useCases.startVoting.execute(payload);
      broadcastState(io, gameState.roomId, gameState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });

  socket.on("vote:submit", async (payload: SubmitVoteRequest) => {
    try {
      const voteResult = await useCases.submitVote.execute(payload);
      if (voteResult.resolution.status === "PENDING" || voteResult.resolution.status === "REVOTE") {
        broadcastState(io, voteResult.gameState.roomId, voteResult.gameState);
        return;
      }

      const roundState = await useCases.eliminatePlayer.execute({
        roomId: payload.roomId,
        eliminatedPlayerId: voteResult.resolution.eliminatedPlayerId
      });
      broadcastState(io, roundState.roomId, roundState);
    } catch (error) {
      sendError((error as Error).message);
    }
  });
};
