import { GameState } from "../models/GameState";
import { GameSettings } from "../models/GameSettings";
import { Phase } from "../enums/Phase";

export interface CreateRoomRequest {
  playerName: string;
  settings: GameSettings;
}

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface ReconnectRequest {
  roomId: string;
  playerId: string;
}

export interface RoomPreviewRequest {
  roomId: string;
}

export interface StartGameRequest {
  roomId: string;
  playerId: string;
}

export interface SubmitStatementRequest {
  roomId: string;
  playerId: string;
  targetSpeakerId: string;
  statement: string;
}

export interface StartVotingRequest {
  roomId: string;
  playerId: string;
}

export interface SubmitVoteRequest {
  roomId: string;
  playerId: string;
  targetPlayerId: string | null;
}

export interface ResetGameRequest {
  roomId: string;
  playerId: string;
}

export interface StateUpdatePayload {
  gameState: GameState;
  viewerPlayerId: string;
}

export interface ErrorPayload {
  message: string;
}

export interface CreateRoomResponse {
  roomId: string;
  playerId: string;
  gameState: GameState;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
  gameState: GameState;
}

export interface RoomPreviewResponse {
  roomId: string;
  hostName: string;
  phase: Phase;
  playerCount: number;
  playerNames: string[];
}

export interface ServerToClientEvents {
  "room:created": (payload: CreateRoomResponse) => void;
  "room:joined": (payload: JoinRoomResponse) => void;
  "room:previewed": (payload: RoomPreviewResponse) => void;
  "state:update": (payload: StateUpdatePayload) => void;
  "server:error": (payload: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  "room:create": (payload: CreateRoomRequest) => void;
  "room:join": (payload: JoinRoomRequest) => void;
  "room:preview": (payload: RoomPreviewRequest) => void;
  "player:reconnect": (payload: ReconnectRequest) => void;
  "game:start": (payload: StartGameRequest) => void;
  "game:reset": (payload: ResetGameRequest) => void;
  "statement:submit": (payload: SubmitStatementRequest) => void;
  "voting:start": (payload: StartVotingRequest) => void;
  "vote:submit": (payload: SubmitVoteRequest) => void;
}
