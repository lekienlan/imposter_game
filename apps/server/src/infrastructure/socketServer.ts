import { createServer } from "node:http";
import { Server } from "socket.io";
import Redis from "ioredis";
import { ClientToServerEvents, ServerToClientEvents } from "@imposter/shared";
import { CreateRoomUseCase } from "../application/CreateRoomUseCase";
import { EliminatePlayerUseCase } from "../application/EliminatePlayerUseCase";
import { JoinRoomUseCase } from "../application/JoinRoomUseCase";
import { ResetGameUseCase } from "../application/ResetGameUseCase";
import { ReconnectPlayerUseCase } from "../application/ReconnectPlayerUseCase";
import { StartGameUseCase } from "../application/StartGameUseCase";
import { StartVotingUseCase } from "../application/StartVotingUseCase";
import { SubmitStatementUseCase } from "../application/SubmitStatementUseCase";
import { SubmitVoteUseCase } from "../application/SubmitVoteUseCase";
import { registerSocketHandlers } from "../interfaces/socketHandlers";
import { RedisGameStateRepository } from "./RedisGameStateRepository";

export const bootstrapSocketServer = (port: number, redisUrl: string) => {
  const httpServer = createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*"
    }
  });

  const redis = new Redis(redisUrl);
  const repository = new RedisGameStateRepository(redis);

  const useCases = {
    createRoom: new CreateRoomUseCase(repository),
    joinRoom: new JoinRoomUseCase(repository),
    resetGame: new ResetGameUseCase(repository),
    startGame: new StartGameUseCase(repository),
    submitStatement: new SubmitStatementUseCase(repository),
    startVoting: new StartVotingUseCase(repository),
    submitVote: new SubmitVoteUseCase(repository),
    eliminatePlayer: new EliminatePlayerUseCase(repository),
    reconnectPlayer: new ReconnectPlayerUseCase(repository)
  };

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket, useCases);
  });

  httpServer.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Socket server listening on port ${port}`);
  });
};
