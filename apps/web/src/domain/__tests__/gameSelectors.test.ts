import { describe, test, expect } from 'vitest';
import { Role, Winner, Phase } from '@imposter/shared';
import type { Player, GameState } from '@imposter/shared';
import {
  didPlayerWin,
  getRoleLabel,
  getRoleColorClass,
  isGameOver,
  canViewerSeeWord,
} from '../utils/gameSelectors';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'p1',
  name: 'Alice',
  isHost: false,
  isAlive: true,
  joinedAt: 0,
  role: null,
  word: null,
  statement: null,
  votedFor: null,
  ...overrides,
});

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  phase: Phase.ROUND_DISCUSSION,
  winner: Winner.NONE,
  players: [],
  hostPlayerId: 'host1',
  pendingSpeakerIds: [],
  round: 1,
  ...overrides,
} as GameState);

// ---------------------------------------------------------------------------
// didPlayerWin
// ---------------------------------------------------------------------------

describe('didPlayerWin', () => {
  test('returns true when CITIZENS win and player is CITIZEN', () => {
    const player = makePlayer({ role: Role.CITIZEN });
    expect(didPlayerWin(player, Winner.CITIZENS)).toBe(true);
  });

  test('returns true when CITIZENS win and player is WHITE', () => {
    const player = makePlayer({ role: Role.WHITE });
    expect(didPlayerWin(player, Winner.CITIZENS)).toBe(true);
  });

  test('returns true when SPIES win and player is SPY', () => {
    const player = makePlayer({ role: Role.SPY });
    expect(didPlayerWin(player, Winner.SPIES)).toBe(true);
  });

  test('returns false for Winner.NONE regardless of role', () => {
    const citizen = makePlayer({ role: Role.CITIZEN });
    const spy = makePlayer({ role: Role.SPY });
    const white = makePlayer({ role: Role.WHITE });
    expect(didPlayerWin(citizen, Winner.NONE)).toBe(false);
    expect(didPlayerWin(spy, Winner.NONE)).toBe(false);
    expect(didPlayerWin(white, Winner.NONE)).toBe(false);
  });

  test('returns false when role does not match winning side', () => {
    const spy = makePlayer({ role: Role.SPY });
    expect(didPlayerWin(spy, Winner.CITIZENS)).toBe(false);

    const citizen = makePlayer({ role: Role.CITIZEN });
    expect(didPlayerWin(citizen, Winner.SPIES)).toBe(false);
  });

  test('returns false when role is null and CITIZENS win', () => {
    const player = makePlayer({ role: null });
    expect(didPlayerWin(player, Winner.CITIZENS)).toBe(false);
  });

  test('returns false when role is null and SPIES win', () => {
    const player = makePlayer({ role: null });
    expect(didPlayerWin(player, Winner.SPIES)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getRoleLabel
// ---------------------------------------------------------------------------

describe('getRoleLabel', () => {
  test('returns CITIZEN for Role.CITIZEN', () => {
    expect(getRoleLabel(Role.CITIZEN)).toBe('CITIZEN');
  });

  test('returns SPY for Role.SPY', () => {
    expect(getRoleLabel(Role.SPY)).toBe('SPY');
  });

  test('returns WHITE ROLE for Role.WHITE', () => {
    expect(getRoleLabel(Role.WHITE)).toBe('WHITE ROLE');
  });

  test('returns UNKNOWN for null', () => {
    expect(getRoleLabel(null)).toBe('UNKNOWN');
  });
});

// ---------------------------------------------------------------------------
// getRoleColorClass
// ---------------------------------------------------------------------------

describe('getRoleColorClass', () => {
  test('returns text-blue-400 for Role.CITIZEN', () => {
    expect(getRoleColorClass(Role.CITIZEN)).toBe('text-blue-400');
  });

  test('returns text-red-400 for Role.SPY', () => {
    expect(getRoleColorClass(Role.SPY)).toBe('text-red-400');
  });

  test('returns text-neutral-400 for Role.WHITE', () => {
    expect(getRoleColorClass(Role.WHITE)).toBe('text-neutral-400');
  });

  test('returns text-neutral-400 for null', () => {
    expect(getRoleColorClass(null)).toBe('text-neutral-400');
  });
});

// ---------------------------------------------------------------------------
// isGameOver
// ---------------------------------------------------------------------------

describe('isGameOver', () => {
  test('returns true when phase is GAME_ENDED', () => {
    const gs = makeGameState({ phase: Phase.GAME_ENDED });
    expect(isGameOver(gs)).toBe(true);
  });

  test('returns false for ROUND_DISCUSSION', () => {
    const gs = makeGameState({ phase: Phase.ROUND_DISCUSSION });
    expect(isGameOver(gs)).toBe(false);
  });

  test('returns false for ROUND_VOTING', () => {
    const gs = makeGameState({ phase: Phase.ROUND_VOTING });
    expect(isGameOver(gs)).toBe(false);
  });

  test('returns false for ROUND_RESULT', () => {
    const gs = makeGameState({ phase: Phase.ROUND_RESULT });
    expect(isGameOver(gs)).toBe(false);
  });

  test('returns false for GAME_CREATION', () => {
    const gs = makeGameState({ phase: Phase.GAME_CREATION });
    expect(isGameOver(gs)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canViewerSeeWord
// ---------------------------------------------------------------------------

describe('canViewerSeeWord', () => {
  test('returns true when viewer has a word and game is not over', () => {
    const viewer = makePlayer({ word: 'secret' });
    const gs = makeGameState({ phase: Phase.ROUND_DISCUSSION });
    expect(canViewerSeeWord(viewer, gs)).toBe(true);
  });

  test('returns false when viewer is undefined', () => {
    const gs = makeGameState({ phase: Phase.ROUND_DISCUSSION });
    expect(canViewerSeeWord(undefined, gs)).toBe(false);
  });

  test('returns false when viewer.word is null', () => {
    const viewer = makePlayer({ word: null });
    const gs = makeGameState({ phase: Phase.ROUND_DISCUSSION });
    expect(canViewerSeeWord(viewer, gs)).toBe(false);
  });

  test('returns false when game is over even if viewer has word', () => {
    const viewer = makePlayer({ word: 'secret' });
    const gs = makeGameState({ phase: Phase.GAME_ENDED });
    expect(canViewerSeeWord(viewer, gs)).toBe(false);
  });

  test('returns false when game is over and viewer.word is null', () => {
    const viewer = makePlayer({ word: null });
    const gs = makeGameState({ phase: Phase.GAME_ENDED });
    expect(canViewerSeeWord(viewer, gs)).toBe(false);
  });
});
