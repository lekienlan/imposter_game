import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "pixel-retroui";
import { GameState, Phase, Player } from "@imposter/shared";
import { isHost } from "../domain/gameSelectors";
import { WordRevealPopup } from "./WordRevealPopup";
import { PlayersPanel } from "./PlayersPanel";
import { ActionBoard } from "./ActionBoard";

interface Props {
  roomId: string;
  playerId: string;
  gameState: GameState;
  error: string;
  copied: boolean;
  shareCopied: boolean;
  shareUrl: string;
  isWordPopupOpen: boolean;
  statement: string;
  alivePlayers: Player[];
  viewer: Player | undefined;
  viewerVotedForName: string | undefined;
  onCopyRoomCode: () => Promise<void>;
  onShareGame: () => void;
  onCloseWordPopup: () => void;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  onStartVoting: () => void;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

const PRE_GAME_PHASES: Phase[] = [Phase.WAITING_FOR_PLAYERS, Phase.GAME_CREATION];

export const GameScreen = ({
  playerId,
  gameState,
  error,
  copied,
  shareCopied,
  shareUrl,
  isWordPopupOpen,
  statement,
  alivePlayers,
  viewer,
  viewerVotedForName,
  onCopyRoomCode,
  onShareGame,
  onCloseWordPopup,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onStartVoting,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const viewerHost = isHost(gameState, playerId);
  const isPreGame = PRE_GAME_PHASES.includes(gameState.phase);

  const resolveWordDisplay = (): string => {
    if (viewer?.word) return viewer.word;
    if (isPreGame) return t("game.wordLocked");
    return t("game.wordLocked");
  };

  return (
    <>
      {isWordPopupOpen && viewer?.word && (
        <WordRevealPopup word={viewer.word} role={viewer.role} onClose={onCloseWordPopup} />
      )}
      <main className="arcade-screen">
        <ActionBoard
          gameState={gameState}
          playerId={playerId}
          viewerHost={viewerHost}
          viewer={viewer}
          alivePlayers={alivePlayers}
          viewerVotedForName={viewerVotedForName}
          statement={statement}
          copied={copied}
          shareCopied={shareCopied}
          shareUrl={shareUrl}
          error={error}
          onCopyRoomCode={onCopyRoomCode}
          onShareGame={onShareGame}
          onStatementChange={onStatementChange}
          onSubmitStatement={onSubmitStatement}
          onStartGame={onStartGame}
          onResetGame={onResetGame}
          onStartVoting={onStartVoting}
          onSubmitVote={onSubmitVote}
        />

        <div className="arcade-grid arcade-grid-game">
          <Card
            className="arcade-card"
            bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
            textColor="var(--neutral-white)"
            borderColor="var(--blue-500)"
            shadowColor="var(--blue-900)"
          >
            <div className="arcade-stack">
              <h2 className="arcade-panel-title">{t("game.you").toUpperCase()}</h2>
              {viewer ? (
                <dl className="arcade-dl">
                  <div>
                    <dt>{t("game.role").toUpperCase()}</dt>
                    <dd>{viewer.role ?? t("game.roleLocked")}</dd>
                  </div>
                  <div>
                    <dt>{t("game.name").toUpperCase()}</dt>
                    <dd>{viewer.name}</dd>
                  </div>
                  <div>
                    <dt>{t("game.word").toUpperCase()}</dt>
                    <dd>{resolveWordDisplay()}</dd>
                  </div>
                </dl>
              ) : (
                <p className="arcade-muted">{t("game.viewerUnavailable").toUpperCase()}</p>
              )}
            </div>
          </Card>

          <PlayersPanel
            players={gameState.players}
            aliveCount={alivePlayers.length}
            phase={gameState.phase}
            currentSpeakerId={currentSpeakerId}
          />
        </div>
      </main>
    </>
  );
};
