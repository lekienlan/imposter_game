import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input } from 'pixel-retroui';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 20;

interface Props {
  name: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onJoinRoom: (event: FormEvent<HTMLFormElement>) => void;
}

export const JoinRoomForm = ({ name, isLoading, onNameChange, onJoinRoom }: Props) => {
  const { t } = useTranslation();
  const [nameError, setNameError] = useState('');

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
    onJoinRoom(event);
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
          <p className="arcade-kicker">{t('lobby.playerTerminal').toUpperCase()}</p>
          <h2 className="arcade-panel-title">{t('lobby.enterRoom').toUpperCase()}</h2>
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

        <Button
          type="submit"
          className="arcade-btn"
          disabled={isLoading}
          bg="var(--blue-400)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--blue-700)"
        >
          {isLoading ? t('lobby.joining').toUpperCase() : t('lobby.enterRoom').toUpperCase()}
        </Button>
      </form>
    </Card>
  );
};
