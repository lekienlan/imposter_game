import { useTranslation } from "react-i18next";
import { GameState, Role, Winner, Player } from "@imposter/shared";
import { Card, Button } from "pixel-retroui";

interface Props {
  gameState: GameState;
  onClose: () => void;
}

export const GameEndRoleRevealModal = ({ gameState, onClose }: Props) => {
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

  const didPlayerWin = (player: Player) => {
    if (gameState.winner === Winner.CITIZENS && (player.role === Role.CITIZEN || player.role === Role.WHITE)) {
      return true;
    }
    if (gameState.winner === Winner.SPIES && player.role === Role.SPY) {
      return true;
    }
    return false;
  };

  const getRoleLabel = (role: Role | null) => {
    switch (role) {
      case Role.CITIZEN:
        return t("role.citizen", "CITIZEN");
      case Role.SPY:
        return t("role.spy", "SPY");
      case Role.WHITE:
        return t("role.white", "WHITE ROLE");
      default:
        return t("role.unknown", "UNKNOWN");
    }
  };

  const getRoleColorClass = (role: Role | null) => {
    switch (role) {
      case Role.CITIZEN:
        return "text-blue-400";
      case Role.SPY:
        return "text-red-400";
      case Role.WHITE:
        return "text-neutral-400";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div className="arcade-modal-backdrop" style={{ zIndex: 1000 }}>
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

        <div className="game-over-players">
          <table className="arcade-table">
            <thead>
              <tr>
                <th>{t("game.player", "PLAYER").toUpperCase()}</th>
                <th>{t("game.role", "ROLE").toUpperCase()}</th>
                <th>{t("game.status", "STATUS").toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players.map((player) => {
                const isWinner = didPlayerWin(player);
                return (
                  <tr key={player.id} className={isWinner ? "row-winner" : "row-loser"}>
                    <td className="player-name">{player.name}</td>
                    <td className={`player-role ${getRoleColorClass(player.role)}`}>
                      {getRoleLabel(player.role)}
                    </td>
                    <td className="player-status">
                      {isWinner ? (
                        <span className="status-badge victory-badge">{t("game.victory", "VICTORY")}</span>
                      ) : (
                        <span className="status-badge defeat-badge">{t("game.defeat", "DEFEAT")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="game-over-actions">
          <Button
            type="button"
            className="arcade-btn"
            onClick={onClose}
            bg="var(--blue-400)"
            textColor="var(--neutral-black)"
            borderColor="var(--neutral-black)"
            shadow="var(--blue-700)"
          >
            {t("game.continue", "CONTINUE").toUpperCase()}
          </Button>
        </div>
      </Card>
    </div>
  );
};
