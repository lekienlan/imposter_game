import { useTranslation } from "react-i18next";
import { Card } from "pixel-retroui";
import { Phase, Player } from "@imposter/shared";

interface Props {
  players: Player[];
  aliveCount: number;
  phase: Phase;
  currentSpeakerId: string | null;
}

export const PlayersPanel = ({ players, aliveCount, phase, currentSpeakerId }: Props) => {
  const { t } = useTranslation();

  return (
    <Card
      className="arcade-card"
      bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
      textColor="var(--neutral-white)"
      borderColor="var(--blue-500)"
      shadowColor="var(--blue-900)"
    >
      <div className="arcade-stack">
        <div className="arcade-inline-head">
          <h2 className="arcade-panel-title">{t("game.players").toUpperCase()}</h2>
          <p className="arcade-counter">{t("game.alive").toUpperCase()} {aliveCount}</p>
        </div>
        <ul className="arcade-player-list">
          {players.map((player) => {
            const isSpeaker = phase === Phase.ROUND_DESCRIPTION && player.id === currentSpeakerId;
            const isEliminated = !player.isAlive;
            const itemClass = [
              "arcade-player-item",
              isSpeaker ? "arcade-speaker" : "",
              isEliminated ? "arcade-player-eliminated" : "",
            ].filter(Boolean).join(" ");

            return (
              <li key={player.id} className={itemClass}>
                <p className="arcade-player-name">{player.name}</p>
                <p className={player.isAlive ? "arcade-alive" : "arcade-out"}>
                  {player.isAlive ? t("game.alive").toUpperCase() : t("game.out").toUpperCase()}
                </p>
                <p className="arcade-muted">{t("game.statement").toUpperCase()}: {player.statement == null ? "-" : player.statement || t("game.noStatement")}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};
