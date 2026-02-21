import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameState, Phase, Player } from "@imposter/shared";

interface Props {
  gameState: GameState;
  playerId: string;
  viewerHost: boolean;
  viewer: Player | undefined;
  statement: string;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartVoting: () => void;
}

export const RoundActionPanel = ({
  gameState,
  playerId,
  viewerHost,
  viewer,
  statement,
  onStatementChange,
  onSubmitStatement,
  onStartVoting,
}: Props) => {
  const { t } = useTranslation();
  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;

  return (
    <>
      {viewer?.isAlive && currentSpeakerId === viewer.id && (
        <form className="arcade-stack" onSubmit={onSubmitStatement}>
          <label className="arcade-field">
            <span className="arcade-label">{t("game.yourStatement").toUpperCase()}</span>
            <input
              className="arcade-native-input"
              placeholder={t("game.statementPlaceholder")}
              value={statement}
              onChange={(event) => onStatementChange(event.target.value)}
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

      {viewerHost && gameState.phase === Phase.ROUND_DISCUSSION && (
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
    </>
  );
};
