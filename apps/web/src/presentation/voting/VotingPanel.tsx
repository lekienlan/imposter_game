import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameMode, GameState, Player } from "@imposter/shared";
import { canViewerVote } from "../../domain/gameSelectors";

interface Props {
  gameState: GameState;
  playerId: string;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForName: string | undefined;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const VotingPanel = ({
  gameState,
  playerId,
  viewer,
  alivePlayers,
  viewerVotedForName,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const hasVoted = viewerVotedForName !== undefined;

  if (!viewer?.isAlive) {
    return null;
  }

  return (
    <div className="arcade-stack">
      {canViewerVote(gameState, viewer.id) ? (
        <>
          <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
          {viewerVotedForName && (
            <p className="arcade-muted">
              {t("game.currentVote").toUpperCase()}: {viewerVotedForName}
            </p>
          )}
          <div className="arcade-vote-grid">
            {alivePlayers
              .filter((player) => player.id !== playerId)
              .map((player) => (
                <Button
                  key={player.id}
                  type="button"
                  className="arcade-btn"
                  onClick={() => onSubmitVote(player.id)}
                  disabled={hasVoted}
                  bg="var(--blue-400)"
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow="var(--blue-700)"
                >
                  {player.name.toUpperCase()}
                </Button>
              ))}
            {gameState.settings.mode === GameMode.CLASSIC && (
              <Button
                type="button"
                className="arcade-btn"
                onClick={() => onSubmitVote(null)}
                disabled={hasVoted}
                bg="var(--blue-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--blue-700)"
              >
                {t("game.skip").toUpperCase()}
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="arcade-muted">{t("game.hardcoreVoteNotice").toUpperCase()}</p>
      )}
    </div>
  );
};
