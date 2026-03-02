import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from 'pixel-retroui';
import { GameState, Phase, Player } from '@imposter/shared';
import { phaseGuidanceKey, phaseLabel, phaseTone } from '../shared/phasePresentation';
import { ShareButton } from '../shared/ShareButton';
import { RoundActionPanel } from '../round/RoundActionPanel';
import { VotingPanel } from '../voting/VotingPanel';

interface Props {
  gameState: GameState;
  playerId: string;
  viewerHost: boolean;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForId: string | null | undefined;
  statement: string;
  error: string;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  onExitGame: () => void;
  onStartVoting: () => void;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const ActionBoard = ({
  gameState,
  playerId,
  viewerHost,
  viewer,
  alivePlayers,
  viewerVotedForId,
  statement,
  error,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onExitGame,
  onStartVoting,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const [phaseEnter, setPhaseEnter] = useState(false);

  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const currentSpeakerName = currentSpeakerId
    ? (gameState.players.find((p) => p.id === currentSpeakerId)?.name ?? 'UNKNOWN')
    : 'COMPLETED';
  const showPhaseInfo =
    gameState.phase !== Phase.GAME_ENDED &&
    gameState.phase !== Phase.ROLE_DISTRIBUTION;

  useEffect(() => {
    setPhaseEnter(true);
    const timer = setTimeout(() => setPhaseEnter(false), 350);
    return () => clearTimeout(timer);
  }, [gameState.phase]);

  return (
    <>
      <Card
        className="arcade-card arcade-head"
        bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
        textColor="var(--neutral-white)"
        borderColor="var(--blue-500)"
        shadowColor="var(--blue-900)"
      >
        <div className="arcade-head-main">
          <p className="arcade-kicker">{t('game.roomCode').toUpperCase()}</p>
          <h1 className="arcade-room-id">{gameState.roomId}</h1>
        </div>
        <div className="arcade-head-actions">
          <ShareButton roomId={gameState.roomId} />
          {showPhaseInfo && (
            <p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>
              {t(phaseLabel[gameState.phase]).toUpperCase()}
            </p>
          )}
        </div>
      </Card>

      {error && (
        <p className="arcade-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <Card
        className="arcade-card"
        bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
        textColor="var(--neutral-white)"
        borderColor="var(--blue-500)"
        shadowColor="var(--blue-900)"
      >
        <section className={`arcade-stack ${phaseEnter ? 'arcade-action-enter' : ''}`}>
          <h2 className="arcade-panel-title">{t('game.actionBoard').toUpperCase()}</h2>
          <div className="arcade-status-box">
            <p className="arcade-kicker">{t('game.nextMove').toUpperCase()}</p>
            {showPhaseInfo && (
              <p className="arcade-muted">
                {t(phaseGuidanceKey(gameState.phase, viewerHost))}
              </p>
            )}
            {gameState.phase === Phase.ROUND_DESCRIPTION && (
              <p className="arcade-muted">
                {t('game.speaker').toUpperCase()}: {currentSpeakerName}
              </p>
            )}
            {gameState.phase === Phase.ROUND_VOTING && (
              <p className="arcade-muted">
                {t('game.voteRound').toUpperCase()}: {gameState.voteRound}
              </p>
            )}
          </div>

          {viewerHost &&
            (gameState.phase === Phase.WAITING_FOR_PLAYERS ||
              gameState.phase === Phase.GAME_CREATION) && (
              <Button
                type="button"
                className="arcade-btn arcade-btn-primary"
                onClick={onStartGame}
                bg="var(--yellow-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--yellow-700)"
              >
                {t('game.startGame').toUpperCase()}
              </Button>
            )}

          {viewerHost && (
            <Button
              type="button"
              className="arcade-btn"
              onClick={onExitGame}
              bg="var(--neutral-400)"
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow="var(--neutral-700)"
            >
              {t('game.exitGame').toUpperCase()}
            </Button>
          )}

          {(gameState.phase === Phase.ROUND_DESCRIPTION ||
            gameState.phase === Phase.ROUND_DISCUSSION) && (
            <RoundActionPanel
              gameState={gameState}
              viewerHost={viewerHost}
              currentSpeaker={gameState.players.find(
                (p) => p.id === gameState.pendingSpeakerIds[0],
              )}
              statement={statement}
              onStatementChange={onStatementChange}
              onSubmitStatement={onSubmitStatement}
              onStartVoting={onStartVoting}
            />
          )}

          {gameState.phase === Phase.ROUND_VOTING && (
            <VotingPanel
              gameState={gameState}
              playerId={playerId}
              viewer={viewer}
              alivePlayers={alivePlayers}
              viewerVotedForId={viewerVotedForId}
              onSubmitVote={onSubmitVote}
            />
          )}
        </section>
      </Card>
    </>
  );
};
