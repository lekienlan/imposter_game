import { useTranslation } from 'react-i18next';

interface Props {
  winnerReason: string | null | undefined;
}

export const GameOverPanel = ({ winnerReason }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="arcade-status-box">
      <p className="arcade-kicker">{t('game.finalReason').toUpperCase()}</p>
      <p className="arcade-guide-title">{(winnerReason ?? 'NO REASON PROVIDED').toUpperCase()}</p>
    </div>
  );
};
