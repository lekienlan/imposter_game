import { GameState, Phase, Winner } from '@imposter/shared';

export const resetGameState = (gameState: GameState): GameState => ({
  ...gameState,
  phase: Phase.WAITING_FOR_PLAYERS,
  players: gameState.players.map((player) => ({
    ...player,
    isAlive: true,
    role: null,
    word: null,
    statement: null,
    votedFor: null,
  })),
  round: 0,
  activeWordPair: null,
  speakingOrder: [],
  pendingSpeakerIds: [],
  votes: [],
  voteRound: 1,
  firstRoundTopTargetIds: [],
  eliminatedPlayerId: null,
  winner: Winner.NONE,
  winnerReason: null,
  updatedAt: Date.now(),
});
