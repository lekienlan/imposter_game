import {
  CreateRoomRequest,
  JoinRoomRequest,
  ResetGameRequest,
  ReconnectRequest,
  RoomPreviewRequest,
  RoomPreviewResponse,
  StartGameRequest,
  StartVotingRequest,
  SubmitStatementRequest,
  SubmitVoteRequest,
  StateUpdatePayload,
  ErrorPayload,
  CreateRoomResponse,
  JoinRoomResponse
} from "@imposter/shared";

export interface GameGateway {
  onStateUpdate(handler: (payload: StateUpdatePayload) => void): void;
  onError(handler: (payload: ErrorPayload) => void): void;
  onRoomCreated(handler: (payload: CreateRoomResponse) => void): void;
  onRoomJoined(handler: (payload: JoinRoomResponse) => void): void;
  onRoomPreviewed(handler: (payload: RoomPreviewResponse) => void): void;
  onDisconnect(handler: () => void): void;
  onReconnected(handler: () => void): void;
  resetConnection(): void;
  createRoom(payload: CreateRoomRequest): void;
  joinRoom(payload: JoinRoomRequest): void;
  reconnect(payload: ReconnectRequest): void;
  previewRoom(payload: RoomPreviewRequest): void;
  startGame(payload: StartGameRequest): void;
  resetGame(payload: ResetGameRequest): void;
  submitStatement(payload: SubmitStatementRequest): void;
  startVoting(payload: StartVotingRequest): void;
  submitVote(payload: SubmitVoteRequest): void;
}
