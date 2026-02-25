import { FormEvent, KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, TextArea } from 'pixel-retroui';
import { GameMode } from '@imposter/shared';

const PAIRS_MAX_LENGTH = 500;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 20;

interface Props {
  name: string;
  pairsInput: string;
  mode: GameMode;
  whiteEnabled: boolean;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPairsInputChange: (value: string) => void;
  onModeChange: (value: GameMode) => void;
  onWhiteEnabledChange: (value: boolean) => void;
  onCreateRoom: (event: FormEvent<HTMLFormElement>) => void;
}

export const CreateRoomForm = ({
  name,
  pairsInput,
  mode,
  whiteEnabled,
  isLoading,
  onNameChange,
  onPairsInputChange,
  onModeChange,
  onWhiteEnabledChange,
  onCreateRoom,
}: Props) => {
  const { t } = useTranslation();
  const [showPairs, setShowPairs] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>, value: GameMode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onModeChange(value);
    }
  };

  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed.length < NAME_MIN_LENGTH) return t('lobby.nameMinError', { min: NAME_MIN_LENGTH });
    if (trimmed.length > NAME_MAX_LENGTH) return t('lobby.nameMaxError', { max: NAME_MAX_LENGTH });
    return '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateName(name);
    setNameError(error);
    if (error) return;
    onCreateRoom(event);
  };

  return (
    <Card
      className="arcade-card"
      bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
      textColor="var(--neutral-white)"
      borderColor="var(--blue-500)"
      shadowColor="var(--blue-900)"
    >
      <form className="arcade-stack" onSubmit={handleSubmit}>
        <div>
          <p className="arcade-kicker">{t('lobby.hostTerminal').toUpperCase()}</p>
          <h2 className="arcade-panel-title">{t('lobby.createRoom').toUpperCase()}</h2>
        </div>

        <label className="arcade-field">
          <span className="arcade-label">{t('lobby.name').toUpperCase()}</span>
          <Input
            className="arcade-input"
            value={name}
            placeholder={t('lobby.namePlaceholder').toUpperCase()}
            onChange={(event) => {
              onNameChange(event.target.value);
              if (nameError) setNameError('');
            }}
            bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
            textColor="var(--neutral-white)"
            borderColor="var(--blue-500)"
          />
          {nameError && <p className="arcade-inline-error">{nameError}</p>}
        </label>

        <div className="arcade-field">
          <div className="arcade-label-row">
            <span className="arcade-label">{t('lobby.wordPairs').toUpperCase()}</span>
            <button
              type="button"
              className="arcade-toggle-text"
              onClick={() => setShowPairs((v) => !v)}
            >
              {showPairs ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          {showPairs && (
            <>
              <small className="arcade-help">{t('lobby.wordPairsHelp').toUpperCase()}</small>
              <TextArea
                className="arcade-textarea"
                value={pairsInput}
                maxLength={PAIRS_MAX_LENGTH}
                onChange={(event) => onPairsInputChange(event.target.value)}
                bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
                textColor="var(--neutral-white)"
                borderColor="var(--blue-500)"
              />
              <p className="arcade-char-counter">
                {pairsInput.length} / {PAIRS_MAX_LENGTH}
              </p>
            </>
          )}
        </div>

        <div className="arcade-field">
          <span className="arcade-label">{t('lobby.mode').toUpperCase()}</span>
          <div className="arcade-mode-grid" role="radiogroup" aria-label="Game mode">
            <div
              role="radio"
              aria-checked={mode === GameMode.CLASSIC}
              tabIndex={0}
              className={`arcade-mode-card ${mode === GameMode.CLASSIC ? 'is-selected' : ''}`}
              onClick={() => onModeChange(GameMode.CLASSIC)}
              onKeyDown={(event) => handleModeKeyDown(event, GameMode.CLASSIC)}
            >
              <p className="arcade-mode-title">{t('lobby.modeClassic').toUpperCase()}</p>
              <p className="arcade-mode-desc">{t('lobby.modeClassicDesc')}</p>
              <Button
                type="button"
                className="arcade-mode-option arcade-toggle-option arcade-toggle-option-small"
                aria-pressed={whiteEnabled}
                onClick={(event) => {
                  event.stopPropagation();
                  onWhiteEnabledChange(!whiteEnabled);
                }}
                bg={whiteEnabled ? 'var(--yellow-400)' : 'var(--neutral-white)'}
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow={whiteEnabled ? 'var(--yellow-700)' : 'var(--blue-700)'}
              >
                {whiteEnabled
                  ? t('lobby.whiteRoleOn').toUpperCase()
                  : t('lobby.whiteRoleOff').toUpperCase()}
              </Button>
            </div>
            <div
              role="radio"
              aria-checked={mode === GameMode.HARDCORE}
              tabIndex={0}
              className={`arcade-mode-card ${mode === GameMode.HARDCORE ? 'is-selected' : ''}`}
              onClick={() => onModeChange(GameMode.HARDCORE)}
              onKeyDown={(event) => handleModeKeyDown(event, GameMode.HARDCORE)}
            >
              <p className="arcade-mode-title">{t('lobby.modeHardcore').toUpperCase()}</p>
              <p className="arcade-mode-desc">{t('lobby.modeHardcoreDesc')}</p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="arcade-btn arcade-btn-primary"
          disabled={isLoading}
          bg="var(--yellow-400)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--yellow-700)"
        >
          {isLoading ? t('lobby.creating').toUpperCase() : t('lobby.createRoom').toUpperCase()}
        </Button>
      </form>
    </Card>
  );
};
