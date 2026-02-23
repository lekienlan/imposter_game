import { describe, test, expect } from 'vitest';
import { Phase } from '@imposter/shared';

const shouldTriggerRoleReveal = (newPhase: Phase, prevPhase: Phase | undefined) =>
  newPhase === Phase.GAME_ENDED && prevPhase !== Phase.GAME_ENDED;

describe('role reveal trigger', () => {
  test('triggers when transitioning to GAME_ENDED', () => {
    expect(shouldTriggerRoleReveal(Phase.GAME_ENDED, Phase.ROUND_RESULT)).toBe(true);
  });
  test('does not trigger on reconnect to already ended game', () => {
    expect(shouldTriggerRoleReveal(Phase.GAME_ENDED, Phase.GAME_ENDED)).toBe(false);
  });
  test('does not trigger on other phase transitions', () => {
    expect(shouldTriggerRoleReveal(Phase.ROUND_VOTING, Phase.ROUND_DISCUSSION)).toBe(false);
  });
});
