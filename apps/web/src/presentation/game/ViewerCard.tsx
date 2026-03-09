import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'pixel-retroui';
import { Player, Role } from '@imposter/shared';

interface Props {
  viewer: Player | undefined;
  isGameOver: boolean;
  canSeeWord: boolean;
  wordJustRevealed: boolean;
}

const getRoleClass = (role: Role | null): string => {
  if (role === Role.SPY) return 'spy';
  if (role === Role.WHITE) return 'white';
  return 'citizen';
};

export const ViewerCard = ({ viewer, isGameOver, canSeeWord, wordJustRevealed }: Props) => {
  const { t } = useTranslation();
  const [isMiniWordOpen, setIsMiniWordOpen] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMiniWordOpen) return;
    dismissTimerRef.current = setTimeout(() => setIsMiniWordOpen(false), 3000);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [isMiniWordOpen]);

  const toggleMiniWord = () => setIsMiniWordOpen((prev) => !prev);

  const wordDisplay = viewer?.word ?? t('game.wordLocked');
  const displayWord = canSeeWord ? t('game.wordMasked') : wordDisplay;
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
        <h2 className="arcade-viewer-header">{t('game.you').toUpperCase()}</h2>
        {viewer ? (
          <>
            <div className="arcade-viewer-row">
              <span className="arcade-viewer-chip arcade-viewer-chip-role">
                <span className="arcade-viewer-label">{t('game.role').toUpperCase()}</span>
                <span
                  className={
                    isGameOver && roleClass
                      ? `arcade-viewer-value arcade-role-badge arcade-role-${roleClass}`
                      : 'arcade-viewer-value'
                  }
                >
                  {isGameOver ? (viewer.role ?? t('game.roleLocked')) : '???'}
                </span>
              </span>
              <span className="arcade-viewer-chip arcade-viewer-chip-name">
                <span className="arcade-viewer-label">{t('game.name').toUpperCase()}</span>
                <span className="arcade-viewer-value">{viewer.name}</span>
              </span>
            </div>
            <div className={`arcade-viewer-word-block${wordJustRevealed ? ' arcade-viewer-word-block--pulse' : ''}`}>
              <span className="arcade-viewer-label">{t('game.word').toUpperCase()}</span>
              <p className="arcade-viewer-word">{displayWord}</p>
              {canSeeWord && (
                <button
                  type="button"
                  className="arcade-eye-btn"
                  onClick={toggleMiniWord}
                  aria-label={t('game.peekWord')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              )}
              {isMiniWordOpen && viewer?.word && (
                <div className="arcade-mini-word-popup">
                  <span>{viewer.word}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="arcade-viewer-empty">
            <p className="arcade-muted">{t('game.viewerUnavailable').toUpperCase()}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
