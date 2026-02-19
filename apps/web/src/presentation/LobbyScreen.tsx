import { FormEvent, KeyboardEvent } from "react";
import { GameMode } from "@imposter/shared";

interface Props {
  error: string;
  name: string;
  roomId: string;
  pairsInput: string;
  mode: GameMode;
  whiteEnabled: boolean;
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
  onNameChange,
  onRoomIdChange,
  onPairsInputChange,
  onModeChange,
  onWhiteEnabledChange,
  onCreateRoom,
  onJoinRoom
}: Props) => {
  const handleModeKeyDown = (event: KeyboardEvent<HTMLDivElement>, value: GameMode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onModeChange(value);
    }
  };

  return (
    <main className="screen-wrap">
      <section className="hero-signal">
        <p className="hero-kicker">Party game for family and friends</p>
        <h1 className="hero-title">Imposter Game</h1>
        <p className="hero-subtitle">Create a room, share the code, and follow one clear step at a time.</p>
        {error && (
          <p className="error-banner" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </section>

      <div className="layout-grid">
        <form className="panel space-y-4" onSubmit={onCreateRoom}>
          <div>
            <p className="panel-eyebrow">Host flow</p>
            <h2 className="panel-title">Create Room</h2>
          </div>

          <label className="field">
            <span>Your name</span>
            <input placeholder="Type your name (optional)" value={name} onChange={(e) => onNameChange(e.target.value)} />
          </label>

          <label className="field">
            <span>Word pairs</span>
            <small className="field-help">One pair per line in the format: apple | pear</small>
            <textarea value={pairsInput} onChange={(e) => onPairsInputChange(e.target.value)} />
          </label>

          <div className="grid gap-3">
            <div className="field">
              <span>Mode</span>
              <div className="mode-picker" role="radiogroup" aria-label="Game mode">
                <div
                  role="radio"
                  tabIndex={0}
                  aria-checked={mode === GameMode.CLASSIC}
                  className={`mode-option ${mode === GameMode.CLASSIC ? "is-selected" : ""}`}
                  onClick={() => onModeChange(GameMode.CLASSIC)}
                  onKeyDown={(event) => handleModeKeyDown(event, GameMode.CLASSIC)}
                >
                  <span className="mode-option-title">CLASSIC</span>
                  <span className="mode-option-desc">Cân bằng, dễ chơi cho nhóm mới.</span>
                  <label className="white-toggle mode-option-extra">
                    <input
                      className="white-toggle-input"
                      type="checkbox"
                      checked={whiteEnabled}
                      onChange={(e) => onWhiteEnabledChange(e.target.checked)}
                    />
                    <span className={`white-toggle-track ${whiteEnabled ? "is-enabled" : ""}`} aria-hidden="true">
                      <span className="white-toggle-thumb" />
                    </span>
                    <span className="white-toggle-text">{whiteEnabled ? "White: On" : "White: Off"}</span>
                  </label>
                </div>
                <div
                  role="radio"
                  tabIndex={0}
                  aria-checked={mode === GameMode.HARDCORE}
                  className={`mode-option ${mode === GameMode.HARDCORE ? "is-selected" : ""}`}
                  onClick={() => onModeChange(GameMode.HARDCORE)}
                  onKeyDown={(event) => handleModeKeyDown(event, GameMode.HARDCORE)}
                >
                  <span className="mode-option-title">HARDCORE</span>
                  <span className="mode-option-desc">Khó hơn, ít gợi ý hơn và cần suy luận mạnh.</span>
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary w-full">Create Room</button>
        </form>

        <form className="panel space-y-4" onSubmit={onJoinRoom}>
          <div>
            <p className="panel-eyebrow">Player flow</p>
            <h2 className="panel-title">Join Room</h2>
          </div>

          <label className="field">
            <span>Room code</span>
            <input
              placeholder="ABCD"
              value={roomId}
              onChange={(e) => onRoomIdChange(e.target.value.toUpperCase())}
              maxLength={6}
              required
            />
          </label>

          <label className="field">
            <span>Your name</span>
            <input placeholder="Type your name (optional)" value={name} onChange={(e) => onNameChange(e.target.value)} />
          </label>

          <button className="btn btn-secondary w-full">Enter Room</button>
        </form>

        <section className="panel space-y-3">
          <p className="panel-eyebrow">Quick start</p>
          <h2 className="panel-title">How this game works</h2>
          <ol className="quick-list">
            <li>Everyone joins the same room code.</li>
            <li>Read your role privately.</li>
            <li>Each player gives one statement.</li>
            <li>Discuss, vote, and eliminate one player.</li>
          </ol>
        </section>
      </div>
    </main>
  );
};
