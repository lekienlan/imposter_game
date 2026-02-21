import {
  GameMode,
  GameSettings,
  GameState,
  Phase,
  Player,
  Role,
  Vote,
  Winner,
  WordPair,
} from '@imposter/shared';

export interface VoteResolution {
  status: 'PENDING' | 'REVOTE' | 'SKIP' | 'ELIMINATED';
  eliminatedPlayerId: string | null;
}

export interface PostRoundOutcome {
  winner: Winner;
  winnerReason: string | null;
}

const alivePlayers = (players: Player[]): Player[] =>
  players.filter((player) => player.isAlive);

const shuffle = <T>(items: T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const countAliveCitizens = (players: Player[]): number =>
  alivePlayers(players).filter(
    (player) => player.role === Role.CITIZEN || player.role === Role.WHITE,
  ).length;

const countAliveSpies = (players: Player[]): number =>
  alivePlayers(players).filter((player) => player.role === Role.SPY).length;

const pickTieBreakCandidate = (
  players: Player[],
  candidateIds: string[],
): string => {
  const candidateSet = new Set(candidateIds);
  const candidates = alivePlayers(players).filter((player) =>
    candidateSet.has(player.id),
  );
  if (candidates.length === 0) {
    throw new Error('No tie-break candidate available');
  }

  candidates.sort((left, right) => left.joinedAt - right.joinedAt);
  return candidates[0].id;
};

const requiredVoterIds = (gameState: GameState): string[] => {
  const alive = alivePlayers(gameState.players);
  if (gameState.settings.mode === GameMode.HARDCORE) {
    return alive
      .filter((player) => player.role === Role.CITIZEN)
      .map((player) => player.id);
  }
  return alive.map((player) => player.id);
};

const allRequiredVoted = (gameState: GameState): boolean => {
  const required = requiredVoterIds(gameState);
  const voted = new Set(gameState.votes.map((vote) => vote.voterId));
  return required.every((voterId) => voted.has(voterId));
};

const summarizeVotes = (votes: Vote[]) => {
  const targetTally = new Map<string, number>();
  let skipCount = 0;

  votes.forEach((vote) => {
    if (!vote.targetPlayerId) {
      skipCount += 1;
      return;
    }
    targetTally.set(
      vote.targetPlayerId,
      (targetTally.get(vote.targetPlayerId) ?? 0) + 1,
    );
  });

  let maxVotes = 0;
  targetTally.forEach((count) => {
    if (count > maxVotes) {
      maxVotes = count;
    }
  });

  const topTargetIds = Array.from(targetTally.entries())
    .filter(([, count]) => count === maxVotes)
    .map(([targetId]) => targetId);

  return { skipCount, maxVotes, topTargetIds };
};

export const sanitizeGameStateForViewer = (
  gameState: GameState,
  viewerPlayerId: string,
): GameState => ({
  ...gameState,
  activeWordPair:
    gameState.phase === Phase.GAME_ENDED ? gameState.activeWordPair : null,
  players: gameState.players.map((player) => {
    if (player.id === viewerPlayerId || gameState.phase === Phase.GAME_ENDED) {
      return player;
    }
    return { ...player, role: null, word: null };
  }),
});

export const assignRoles = (
  players: Player[],
  settings: GameSettings,
  random: () => number,
): Role[] => {
  const totalPlayers = players.length;
  if (totalPlayers < 3) {
    throw new Error('Need at least 3 players');
  }

  if (settings.mode === GameMode.CLASSIC) {
    const spyCount = Math.max(1, Math.round(totalPlayers * 0.3));
    const allowWhite = settings.whiteEnabled ? 1 : 0;
    const whiteCount = Math.min(allowWhite, 1);
    const citizenCount = totalPlayers - spyCount - whiteCount;
    if (citizenCount <= 0) {
      throw new Error('Invalid CLASSIC role distribution');
    }
    return shuffle(
      [
        ...Array(citizenCount).fill(Role.CITIZEN),
        ...Array(spyCount).fill(Role.SPY),
        ...Array(whiteCount).fill(Role.WHITE),
      ],
      random,
    );
  }

  const citizenCount = Math.max(1, Math.floor(totalPlayers * 0.3));
  const spyCount = totalPlayers - citizenCount;
  if (spyCount <= citizenCount) {
    throw new Error('HARDCORE requires spies to be more than citizens');
  }
  return shuffle(
    [
      ...Array(citizenCount).fill(Role.CITIZEN),
      ...Array(spyCount).fill(Role.SPY),
    ],
    random,
  );
};

export const pickWordPair = (
  wordPairs: WordPair[],
  random: () => number,
): WordPair => {
  if (wordPairs.length === 0) {
    throw new Error('At least one word pair required');
  }
  const index = Math.floor(random() * wordPairs.length);
  return wordPairs[index];
};

export const applyRolesAndWords = (
  players: Player[],
  roles: Role[],
  wordPair: WordPair,
): Player[] =>
  players.map((player, index) => {
    const role = roles[index];
    const word =
      role === Role.CITIZEN
        ? wordPair.citizen
        : role === Role.SPY
          ? wordPair.spy
          : null;
    return {
      ...player,
      role,
      word,
      statement: null,
      votedFor: null,
      isAlive: true,
    };
  });

export const beginRoundDescription = (
  gameState: GameState,
  random: () => number,
): void => {
  const alive = alivePlayers(gameState.players);
  const order = shuffle(
    alive.map((player) => player.id),
    random,
  );
  if (gameState.round === 1) {
    const whiteIndex = order.findIndex(
      (playerId) =>
        gameState.players.find((player) => player.id === playerId)?.role ===
        Role.WHITE,
    );
    if (whiteIndex === 0 && order.length > 1) {
      [order[0], order[1]] = [order[1], order[0]];
    }
  }

  gameState.speakingOrder = order;
  gameState.pendingSpeakerIds = [...order];
  gameState.votes = [];
  gameState.voteRound = 1;
  gameState.firstRoundTopTargetIds = [];
  gameState.eliminatedPlayerId = null;
  gameState.players.forEach((player) => {
    player.statement = null;
    player.votedFor = null;
  });
  gameState.phase = Phase.ROUND_DESCRIPTION;
};

export const canTransitionToVoting = (gameState: GameState): boolean =>
  gameState.phase === Phase.ROUND_DISCUSSION;

export const canSubmitStatement = (
  gameState: GameState,
  playerId: string,
): boolean =>
  gameState.phase === Phase.ROUND_DESCRIPTION &&
  gameState.pendingSpeakerIds[0] === playerId;

export const markStatementSubmitted = (
  gameState: GameState,
  playerId: string,
  statement: string,
): void => {
  const player = gameState.players.find(
    (candidate) => candidate.id === playerId,
  );
  if (!player || !player.isAlive) {
    throw new Error('Invalid player');
  }
  player.statement = statement.trim();
  gameState.pendingSpeakerIds = gameState.pendingSpeakerIds.filter(
    (id) => id !== playerId,
  );
  if (gameState.pendingSpeakerIds.length === 0) {
    gameState.phase = Phase.ROUND_DISCUSSION;
  }
};

export const upsertVote = (gameState: GameState, vote: Vote): void => {
  const voteIndex = gameState.votes.findIndex(
    (item) => item.voterId === vote.voterId,
  );
  if (voteIndex >= 0) {
    gameState.votes[voteIndex] = vote;
    return;
  }
  gameState.votes.push(vote);
};

export const retractVote = (gameState: GameState, voterId: string): void => {
  const voteIndex = gameState.votes.findIndex((v) => v.voterId === voterId);
  if (voteIndex < 0) return;
  gameState.votes.splice(voteIndex, 1);
  const player = gameState.players.find((p) => p.id === voterId);
  if (player) {
    player.votedFor = null;
  }
};

export const resolveVoting = (gameState: GameState): VoteResolution => {
  if (!allRequiredVoted(gameState)) {
    return { status: 'PENDING', eliminatedPlayerId: null };
  }

  const summary = summarizeVotes(gameState.votes);
  const classicSkipWins =
    gameState.settings.mode === GameMode.CLASSIC &&
    summary.skipCount > summary.maxVotes;
  if (classicSkipWins || summary.maxVotes === 0) {
    return { status: 'SKIP', eliminatedPlayerId: null };
  }

  const tiedWithSkip =
    gameState.settings.mode === GameMode.CLASSIC &&
    summary.skipCount === summary.maxVotes;
  const tiedTargets = summary.topTargetIds.length > 1;
  const hasTie = tiedWithSkip || tiedTargets;

  if (hasTie && gameState.voteRound === 1) {
    gameState.voteRound = 2;
    gameState.firstRoundTopTargetIds = summary.topTargetIds;
    gameState.votes = [];
    gameState.players.forEach((player) => {
      player.votedFor = null;
    });
    return { status: 'REVOTE', eliminatedPlayerId: null };
  }

  if (hasTie) {
    const baseCandidates =
      gameState.firstRoundTopTargetIds.length > 0
        ? gameState.firstRoundTopTargetIds
        : summary.topTargetIds;
    const tieBreakId = pickTieBreakCandidate(gameState.players, baseCandidates);
    return { status: 'ELIMINATED', eliminatedPlayerId: tieBreakId };
  }

  return {
    status: 'ELIMINATED',
    eliminatedPlayerId: summary.topTargetIds[0] ?? null,
  };
};

export const applyRoundResult = (
  gameState: GameState,
  eliminatedPlayerId: string | null,
): Role | null => {
  gameState.phase = Phase.ROUND_RESULT;
  gameState.eliminatedPlayerId = eliminatedPlayerId;

  if (!eliminatedPlayerId) {
    return null;
  }

  const player = gameState.players.find(
    (candidate) => candidate.id === eliminatedPlayerId,
  );
  if (!player) {
    throw new Error('Eliminated player not found');
  }
  player.isAlive = false;
  return player.role;
};

const evaluateWinner = (
  gameState: GameState,
  eliminatedRole: Role | null,
): PostRoundOutcome => {
  if (
    gameState.settings.mode === GameMode.CLASSIC &&
    eliminatedRole === Role.WHITE &&
    gameState.round <= 2
  ) {
    return {
      winner: Winner.SPIES,
      winnerReason: 'WHITE_ELIMINATED_IN_ROUND_1_OR_2',
    };
  }

  if (
    gameState.settings.mode === GameMode.HARDCORE &&
    eliminatedRole === Role.CITIZEN
  ) {
    return { winner: Winner.SPIES, winnerReason: 'CITIZEN_MISVOTED_CITIZEN' };
  }

  const citizenCount = countAliveCitizens(gameState.players);
  const spyCount = countAliveSpies(gameState.players);

  if (gameState.settings.mode === GameMode.CLASSIC) {
    if (spyCount === 0) {
      return { winner: Winner.CITIZENS, winnerReason: 'ALL_SPIES_ELIMINATED' };
    }
    if (spyCount >= citizenCount) {
      return { winner: Winner.SPIES, winnerReason: 'SPIES_PARITY_OR_CONTROL' };
    }
    return { winner: Winner.NONE, winnerReason: null };
  }

  if (citizenCount >= spyCount) {
    return { winner: Winner.CITIZENS, winnerReason: 'CITIZENS_REACHED_PARITY' };
  }

  return { winner: Winner.NONE, winnerReason: null };
};

const applyWhiteTransition = (gameState: GameState): void => {
  if (gameState.settings.mode !== GameMode.CLASSIC || gameState.round < 2) {
    return;
  }

  const whitePlayer = gameState.players.find(
    (player) => player.role === Role.WHITE && player.isAlive,
  );
  if (!whitePlayer) {
    return;
  }

  gameState.phase = Phase.WHITE_TRANSITION;
  whitePlayer.role = Role.CITIZEN;
  whitePlayer.word = gameState.activeWordPair?.citizen ?? null;
};

export const advanceAfterRound = (
  gameState: GameState,
  eliminatedRole: Role | null,
  random: () => number,
): void => {
  applyWhiteTransition(gameState);
  gameState.phase = Phase.WIN_LOSE_CHECK;
  const outcome = evaluateWinner(gameState, eliminatedRole);

  if (outcome.winner !== Winner.NONE) {
    gameState.winner = outcome.winner;
    gameState.winnerReason = outcome.winnerReason;
    gameState.phase = Phase.GAME_ENDED;
    return;
  }

  if (gameState.round >= 8) {
    gameState.winner = Winner.SPIES;
    gameState.winnerReason = 'MAX_ROUNDS_REACHED';
    gameState.phase = Phase.GAME_ENDED;
    return;
  }

  gameState.round += 1;
  beginRoundDescription(gameState, random);
};
