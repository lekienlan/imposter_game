import { useTranslation } from 'react-i18next';
import { GameState, Player, Role, Winner } from '@imposter/shared';
import { Card, Button } from 'pixel-retroui';
import { didPlayerWin, getRoleLabel, getRoleColorClass } from '../../domain/utils/gameSelectors';

interface Props {
  gameState: GameState;
  viewer: Player | undefined;
  onRestart?: () => void;
}

export const GameOverModal = ({ gameState, viewer, onRestart }: Props) => {
  const { t } = useTranslation();

  const getWinnerTitle = () => {
    switch (gameState.winner) {
      case Winner.CITIZENS:
        return t('game.citizensWin', 'CITIZENS WIN!');
      case Winner.SPIES:
        return t('game.spiesWin', 'SPIES WIN!');
      default:
        return t('game.noWinner', 'DRAW!');
    }
  };

  const getWinnerColor = () => {
    switch (gameState.winner) {
      case Winner.CITIZENS:
        return 'var(--blue-400)';
      case Winner.SPIES:
        return 'var(--red-400)';
      default:
        return 'var(--neutral-400)';
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
          <p className="game-over-reason">{(gameState.winnerReason ?? '').toUpperCase()}</p>
        </div>

        <div className="game-over-players">
          <table className="arcade-table">
            <thead>
              <tr>
                <th>{t('game.player', 'PLAYER').toUpperCase()}</th>
                <th>{t('game.role', 'ROLE').toUpperCase()}</th>
                <th>{t('game.status', 'STATUS').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              {gameState.players.map((player) => {
                const isWinner = didPlayerWin(player, gameState.winner);
                const isViewer = player.id === viewer?.id;
                const isSpy = player.role === Role.SPY;
                const isWhite = player.role === Role.WHITE;
                return (
                  <tr
                    key={player.id}
                    className={[
                      isWinner ? 'row-winner' : 'row-loser',
                      isViewer ? 'row-viewer' : '',
                      isSpy ? 'row-spy' : '',
                      isWhite ? 'row-white' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <td className="player-name">
                      {isViewer ? t('game.youLabel', { name: player.name }) : player.name}
                    </td>
                    <td className={`player-role ${getRoleColorClass(player.role)}`}>
                      {isSpy && '🕵️ '}{getRoleLabel(player.role)}
                    </td>
                    <td className="player-status">
                      {isWinner ? (
                        <span className="status-badge victory-badge">
                          {t('game.victory', 'VICTORY')}
                        </span>
                      ) : (
                        <span className="status-badge defeat-badge">
                          {t('game.defeat', 'DEFEAT')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              {t('game.playAgain', 'PLAY AGAIN').toUpperCase()}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
