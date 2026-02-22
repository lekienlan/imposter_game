import { useTranslation } from "react-i18next";
import { GameState, Winner } from "@imposter/shared";
import { Card, Button } from "pixel-retroui";

interface Props {
  gameState: GameState;
  onRestart?: () => void;
}

export const GameOverModal = ({ gameState, onRestart }: Props) => {
  const { t } = useTranslation();

  const getWinnerTitle = () => {
    switch (gameState.winner) {
      case Winner.CITIZENS:
        return t("game.citizensWin", "CITIZENS WIN!");
      case Winner.SPIES:
        return t("game.spiesWin", "SPIES WIN!");
      default:
        return t("game.noWinner", "DRAW!");
    }
  };

  const getWinnerColor = () => {
    switch (gameState.winner) {
      case Winner.CITIZENS:
        return "var(--blue-400)";
      case Winner.SPIES:
        return "var(--red-400)";
      default:
        return "var(--neutral-400)";
    }
  };

  return (
    <div className="arcade-modal-backdrop">
      <Card
        className="arcade-modal-content arcade-game-over-modal"
        bg="color-mix(in srgb, var(--surface-primary) 95%, var(--neutral-black))"
        textColor="var(--neutral-white)"
        borderColor={getWinnerColor()}
        shadowColor="var(--neutral-black)"
      >
        <div className="game-over-header">
          <h1 className="game-over-title blinking-text" style={{ color: getWinnerColor() }}>
            {getWinnerTitle().toUpperCase()}
          </h1>
          <p className="game-over-reason">
            {(gameState.winnerReason ?? "").toUpperCase()}
          </p>
        </div>

        {onRestart && (
          <div className="game-over-actions">
            <Button
              type="button"
              className="arcade-btn"
              onClick={onRestart}
              bg="var(--yellow-400)"
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow="var(--yellow-700)"
            >
              {t("game.playAgain", "PLAY AGAIN").toUpperCase()}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
