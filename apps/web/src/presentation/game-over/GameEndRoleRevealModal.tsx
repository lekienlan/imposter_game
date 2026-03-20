import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GameState, Player } from '@imposter/shared';
import { Card, Button } from 'pixel-retroui';
import { didPlayerWin, getRoleLabel, getRoleColorClass } from '../../domain/utils/gameSelectors';

interface Props {
  gameState: GameState;
  viewer: Player | undefined;
  onClose: () => void;
}

export const GameEndRoleRevealModal = ({ gameState, viewer, onClose }: Props) => {
  const { t } = useTranslation();
  const [isFadingOut, setIsFadingOut] = useState(false);

  const viewerWon = viewer ? didPlayerWin(viewer, gameState.winner) : false;

  const handleAdvance = useCallback(() => {
    setIsFadingOut(true);
    const timer = setTimeout(() => {
      onClose();
    }, 200);
    return () => clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAdvance();
    }, 4000);
    return () => clearTimeout(timer);
  }, [handleAdvance]);

  return (
    <div
      className={`arcade-modal-backdrop ${isFadingOut ? 'role-reveal-fade-out' : ''}`}
      style={{ zIndex: 1000 }}
    >
      <Card
        className="arcade-modal-content arcade-game-over-modal role-reveal-modal"
        bg="color-mix(in srgb, var(--surface-primary) 95%, var(--neutral-black))"
        textColor="var(--neutral-white)"
        borderColor="var(--blue-400)"
        shadowColor="var(--neutral-black)"
      >
        <div className="game-over-header role-reveal-header">
          <span
            className={`status-badge blinking-text ${viewerWon ? 'victory-badge' : 'defeat-badge'}`}
            style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)' }}
          >
            {(viewerWon ? t('game.victory') : t('game.defeat')).toUpperCase()}
          </span>
          <p className="role-reveal-label">{t('game.role').toUpperCase()}</p>
          <p className={`role-reveal-role ${getRoleColorClass(viewer?.role ?? null)}`}>
            {getRoleLabel(viewer?.role ?? null).toUpperCase()}
          </p>
        </div>

        <div className="game-over-actions">
          <Button
            type="button"
            className="arcade-btn"
            onClick={handleAdvance}
            bg="var(--blue-400)"
            textColor="var(--neutral-black)"
            borderColor="var(--neutral-black)"
            shadow="var(--blue-700)"
          >
            {t('game.continue', 'CONTINUE').toUpperCase()}
          </Button>
        </div>
      </Card>
    </div>
  );
};
