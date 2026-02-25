import { RoomPreviewResponse } from '@imposter/shared';

interface Props {
  roomCode: string;
  previewData: RoomPreviewResponse | null;
  error: string;
}

export const RoomPreviewPanel = ({ roomCode, previewData, error }: Props) => {
  return (
    <div className="arcade-stack">
      <div>
        <p className="arcade-kicker">ROOM INFO</p>
        <p className="arcade-room-id">{roomCode}</p>
      </div>

      {error && (
        <p className="arcade-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {previewData && (
        <dl className="arcade-dl">
          <div>
            <dt>HOST</dt>
            <dd>{previewData.hostName}</dd>
          </div>
          <div>
            <dt>PHASE</dt>
            <dd>{previewData.phase}</dd>
          </div>
          <div>
            <dt>PLAYERS</dt>
            <dd>{previewData.playerCount}</dd>
          </div>
        </dl>
      )}

      {previewData && previewData.playerNames.length > 0 && (
        <div>
          <p className="arcade-label">IN THIS ROOM</p>
          <ul className="arcade-player-list">
            {previewData.playerNames.map((playerName) => (
              <li key={playerName} className="arcade-player-item">
                <p className="arcade-player-name">{playerName}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!previewData && !error && <p className="arcade-muted">LOADING ROOM INFO...</p>}
    </div>
  );
};
