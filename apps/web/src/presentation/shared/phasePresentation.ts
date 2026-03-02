import { Phase } from '@imposter/shared';

export const phaseTone: Record<Phase, string> = {
  [Phase.GAME_CREATION]: 'text-phase-lobby',
  [Phase.WAITING_FOR_PLAYERS]: 'text-phase-lobby',
  [Phase.LOBBY_READY]: 'text-phase-reveal',
  [Phase.ROLE_DISTRIBUTION]: 'text-phase-reveal',
  [Phase.ROUND_DESCRIPTION]: 'text-phase-description',
  [Phase.ROUND_DISCUSSION]: 'text-phase-discussion',
  [Phase.ROUND_VOTING]: 'text-phase-voting',
  [Phase.ROUND_RESULT]: 'text-phase-elimination',
  [Phase.WHITE_TRANSITION]: 'text-phase-elimination',
  [Phase.WIN_LOSE_CHECK]: 'text-phase-voting',
  [Phase.GAME_ENDED]: 'text-phase-over',
};

export const phaseLabel: Record<Phase, string> = {
  [Phase.GAME_CREATION]: 'phase.label.waiting',
  [Phase.WAITING_FOR_PLAYERS]: 'phase.label.waiting',
  [Phase.LOBBY_READY]: 'phase.label.waiting',
  [Phase.ROLE_DISTRIBUTION]: 'phase.label.wordReveal',
  [Phase.ROUND_DESCRIPTION]: 'phase.label.discussion',
  [Phase.ROUND_DISCUSSION]: 'phase.label.discussion',
  [Phase.WHITE_TRANSITION]: 'phase.label.discussion',
  [Phase.ROUND_VOTING]: 'phase.label.voting',
  [Phase.WIN_LOSE_CHECK]: 'phase.label.voting',
  [Phase.ROUND_RESULT]: 'phase.label.voting',
  [Phase.GAME_ENDED]: 'phase.label.ended',
};

const phaseGuidanceSlot: Record<Phase, string> = {
  [Phase.GAME_CREATION]: 'waiting',
  [Phase.WAITING_FOR_PLAYERS]: 'waiting',
  [Phase.LOBBY_READY]: 'waiting',
  [Phase.ROLE_DISTRIBUTION]: 'wordReveal',
  [Phase.ROUND_DESCRIPTION]: 'description',
  [Phase.ROUND_DISCUSSION]: 'discussion',
  [Phase.WHITE_TRANSITION]: 'discussion',
  [Phase.ROUND_VOTING]: 'voting',
  [Phase.WIN_LOSE_CHECK]: 'voting',
  [Phase.ROUND_RESULT]: 'result',
  [Phase.GAME_ENDED]: 'ended',
};

export function phaseGuidanceKey(phase: Phase, isHost: boolean): string {
  const role = isHost ? 'host' : 'player';
  const slot = phaseGuidanceSlot[phase];
  return `phase.guidance.${role}.${slot}`;
}
