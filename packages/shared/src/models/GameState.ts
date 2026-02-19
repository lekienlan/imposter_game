import { Phase } from "../enums/Phase";
import { Winner } from "../enums/Winner";
import { Player } from "./Player";
import { Vote } from "./Vote";
import { GameSettings } from "./GameSettings";
import { WordPair } from "./WordPair";

export interface GameState {
  roomId: string;
  createdAt: number;
  updatedAt: number;
  hostPlayerId: string;
  phase: Phase;
  players: Player[];
  settings: GameSettings;
  round: number;
  activeWordPair: WordPair | null;
  speakingOrder: string[];
  pendingSpeakerIds: string[];
  votes: Vote[];
  voteRound: number;
  firstRoundTopTargetIds: string[];
  eliminatedPlayerId: string | null;
  winner: Winner;
  winnerReason: string | null;
}
