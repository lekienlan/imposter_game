import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Popup } from "pixel-retroui";

interface Props {
  word: string;
  role: string | null;
  onClose: () => void;
}

export const WordRevealPopup = ({ word, role, onClose }: Props) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <Popup
      isOpen
      onClose={onClose}
      title="SECRET WORD"
      closeButtonText="X"
      className="arcade-word-popup arcade-popup-fade-in"
      bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
      baseBg="var(--blue-900)"
      overlayBg="color-mix(in srgb, var(--neutral-black) 78%, transparent)"
      textColor="var(--yellow-300)"
      borderColor="var(--blue-500)"
    >
      <div className="arcade-popup-content">
        <p className="arcade-popup-word">{word}</p>
        <p className="arcade-popup-role">{t("game.role").toUpperCase()}: {role ?? t("game.roleLocked")}</p>
        {countdown > 0 ? (
          <p className="arcade-countdown">{countdown}</p>
        ) : (
          <Button
            type="button"
            className="arcade-btn"
            onClick={onClose}
            bg="var(--yellow-400)"
            textColor="var(--neutral-black)"
            borderColor="var(--neutral-black)"
            shadow="var(--yellow-700)"
          >
            {t("wordPopup.ready").toUpperCase()}
          </Button>
        )}
      </div>
    </Popup>
  );
};
