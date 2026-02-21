import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameMode, GameState, Player } from "@imposter/shared";
import { canViewerVote } from "../../domain/gameSelectors";

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
  const hasVoted = viewerVotedForId !== undefined;
  const votedForName =
    typeof viewerVotedForId === "string"
      ? alivePlayers.find((p) => p.id === viewerVotedForId)?.name
      : undefined;

  if (!viewer?.isAlive) {
    return null;
  }

  return (
    <div className="arcade-stack">
      {canViewerVote(gameState, viewer.id) ? (
        <>
          <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
          {hasVoted && (
            <p className="arcade-muted">
              {t("game.currentVote").toUpperCase()}:{" "}
              {votedForName ?? t("game.skip").toUpperCase()}
            </p>
          )}
          <div className="arcade-vote-grid">
            {alivePlayers
              .filter((player) => player.id !== playerId)
              .map((player) => {
                const isSelected = viewerVotedForId === player.id;
                return (
                  <Button
                    key={player.id}
                    type="button"
                    className="arcade-btn"
                    onClick={() => onSubmitVote(player.id)}
                    bg={isSelected ? "var(--yellow-400)" : "var(--blue-400)"}
                    textColor="var(--neutral-black)"
                    borderColor="var(--neutral-black)"
                    shadow={isSelected ? "var(--yellow-700)" : "var(--blue-700)"}
                  >
                    {player.name.toUpperCase()}
                  </Button>
                );
              })}
            {gameState.settings.mode === GameMode.CLASSIC && (() => {
              const isSkipSelected = viewerVotedForId === null;
              return (
                <Button
                  type="button"
                  className="arcade-btn"
                  onClick={() => onSubmitVote(null)}
                  bg={isSkipSelected ? "var(--yellow-400)" : "var(--blue-400)"}
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow={isSkipSelected ? "var(--yellow-700)" : "var(--blue-700)"}
                >
                  {t("game.skip").toUpperCase()}
                </Button>
              );
            })()}
          </div>
        </>
      ) : (
        <p className="arcade-muted">{t("game.hardcoreVoteNotice").toUpperCase()}</p>
      )}
    </div>
  );
};
