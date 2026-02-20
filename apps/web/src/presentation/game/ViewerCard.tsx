import { useTranslation } from "react-i18next";
import { Card } from "pixel-retroui";
import { Player, Role } from "@imposter/shared";

interface Props {
  viewer: Player | undefined;
}

const getRoleClass = (role: Role | null): string => {
  if (role === Role.SPY) return "spy";
  if (role === Role.WHITE) return "white";
  return "citizen";
};

export const ViewerCard = ({ viewer }: Props) => {
  const { t } = useTranslation();
  const wordDisplay = viewer?.word ?? t("game.wordLocked");
  const roleClass = viewer?.role ? getRoleClass(viewer.role) : null;

  return (
    <Card
      className="arcade-card arcade-viewer-card"
      bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
      textColor="var(--neutral-white)"
      borderColor="var(--blue-500)"
      shadowColor="var(--blue-900)"
    >
      <div className="arcade-viewer-content">
        <h2 className="arcade-viewer-header">{t("game.you").toUpperCase()}</h2>
        {viewer ? (
          <>
            <div className="arcade-viewer-row">
              <span className="arcade-viewer-chip arcade-viewer-chip-role">
                <span className="arcade-viewer-label">{t("game.role").toUpperCase()}</span>
                <span
                  className={
                    roleClass
                      ? `arcade-viewer-value arcade-role-badge arcade-role-${roleClass}`
                      : "arcade-viewer-value"
                  }
                >
                  {viewer.role ?? t("game.roleLocked")}
                </span>
              </span>
              <span className="arcade-viewer-chip arcade-viewer-chip-name">
                <span className="arcade-viewer-label">{t("game.name").toUpperCase()}</span>
                <span className="arcade-viewer-value">{viewer.name}</span>
              </span>
            </div>
            <div className="arcade-viewer-word-block">
              <span className="arcade-viewer-label">{t("game.word").toUpperCase()}</span>
              <p className="arcade-viewer-word">{wordDisplay}</p>
            </div>
          </>
        ) : (
          <div className="arcade-viewer-empty">
            <p className="arcade-muted">{t("game.viewerUnavailable").toUpperCase()}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
