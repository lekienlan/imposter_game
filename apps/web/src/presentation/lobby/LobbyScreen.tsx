import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'pixel-retroui';
import { GameMode, RoomPreviewResponse } from '@imposter/shared';
import { RoomPreviewPanel } from './RoomPreviewPanel';
import { CreateRoomForm } from './CreateRoomForm';
import { JoinRoomForm } from './JoinRoomForm';

type EntryMode = 'CREATE_ONLY' | 'JOIN_ONLY';

interface Props {
  error: string;
  name: string;
  roomId: string;
  pairsInput: string;
  mode: GameMode;
  whiteEnabled: boolean;
  entryMode: EntryMode;
  isLoading: boolean;
  previewData: RoomPreviewResponse | null;
  onNameChange: (value: string) => void;
  onRoomIdChange: (value: string) => void;
  onPairsInputChange: (value: string) => void;
  onModeChange: (value: GameMode) => void;
  onWhiteEnabledChange: (value: boolean) => void;
  onCreateRoom: (event: FormEvent<HTMLFormElement>) => void;
  onJoinRoom: (event: FormEvent<HTMLFormElement>) => void;
}

export const LobbyScreen = ({
  error,
  name,
  roomId,
  pairsInput,
  mode,
  whiteEnabled,
  entryMode,
  isLoading,
  previewData,
  onNameChange,
  onPairsInputChange,
  onModeChange,
  onWhiteEnabledChange,
  onCreateRoom,
  onJoinRoom,
}: Props) => {
  const { t } = useTranslation();

  if (entryMode === 'JOIN_ONLY') {
    return (
      <main className="arcade-screen">
        <section className="arcade-header">
          <h1 className="arcade-title">{t('lobby.title').toUpperCase()}</h1>
          <p className="arcade-subtitle">{t('lobby.subtitle').toUpperCase()}</p>
        </section>

        <div className="arcade-grid">
          <Card
            className="arcade-card"
            bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
            textColor="var(--neutral-white)"
            borderColor="var(--blue-500)"
            shadowColor="var(--blue-900)"
          >
            <RoomPreviewPanel roomCode={roomId} previewData={previewData} error={error} />
          </Card>

          <JoinRoomForm
            name={name}
            isLoading={isLoading}
            onNameChange={onNameChange}
            onJoinRoom={onJoinRoom}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="arcade-screen">
      <section className="arcade-header">
        <h1 className="arcade-title">{t('lobby.title').toUpperCase()}</h1>
        <p className="arcade-subtitle">{t('lobby.subtitle').toUpperCase()}</p>
        {error && (
          <p className="arcade-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </section>

      <div className="arcade-grid">
        <CreateRoomForm
          name={name}
          pairsInput={pairsInput}
          mode={mode}
          whiteEnabled={whiteEnabled}
          isLoading={isLoading}
          onNameChange={onNameChange}
          onPairsInputChange={onPairsInputChange}
          onModeChange={onModeChange}
          onWhiteEnabledChange={onWhiteEnabledChange}
          onCreateRoom={onCreateRoom}
        />
      </div>
    </main>
  );
};
