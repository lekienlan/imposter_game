import { GameState, Player, Role, Winner, Phase } from '@imposter/shared';

export const getViewer = (gameState: GameState, playerId: string): Player | undefined =>
  gameState.players.find((player) => player.id === playerId);

export const isHost = (gameState: GameState, playerId: string): boolean =>
  gameState.hostPlayerId === playerId;

export const alivePlayers = (gameState: GameState): Player[] =>
  gameState.players.filter((player) => player.isAlive);

export const didPlayerWin = (player: Player, winner: Winner): boolean => {
  if (winner === Winner.CITIZENS) {
    return player.role === Role.CITIZEN || player.role === Role.WHITE;
  }
  if (winner === Winner.SPIES) {
    return player.role === Role.SPY;
  }
  return false;
};

export const getRoleLabel = (role: Role | null): string => {
  if (role === Role.CITIZEN) return 'CITIZEN';
  if (role === Role.SPY) return 'SPY';
  if (role === Role.WHITE) return 'WHITE ROLE';
  return 'UNKNOWN';
};

export const getRoleColorClass = (role: Role | null): string => {
  if (role === Role.CITIZEN) return 'text-blue-400';
  if (role === Role.SPY) return 'text-red-400';
  return 'text-neutral-400';
};

export const isGameOver = (gameState: GameState): boolean =>
  gameState.phase === Phase.GAME_ENDED;

export const canViewerSeeWord = (viewer: Player | undefined, gameState: GameState): boolean => {
  if (!viewer) return false;
  if (!viewer.word) return false;
  if (isGameOver(gameState)) return false;
  return true;
};
