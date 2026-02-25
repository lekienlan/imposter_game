import { Player } from '@imposter/shared';

const DEFAULT_PLAYER_PREFIX = 'Player ';

const isNameTaken = (players: Player[], name: string): boolean =>
  players.some((player) => player.name === name);

export const normalizePlayerName = (name: string): string => name.trim();

export const resolvePlayerName = (players: Player[], rawName: string): string => {
  const normalizedName = normalizePlayerName(rawName);
  if (normalizedName) {
    return normalizedName;
  }

  let order = 1;
  while (isNameTaken(players, `${DEFAULT_PLAYER_PREFIX}${order}`)) {
    order += 1;
  }

  return `${DEFAULT_PLAYER_PREFIX}${order}`;
};
