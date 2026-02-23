import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'pixel-retroui';
import { GameMode, GameState, Player } from '@imposter/shared';
import { isHost } from '../../domain/gameSelectors';

interface Props {
  gameState: GameState;
  playerId: string;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForId: string | null | undefined;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const VotingPanel = ({
  gameState,
  playerId,
  viewer,
  alivePlayers,
  viewerVotedForId,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const viewerIsHost = isHost(gameState, playerId);
  const [selectedTarget, setSelectedTarget] = useState<string | null | undefined>(undefined);

  const hasVoted = viewerVotedForId !== undefined;
  const votedForName =
    typeof viewerVotedForId === 'string'
      ? alivePlayers.find((p) => p.id === viewerVotedForId)?.name
      : undefined;

  if (!viewerIsHost) {
    if (!viewer?.isAlive) return null;
    return <p className="arcade-muted">{t('game.waitingForHostVote').toUpperCase()}</p>;
  }

  const handleSubmit = () => {
    if (selectedTarget === undefined) return;
    onSubmitVote(selectedTarget);
    setSelectedTarget(undefined);
  };

  return (
    <div className="arcade-stack">
      <p className="arcade-muted">{t('game.castVote').toUpperCase()}</p>
      {hasVoted && (
        <p className="arcade-muted">
          {t('game.currentVote').toUpperCase()}: {votedForName ?? t('game.skip').toUpperCase()}
        </p>
      )}
      <div className="arcade-vote-grid">
        {alivePlayers.map((player) => {
          const isSelected = selectedTarget === player.id;
          return (
            <Button
              key={player.id}
              type="button"
              className="arcade-btn"
              onClick={() => setSelectedTarget(player.id)}
              bg={isSelected ? 'var(--yellow-400)' : 'var(--blue-400)'}
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow={isSelected ? 'var(--yellow-700)' : 'var(--blue-700)'}
            >
              {player.name.toUpperCase()}
            </Button>
          );
        })}
        {gameState.settings.mode === GameMode.CLASSIC &&
          (() => {
            const isSkipSelected = selectedTarget === null;
            return (
              <Button
                type="button"
                className="arcade-btn"
                onClick={() => setSelectedTarget(null)}
                bg={isSkipSelected ? 'var(--yellow-400)' : 'var(--blue-400)'}
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow={isSkipSelected ? 'var(--yellow-700)' : 'var(--blue-700)'}
              >
                {t('game.skip').toUpperCase()}
              </Button>
            );
          })()}
      </div>
      <Button
        type="button"
        className="arcade-btn"
        onClick={handleSubmit}
        disabled={selectedTarget === undefined}
        bg="var(--green-400)"
        textColor="var(--neutral-black)"
        borderColor="var(--neutral-black)"
        shadow="var(--green-700)"
      >
        {t('game.submitVote').toUpperCase()}
      </Button>
    </div>
  );
};
