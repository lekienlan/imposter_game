import { FormEvent, KeyboardEvent } from 'react';
import { Button, Card, Input, TextArea } from 'pixel-retroui';
import { GameMode, RoomPreviewResponse } from '@imposter/shared';
import { RoomPreviewPanel } from './RoomPreviewPanel';

type EntryMode = "CREATE_ONLY" | "JOIN_ONLY";

interface Props {
  error: string;
  name: string;
  roomId: string;
  pairsInput: string;
  mode: GameMode;
  whiteEnabled: boolean;
  entryMode: EntryMode;
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
  previewData,
  onNameChange,
  onRoomIdChange,
  onPairsInputChange,
  onModeChange,
  onWhiteEnabledChange,
  onCreateRoom,
  onJoinRoom,
}: Props) => {
  const handleModeKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    value: GameMode,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onModeChange(value);
    }
  };

  if (entryMode === "JOIN_ONLY") {
    return (
      <main className='arcade-screen'>
        <section className='arcade-header'>
          <h1 className='arcade-title'>IMPOSTER ARCADE</h1>
          <p className='arcade-subtitle'>ONE ROOM. ONE SECRET WORD. FIND THE IMPOSTER.</p>
        </section>

        <div className='arcade-grid'>
          <Card
            className='arcade-card'
            bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
            textColor='var(--neutral-white)'
            borderColor='var(--blue-500)'
            shadowColor='var(--blue-900)'
          >
            <RoomPreviewPanel roomCode={roomId} previewData={previewData} error={error} />
          </Card>

          <Card
            className='arcade-card'
            bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
            textColor='var(--neutral-white)'
            borderColor='var(--blue-500)'
            shadowColor='var(--blue-900)'
          >
            <form className='arcade-stack' onSubmit={onJoinRoom}>
              <div>
                <p className='arcade-kicker'>PLAYER TERMINAL</p>
                <h2 className='arcade-panel-title'>ENTER ROOM</h2>
              </div>

              <label className='arcade-field'>
                <span className='arcade-label'>NAME</span>
                <Input
                  className='arcade-input'
                  value={name}
                  placeholder='PLAYER NAME'
                  onChange={(event) => onNameChange(event.target.value)}
                  bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
                  textColor='var(--neutral-white)'
                  borderColor='var(--blue-500)'
                />
              </label>

              <Button
                type='submit'
                className='arcade-btn'
                bg='var(--blue-400)'
                textColor='var(--neutral-black)'
                borderColor='var(--neutral-black)'
                shadow='var(--blue-700)'
              >
                ENTER ROOM
              </Button>
            </form>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className='arcade-screen'>
      <section className='arcade-header'>
        <h1 className='arcade-title'>IMPOSTER ARCADE</h1>
        <p className='arcade-subtitle'>
          ONE ROOM. ONE SECRET WORD. FIND THE IMPOSTER.
        </p>
        {error && (
          <p className='arcade-error' role='alert' aria-live='polite'>
            {error}
          </p>
        )}
      </section>

      <div className='arcade-grid'>
        <Card
          className='arcade-card'
          bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
          textColor='var(--neutral-white)'
          borderColor='var(--blue-500)'
          shadowColor='var(--blue-900)'
        >
          <form className='arcade-stack' onSubmit={onCreateRoom}>
            <div>
              <p className='arcade-kicker'>HOST TERMINAL</p>
              <h2 className='arcade-panel-title'>CREATE ROOM</h2>
            </div>

            <label className='arcade-field'>
              <span className='arcade-label'>NAME</span>
              <Input
                className='arcade-input'
                value={name}
                placeholder='PLAYER NAME'
                onChange={(event) => onNameChange(event.target.value)}
                bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
                textColor='var(--neutral-white)'
                borderColor='var(--blue-500)'
              />
            </label>

            <label className='arcade-field'>
              <span className='arcade-label'>WORD PAIRS</span>
              <small className='arcade-help'>FORMAT: APPLE | PEAR</small>
              <TextArea
                className='arcade-textarea'
                value={pairsInput}
                onChange={(event) => onPairsInputChange(event.target.value)}
                bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
                textColor='var(--neutral-white)'
                borderColor='var(--blue-500)'
              />
            </label>

            <div className='arcade-field'>
              <span className='arcade-label'>MODE</span>
              <div
                className='arcade-mode-grid'
                role='radiogroup'
                aria-label='Game mode'
              >
                <div
                  role='radio'
                  aria-checked={mode === GameMode.CLASSIC}
                  tabIndex={0}
                  className={`arcade-mode-card ${mode === GameMode.CLASSIC ? 'is-selected' : ''}`}
                  onClick={() => onModeChange(GameMode.CLASSIC)}
                  onKeyDown={(event) =>
                    handleModeKeyDown(event, GameMode.CLASSIC)
                  }
                >
                  <p className='arcade-mode-title'>CLASSIC</p>
                  <p className='arcade-mode-desc'>STANDARD FLOW, EASY ENTRY.</p>
                  <Button
                    type='button'
                    className={`arcade-mode-option arcade-toggle-option arcade-toggle-option-small ${whiteEnabled ? 'is-selected' : ''}`}
                    aria-pressed={whiteEnabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      onWhiteEnabledChange(!whiteEnabled);
                    }}
                    bg={
                      whiteEnabled
                        ? 'var(--yellow-400)'
                        : 'var(--neutral-white)'
                    }
                    textColor='var(--neutral-black)'
                    borderColor='var(--neutral-black)'
                    shadow={
                      whiteEnabled ? 'var(--yellow-700)' : 'var(--blue-700)'
                    }
                  >
                    {whiteEnabled ? 'WHITE ROLE: ON' : 'WHITE ROLE: OFF'}
                  </Button>
                </div>
                <div
                  role='radio'
                  aria-checked={mode === GameMode.HARDCORE}
                  tabIndex={0}
                  className={`arcade-mode-card ${mode === GameMode.HARDCORE ? 'is-selected' : ''}`}
                  onClick={() => onModeChange(GameMode.HARDCORE)}
                  onKeyDown={(event) =>
                    handleModeKeyDown(event, GameMode.HARDCORE)
                  }
                >
                  <p className='arcade-mode-title'>HARDCORE</p>
                  <p className='arcade-mode-desc'>
                    NO WHITE ROLE, HIGHER PRESSURE.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type='submit'
              className='arcade-btn arcade-btn-primary'
              bg='var(--yellow-400)'
              textColor='var(--neutral-black)'
              borderColor='var(--neutral-black)'
              shadow='var(--yellow-700)'
            >
              CREATE ROOM
            </Button>
          </form>
        </Card>

        <Card
          className='arcade-card'
          bg='color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))'
          textColor='var(--neutral-white)'
          borderColor='var(--blue-500)'
          shadowColor='var(--blue-900)'
        >
          <div className='arcade-stack'>
            <p className='arcade-kicker'>RULE PANEL</p>
            <h2 className='arcade-panel-title'>HOW TO PLAY</h2>
            <ol className='arcade-list'>
              <li>ALL PLAYERS JOIN THE SAME ROOM CODE.</li>
              <li>EACH PLAYER READS A SECRET ROLE.</li>
              <li>SPEAK ONE STATEMENT EACH ROUND.</li>
              <li>DISCUSS AND ELIMINATE A SUSPECT.</li>
            </ol>
          </div>
        </Card>
      </div>
    </main>
  );
};
