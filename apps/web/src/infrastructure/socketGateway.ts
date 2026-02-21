import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  CreateRoomRequest,
  JoinRoomRequest,
  ResetGameRequest,
  ReconnectRequest,
  RoomPreviewRequest,
  StartGameRequest,
  SubmitStatementRequest,
  StartVotingRequest,
  SubmitVoteRequest
} from "@imposter/shared";
import { GameGateway } from "../application/model/GameGateway";

export class SocketGateway implements GameGateway {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  private readonly serverUrl: string;
  private readonly stateUpdateHandlers: ServerToClientEvents["state:update"][] = [];
  private readonly errorHandlers: ServerToClientEvents["server:error"][] = [];
  private readonly roomCreatedHandlers: ServerToClientEvents["room:created"][] = [];
  private readonly roomJoinedHandlers: ServerToClientEvents["room:joined"][] = [];
  private readonly roomPreviewedHandlers: ServerToClientEvents["room:previewed"][] = [];

  constructor(serverUrl: string) {
    // Infrastructure adapter: no business logic, only transport concerns.
    this.serverUrl = serverUrl;
    this.socket = this.createSocket();
  }

  private createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    const socket = io(this.serverUrl, { transports: ["websocket"] });
    this.stateUpdateHandlers.forEach((handler) => socket.on("state:update", handler));
    this.errorHandlers.forEach((handler) => socket.on("server:error", handler));
    this.roomCreatedHandlers.forEach((handler) => socket.on("room:created", handler));
    this.roomJoinedHandlers.forEach((handler) => socket.on("room:joined", handler));
    this.roomPreviewedHandlers.forEach((handler) => socket.on("room:previewed", handler));
    return socket;
  }

  onStateUpdate(handler: ServerToClientEvents["state:update"]): void {
    this.stateUpdateHandlers.push(handler);
    this.socket.on("state:update", handler);
  }

  onError(handler: ServerToClientEvents["server:error"]): void {
    this.errorHandlers.push(handler);
    this.socket.on("server:error", handler);
  }

  onRoomCreated(handler: ServerToClientEvents["room:created"]): void {
    this.roomCreatedHandlers.push(handler);
    this.socket.on("room:created", handler);
  }

  onRoomJoined(handler: ServerToClientEvents["room:joined"]): void {
    this.roomJoinedHandlers.push(handler);
    this.socket.on("room:joined", handler);
  }

  onRoomPreviewed(handler: ServerToClientEvents["room:previewed"]): void {
    this.roomPreviewedHandlers.push(handler);
    this.socket.on("room:previewed", handler);
  }

  onDisconnect(handler: () => void): void {
    this.socket.on("disconnect", handler);
  }

  onReconnected(handler: () => void): void {
    this.socket.on("connect", handler);
  }

  resetConnection(): void {
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = this.createSocket();
  }

  createRoom(payload: CreateRoomRequest): void {
    this.socket.emit("room:create", payload);
  }

  joinRoom(payload: JoinRoomRequest): void {
    this.socket.emit("room:join", payload);
  }

  reconnect(payload: ReconnectRequest): void {
    this.socket.emit("player:reconnect", payload);
  }

  previewRoom(payload: RoomPreviewRequest): void {
    this.socket.emit("room:preview", payload);
  }

  startGame(payload: StartGameRequest): void {
    this.socket.emit("game:start", payload);
  }

  resetGame(payload: ResetGameRequest): void {
    this.socket.emit("game:reset", payload);
  }

  submitStatement(payload: SubmitStatementRequest): void {
    this.socket.emit("statement:submit", payload);
  }

  startVoting(payload: StartVotingRequest): void {
    this.socket.emit("voting:start", payload);
  }

  submitVote(payload: SubmitVoteRequest): void {
    this.socket.emit("vote:submit", payload);
  }
}
