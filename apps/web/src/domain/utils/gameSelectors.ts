import { GameState, Player } from '@imposter/shared';

export const getViewer = (gameState: GameState, playerId: string): Player | undefined =>
  gameState.players.find((player) => player.id === playerId);

export const isHost = (gameState: GameState, playerId: string): boolean =>
  gameState.hostPlayerId === playerId;

export const alivePlayers = (gameState: GameState): Player[] =>
  gameState.players.filter((player) => player.isAlive);
