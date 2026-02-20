import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card } from "pixel-retroui";
import { GameMode, GameState, Phase, Player } from "@imposter/shared";
import { canViewerVote } from "../domain/gameSelectors";
import { phaseGuide, phaseTone } from "./phasePresentation";
import { ShareButton } from "./ShareButton";

interface Props {
  gameState: GameState;
  playerId: string;
  viewerHost: boolean;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForName: string | undefined;
  statement: string;
  copied: boolean;
  shareCopied: boolean;
  shareUrl: string;
  error: string;
  onCopyRoomCode: () => Promise<void>;
  onShareGame: () => void;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  onStartVoting: () => void;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const ActionBoard = ({
  gameState,
  playerId,
  viewerHost,
  viewer,
  alivePlayers,
  viewerVotedForName,
  statement,
  copied,
  shareCopied,
  shareUrl,
  error,
  onCopyRoomCode,
  onShareGame,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onStartVoting,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const [phaseEnter, setPhaseEnter] = useState(false);

  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const currentSpeakerName = currentSpeakerId
    ? gameState.players.find((p) => p.id === currentSpeakerId)?.name ?? "UNKNOWN"
    : "COMPLETED";
  const hasVoted = viewerVotedForName !== undefined;
  const guide = phaseGuide[gameState.phase];

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
          <p className="arcade-kicker">{t("game.roomCode").toUpperCase()}</p>
          <h1 className="arcade-room-id">{gameState.roomId}</h1>
        </div>
        <div className="arcade-head-actions">
          <Button
            type="button"
            className="arcade-btn"
            onClick={onCopyRoomCode}
            bg="var(--blue-400)"
            textColor="var(--neutral-black)"
            borderColor="var(--neutral-black)"
            shadow="var(--blue-700)"
          >
            {copied ? t("game.codeCopied").toUpperCase() : t("game.copyCode").toUpperCase()}
          </Button>
          {viewerHost && (
            <ShareButton
              shareUrl={shareUrl}
              roomId={gameState.roomId}
              shareCopied={shareCopied}
              onCopyLink={onShareGame}
            />
          )}
          <p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>
            {t("game.phase").toUpperCase()}: {gameState.phase}
          </p>
          {gameState.phase === Phase.GAME_ENDED && (
            <p className="arcade-phase-tag text-phase-over">
              {t("game.winner").toUpperCase()}: {gameState.winner}
            </p>
          )}
        </div>
      </Card>

      {error && (
        <p className="arcade-error" role="alert" aria-live="polite">{error}</p>
      )}

      <Card
        className="arcade-card"
        bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
        textColor="var(--neutral-white)"
        borderColor="var(--blue-500)"
        shadowColor="var(--blue-900)"
      >
        <section className={`arcade-stack ${phaseEnter ? "arcade-action-enter" : ""}`}>
          <h2 className="arcade-panel-title">{t("game.actionBoard").toUpperCase()}</h2>
          <div className="arcade-status-box">
            <p className="arcade-kicker">{t("game.nextMove").toUpperCase()}</p>
            <p className="arcade-guide-title">{guide.title.toUpperCase()}</p>
            <p className="arcade-muted">{guide.description.toUpperCase()}</p>
            {guide.tip && <p className="arcade-muted arcade-tip">{guide.tip}</p>}
            {gameState.phase === Phase.ROUND_DESCRIPTION && (
              <p className="arcade-muted">{t("game.speaker").toUpperCase()}: {currentSpeakerName}</p>
            )}
            {gameState.phase === Phase.ROUND_VOTING && (
              <p className="arcade-muted">{t("game.voteRound").toUpperCase()}: {gameState.voteRound}</p>
            )}
          </div>

          {viewerHost &&
            (gameState.phase === Phase.WAITING_FOR_PLAYERS || gameState.phase === Phase.GAME_CREATION) && (
              <Button
                type="button"
                className="arcade-btn arcade-btn-primary"
                onClick={onStartGame}
                bg="var(--yellow-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--yellow-700)"
              >
                {t("game.startGame").toUpperCase()}
              </Button>
            )}

          {viewerHost && (
            <Button
              type="button"
              className="arcade-btn"
              onClick={onResetGame}
              bg="var(--red-400)"
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow="var(--red-700)"
            >
              {t("game.resetGame").toUpperCase()}
            </Button>
          )}

          {gameState.phase === Phase.ROUND_DESCRIPTION && viewer?.isAlive && currentSpeakerId === viewer.id && (
            <form className="arcade-stack" onSubmit={onSubmitStatement}>
              <label className="arcade-field">
                <span className="arcade-label">{t("game.yourStatement").toUpperCase()}</span>
                <input
                  className="arcade-native-input"
                  placeholder={t("game.statementPlaceholder")}
                  value={statement}
                  onChange={(event) => onStatementChange(event.target.value)}
                  required
                />
              </label>
              <Button
                type="submit"
                className="arcade-btn"
                bg="var(--yellow-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--yellow-700)"
              >
                {t("game.sendStatement").toUpperCase()}
              </Button>
            </form>
          )}

          {gameState.phase === Phase.ROUND_DISCUSSION && viewerHost && (
            <Button
              type="button"
              className="arcade-btn arcade-btn-primary"
              onClick={onStartVoting}
              bg="var(--pink-500)"
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow="var(--pink-700)"
            >
              {t("game.startVoting").toUpperCase()}
            </Button>
          )}

          {gameState.phase === Phase.ROUND_VOTING && viewer?.isAlive && (
            <div className="arcade-stack">
              {canViewerVote(gameState, viewer.id) ? (
                <>
                  <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
                  {viewerVotedForName && (
                    <p className="arcade-muted">{t("game.currentVote").toUpperCase()}: {viewerVotedForName}</p>
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
          )}

          {gameState.phase === Phase.GAME_ENDED && (
            <div className="arcade-status-box">
              <p className="arcade-kicker">{t("game.finalReason").toUpperCase()}</p>
              <p className="arcade-guide-title">
                {(gameState.winnerReason ?? "NO REASON PROVIDED").toUpperCase()}
              </p>
            </div>
          )}
        </section>
      </Card>
    </>
  );
};
