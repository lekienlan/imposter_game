import { describe, test, expect } from 'vitest';
import { Phase } from '@imposter/shared';
import {
  phaseLabel,
  phaseGuidanceKey,
} from '../../presentation/shared/phasePresentation';

describe('phaseLabel', () => {
  test('GAME_CREATION maps to phase.label.waiting', () => {
    expect(phaseLabel[Phase.GAME_CREATION]).toBe('phase.label.waiting');
  });

  test('WAITING_FOR_PLAYERS maps to phase.label.waiting', () => {
    expect(phaseLabel[Phase.WAITING_FOR_PLAYERS]).toBe('phase.label.waiting');
  });

  test('LOBBY_READY maps to phase.label.waiting', () => {
    expect(phaseLabel[Phase.LOBBY_READY]).toBe('phase.label.waiting');
  });

  test('ROLE_DISTRIBUTION maps to phase.label.wordReveal', () => {
    expect(phaseLabel[Phase.ROLE_DISTRIBUTION]).toBe('phase.label.wordReveal');
  });

  test('ROUND_DESCRIPTION maps to phase.label.discussion', () => {
    expect(phaseLabel[Phase.ROUND_DESCRIPTION]).toBe('phase.label.discussion');
  });

  test('ROUND_DISCUSSION maps to phase.label.discussion', () => {
    expect(phaseLabel[Phase.ROUND_DISCUSSION]).toBe('phase.label.discussion');
  });

  test('WHITE_TRANSITION maps to phase.label.discussion', () => {
    expect(phaseLabel[Phase.WHITE_TRANSITION]).toBe('phase.label.discussion');
  });

  test('ROUND_VOTING maps to phase.label.voting', () => {
    expect(phaseLabel[Phase.ROUND_VOTING]).toBe('phase.label.voting');
  });

  test('WIN_LOSE_CHECK maps to phase.label.voting', () => {
    expect(phaseLabel[Phase.WIN_LOSE_CHECK]).toBe('phase.label.voting');
  });

  test('ROUND_RESULT maps to phase.label.voting', () => {
    expect(phaseLabel[Phase.ROUND_RESULT]).toBe('phase.label.voting');
  });

  test('GAME_ENDED maps to phase.label.ended', () => {
    expect(phaseLabel[Phase.GAME_ENDED]).toBe('phase.label.ended');
  });

  test('every Phase value maps to a truthy string', () => {
    const allPhases = Object.values(Phase) as Phase[];
    for (const phase of allPhases) {
      expect(phaseLabel[phase]).toBeTruthy();
    }
  });
});

describe('phaseGuidanceKey', () => {
  test('ROUND_VOTING + isHost=true → phase.guidance.host.voting', () => {
    expect(phaseGuidanceKey(Phase.ROUND_VOTING, true)).toBe('phase.guidance.host.voting');
  });

  test('ROUND_VOTING + isHost=false → phase.guidance.player.voting', () => {
    expect(phaseGuidanceKey(Phase.ROUND_VOTING, false)).toBe('phase.guidance.player.voting');
  });

  test('WAITING_FOR_PLAYERS + isHost=true → phase.guidance.host.waiting', () => {
    expect(phaseGuidanceKey(Phase.WAITING_FOR_PLAYERS, true)).toBe('phase.guidance.host.waiting');
  });

  test('GAME_CREATION + isHost=true → phase.guidance.host.waiting', () => {
    expect(phaseGuidanceKey(Phase.GAME_CREATION, true)).toBe('phase.guidance.host.waiting');
  });

  test('LOBBY_READY + isHost=false → phase.guidance.player.waiting', () => {
    expect(phaseGuidanceKey(Phase.LOBBY_READY, false)).toBe('phase.guidance.player.waiting');
  });

  test('ROLE_DISTRIBUTION + isHost=true → phase.guidance.host.wordReveal', () => {
    expect(phaseGuidanceKey(Phase.ROLE_DISTRIBUTION, true)).toBe('phase.guidance.host.wordReveal');
  });

  test('ROLE_DISTRIBUTION + isHost=false → phase.guidance.player.wordReveal', () => {
    expect(phaseGuidanceKey(Phase.ROLE_DISTRIBUTION, false)).toBe('phase.guidance.player.wordReveal');
  });

  test('ROUND_DESCRIPTION + isHost=true → phase.guidance.host.description', () => {
    expect(phaseGuidanceKey(Phase.ROUND_DESCRIPTION, true)).toBe('phase.guidance.host.description');
  });

  test('ROUND_DISCUSSION + isHost=false → phase.guidance.player.discussion', () => {
    expect(phaseGuidanceKey(Phase.ROUND_DISCUSSION, false)).toBe('phase.guidance.player.discussion');
  });

  test('WHITE_TRANSITION + isHost=true → phase.guidance.host.discussion', () => {
    expect(phaseGuidanceKey(Phase.WHITE_TRANSITION, true)).toBe('phase.guidance.host.discussion');
  });

  test('ROUND_RESULT + isHost=false → phase.guidance.player.result', () => {
    expect(phaseGuidanceKey(Phase.ROUND_RESULT, false)).toBe('phase.guidance.player.result');
  });

  test('WIN_LOSE_CHECK + isHost=true → phase.guidance.host.voting', () => {
    expect(phaseGuidanceKey(Phase.WIN_LOSE_CHECK, true)).toBe('phase.guidance.host.voting');
  });

  test('GAME_ENDED + isHost=false → phase.guidance.player.ended', () => {
    expect(phaseGuidanceKey(Phase.GAME_ENDED, false)).toBe('phase.guidance.player.ended');
  });

  test('every Phase value + isHost=true → truthy string', () => {
    const allPhases = Object.values(Phase) as Phase[];
    for (const phase of allPhases) {
      expect(phaseGuidanceKey(phase, true)).toBeTruthy();
    }
  });

  test('every Phase value + isHost=false → truthy string', () => {
    const allPhases = Object.values(Phase) as Phase[];
    for (const phase of allPhases) {
      expect(phaseGuidanceKey(phase, false)).toBeTruthy();
    }
  });
});
