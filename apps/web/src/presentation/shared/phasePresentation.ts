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

export const phaseGuide: Record<Phase, { title: string; description: string; tip: string }> = {
  [Phase.GAME_CREATION]: {
    title: 'Game creation',
    description: 'Host can reset setup and wait for players to join.',
    tip: 'Wait for the host to configure the game settings.',
  },
  [Phase.WAITING_FOR_PLAYERS]: {
    title: 'Wait for everyone, then start',
    description: 'Host starts when the room is ready.',
    tip: 'Invite your friends using the room code or share link.',
  },
  [Phase.LOBBY_READY]: {
    title: 'Lobby is locked',
    description: 'No new players can join now.',
    tip: 'Get ready — roles are about to be assigned.',
  },
  [Phase.ROLE_DISTRIBUTION]: {
    title: 'Roles are being assigned',
    description: 'Check your private role and keyword.',
    tip: 'Memorize your word and role. Do not share them out loud.',
  },
  [Phase.ROUND_DESCRIPTION]: {
    title: 'Speak in turn',
    description: 'Each alive player must say one sentence.',
    tip: 'Give a subtle hint about your word without being too obvious.',
  },
  [Phase.ROUND_DISCUSSION]: {
    title: 'Discuss and challenge',
    description: 'Debate and decide who looks suspicious.',
    tip: 'Question vague statements and compare clues carefully.',
  },
  [Phase.ROUND_VOTING]: {
    title: 'Voting in progress',
    description: 'Vote now. If tied, the game starts an immediate re-vote.',
    tip: 'Vote for someone you think is the imposter. Skip if unsure.',
  },
  [Phase.ROUND_RESULT]: {
    title: 'Round result',
    description: 'The game applies elimination/skip outcome.',
    tip: 'Watch who gets eliminated and adjust your strategy.',
  },
  [Phase.WHITE_TRANSITION]: {
    title: 'White transition',
    description: 'After round 2, alive white becomes citizen.',
    tip: 'If you were White, you are now a regular citizen.',
  },
  [Phase.WIN_LOSE_CHECK]: {
    title: 'Checking win/lose',
    description: 'Server is validating final conditions.',
    tip: 'The server is determining if the game should continue.',
  },
  [Phase.GAME_ENDED]: {
    title: 'Game ended',
    description: 'Winner has been decided.',
    tip: 'Check the final result and play again!',
  },
};
