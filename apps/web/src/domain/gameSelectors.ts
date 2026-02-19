import { GameMode, GameState, Player, Role } from "@imposter/shared";

export const getViewer = (gameState: GameState, playerId: string): Player | undefined =>
  gameState.players.find((player) => player.id === playerId);

export const isHost = (gameState: GameState, playerId: string): boolean => gameState.hostPlayerId === playerId;

export const alivePlayers = (gameState: GameState): Player[] => gameState.players.filter((player) => player.isAlive);

export const canViewerVote = (gameState: GameState, playerId: string): boolean => {
  const viewer = getViewer(gameState, playerId);
  if (!viewer || !viewer.isAlive) {
    return false;
  }
  if (gameState.settings.mode === GameMode.HARDCORE) {
    return viewer.role === Role.CITIZEN;
  }
  return true;
};
