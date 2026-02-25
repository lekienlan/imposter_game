import { useTranslation } from 'react-i18next';
import { GameState, Role, Winner, Player } from '@imposter/shared';
import { Card, Button } from 'pixel-retroui';

interface Props {
  gameState: GameState;
  viewer: Player | undefined;
  onClose: () => void;
}

export const GameEndRoleRevealModal = ({ gameState, viewer, onClose }: Props) => {
  const { t } = useTranslation();

  const didPlayerWin = (player: Player) => {
    if (
      gameState.winner === Winner.CITIZENS &&
      (player.role === Role.CITIZEN || player.role === Role.WHITE)
    ) {
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
        return t('role.citizen', 'CITIZEN');
      case Role.SPY:
        return t('role.spy', 'SPY');
      case Role.WHITE:
        return t('role.white', 'WHITE ROLE');
      default:
        return t('role.unknown', 'UNKNOWN');
    }
  };

  const getRoleColorClass = (role: Role | null) => {
    switch (role) {
      case Role.CITIZEN:
        return 'text-blue-400';
      case Role.SPY:
        return 'text-red-400';
      case Role.WHITE:
        return 'text-neutral-400';
      default:
        return 'text-neutral-400';
    }
  };

  const viewerWon = viewer ? didPlayerWin(viewer) : false;

  return (
    <div className="arcade-modal-backdrop" style={{ zIndex: 1000 }}>
      <Card
        className="arcade-modal-content arcade-game-over-modal role-reveal-modal"
        bg="color-mix(in srgb, var(--surface-primary) 95%, var(--neutral-black))"
        textColor="var(--neutral-white)"
        borderColor="var(--blue-400)"
        shadowColor="var(--neutral-black)"
      >
        <div className="game-over-header role-reveal-header">
          <p className="role-reveal-label">{t('game.role', 'ROLE').toUpperCase()}</p>
          <p className={`role-reveal-role ${getRoleColorClass(viewer?.role ?? null)}`}>
            {getRoleLabel(viewer?.role ?? null).toUpperCase()}
          </p>
        </div>

        <div className="role-reveal-status-wrap">
          <p className="role-reveal-label">{t('game.status', 'STATUS').toUpperCase()}</p>
          <span className={`status-badge ${viewerWon ? 'victory-badge' : 'defeat-badge'}`}>
            {(viewerWon ? t('game.victory', 'VICTORY') : t('game.defeat', 'DEFEAT')).toUpperCase()}
          </span>
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
            {t('game.continue', 'CONTINUE').toUpperCase()}
          </Button>
        </div>
      </Card>
    </div>
  );
};
