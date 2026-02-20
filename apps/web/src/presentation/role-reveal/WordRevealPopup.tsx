import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popup } from 'pixel-retroui';

interface Props {
  word: string;
  role: string | null;
  onClose: () => void;
}

const getRoleClass = (role: string | null): string => {
  if (role === 'SPY') return 'spy';
  if (role === 'WHITE') return 'white';
  return 'citizen';
};

export const WordRevealPopup = ({ word, role, onClose }: Props) => {
  const { t } = useTranslation();
  const [preCountdown, setPreCountdown] = useState(3);

  useEffect(() => {
    if (preCountdown <= 0) return;
    const timer = setTimeout(() => setPreCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [preCountdown]);

  if (preCountdown > 0) {
    return (
      <div className='arcade-pre-reveal-overlay'>
        <p className='arcade-pre-reveal-number' key={preCountdown}>
          {preCountdown}
        </p>
      </div>
    );
  }

  const roleClass = getRoleClass(role);

  return (
    <Popup
      isOpen
      onClose={onClose}
      closeButtonText='X'
      className='arcade-word-popup arcade-popup-fade-in'
      bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
      baseBg='var(--blue-900)'
      overlayBg='color-mix(in srgb, var(--neutral-black) 78%, transparent)'
      textColor='var(--yellow-300)'
      borderColor='var(--blue-500)'
    >
      <div className='arcade-popup-content'>
        <div className='arcade-popup-role-section'>
          <p className={`arcade-role-badge arcade-role-${roleClass}`}>
            {role?.toUpperCase() ?? t('game.roleLocked').toUpperCase()}
          </p>
        </div>
        <p className='arcade-popup-word'>{word}</p>
        <Button
          type='button'
          className='arcade-btn'
          onClick={onClose}
          bg='var(--yellow-400)'
          textColor='var(--neutral-black)'
          borderColor='var(--neutral-black)'
          shadow='var(--yellow-700)'
        >
          {t('wordPopup.ready').toUpperCase()}
        </Button>
      </div>
    </Popup>
  );
};
