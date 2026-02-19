import { FormEvent } from "react";
import { Button, Card } from "pixel-retroui";
import { GameMode, GameState, Phase, Player } from "@imposter/shared";
import { canViewerVote, isHost } from "../domain/gameSelectors";
import { phaseGuide, phaseTone } from "./phasePresentation";
import { WordRevealPopup } from "./WordRevealPopup";
interface Props {
  roomId: string;
  playerId: string;
  gameState: GameState;
  error: string;
  copied: boolean;
  shareCopied: boolean;
  isWordPopupOpen: boolean;
  statement: string;
  alivePlayers: Player[];
  viewer: Player | undefined;
  viewerVotedForName: string | undefined;
  onCopyRoomCode: () => Promise<void>;
  onShareGame: () => Promise<void>;
  onCloseWordPopup: () => void;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  onStartVoting: () => void;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const GameScreen = ({
  playerId,
  gameState,
  error,
  copied,
  shareCopied,
  isWordPopupOpen,
  statement,
  alivePlayers,
  viewer,
  viewerVotedForName,
  onCopyRoomCode,
  onShareGame,
  onCloseWordPopup,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onStartVoting,
  onSubmitVote
}: Props) => {
  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const currentSpeakerName = currentSpeakerId
    ? gameState.players.find((player) => player.id === currentSpeakerId)?.name ?? "UNKNOWN"
    : "COMPLETED";
  const viewerHost = isHost(gameState, playerId);
  return (
    <>
      {isWordPopupOpen && viewer?.word && <WordRevealPopup word={viewer.word} role={viewer.role} onClose={onCloseWordPopup} />}
      <main className="arcade-screen">
        <Card
          className="arcade-card arcade-head"
          bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
          textColor="var(--neutral-white)"
          borderColor="var(--blue-500)"
          shadowColor="var(--blue-900)"
        >
          <div className="arcade-head-main">
            <p className="arcade-kicker">ROOM CODE</p>
            <h1 className="arcade-room-id">{gameState.roomId}</h1>
          </div>
          <div className="arcade-head-actions">
            <Button
              type="button"
              className="arcade-btn"
              onClick={onCopyRoomCode}
              bg="var(--blue-400)"
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow="var(--blue-700)"
            >
              {copied ? "CODE COPIED" : "COPY CODE"}
            </Button>
            {viewerHost && gameState.phase === Phase.WAITING_FOR_PLAYERS && (
              <Button
                type="button"
                className="arcade-btn"
                onClick={onShareGame}
                bg="var(--pink-500)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--pink-700)"
              >
                {shareCopied ? "LINK COPIED" : "SHARE ROOM"}
              </Button>
            )}
            <p className={`arcade-phase-tag ${phaseTone[gameState.phase]}`}>PHASE: {gameState.phase}</p>
            {gameState.phase === Phase.GAME_ENDED && <p className="arcade-phase-tag text-phase-over">WINNER: {gameState.winner}</p>}
          </div>
        </Card>

        {error && <p className="arcade-error" role="alert" aria-live="polite">{error}</p>}
        <div className="arcade-grid arcade-grid-game">
          <Card
            className="arcade-card"
            bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
            textColor="var(--neutral-white)"
            borderColor="var(--blue-500)"
            shadowColor="var(--blue-900)"
          >
            <div className="arcade-stack">
              <h2 className="arcade-panel-title">YOU</h2>
              {viewer ? (
                <dl className="arcade-dl">
                  <div>
                    <dt>ROLE</dt>
                    <dd>{viewer.role ?? "HIDDEN"}</dd>
                  </div>
                  <div>
                    <dt>NAME</dt>
                    <dd>{viewer.name}</dd>
                  </div>
                  <div>
                    <dt>WORD</dt>
                    <dd>{viewer.word ?? "LOCKED"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="arcade-muted">VIEWER STATE UNAVAILABLE.</p>
              )}
            </div>
          </Card>
          <Card
            className="arcade-card"
            bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
            textColor="var(--neutral-white)"
            borderColor="var(--blue-500)"
            shadowColor="var(--blue-900)"
          >
            <div className="arcade-stack">
              <div className="arcade-inline-head">
                <h2 className="arcade-panel-title">PLAYERS</h2>
                <p className="arcade-counter">ALIVE {alivePlayers.length}</p>
              </div>
              <ul className="arcade-player-list">
                {gameState.players.map((player) => (
                  <li key={player.id} className="arcade-player-item">
                    <p className="arcade-player-name">{player.name}</p>
                    <p className={player.isAlive ? "arcade-alive" : "arcade-out"}>{player.isAlive ? "ALIVE" : "OUT"}</p>
                    <p className="arcade-muted">STATEMENT: {player.statement ?? "-"}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
        <Card
          className="arcade-card"
          bg="color-mix(in srgb, var(--surface-primary) 90%, var(--blue-900))"
          textColor="var(--neutral-white)"
          borderColor="var(--blue-500)"
          shadowColor="var(--blue-900)"
        >
          <section className="arcade-stack">
            <h2 className="arcade-panel-title">ACTION BOARD</h2>
            <div className="arcade-status-box">
              <p className="arcade-kicker">NEXT MOVE</p>
              <p className="arcade-guide-title">{phaseGuide[gameState.phase].title.toUpperCase()}</p>
              <p className="arcade-muted">{phaseGuide[gameState.phase].description.toUpperCase()}</p>
              {gameState.phase === Phase.ROUND_DESCRIPTION && <p className="arcade-muted">SPEAKER: {currentSpeakerName}</p>}
              {gameState.phase === Phase.ROUND_VOTING && <p className="arcade-muted">VOTE ROUND: {gameState.voteRound}</p>}
            </div>
            {viewerHost &&
              (gameState.phase === Phase.WAITING_FOR_PLAYERS || gameState.phase === Phase.GAME_CREATION) && (
                <Button
                  type="button"
                  className="arcade-btn arcade-btn-primary"
                  onClick={onStartGame}
                  bg="var(--yellow-400)"
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow="var(--yellow-700)"
                >
                  START GAME
                </Button>
              )}
            {viewerHost && (
              <Button
                type="button"
                className="arcade-btn"
                onClick={onResetGame}
                bg="var(--red-400)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--red-700)"
              >
                RESET GAME
              </Button>
            )}
            {gameState.phase === Phase.ROUND_DESCRIPTION && viewer?.isAlive && currentSpeakerId === viewer.id && (
              <form className="arcade-stack" onSubmit={onSubmitStatement}>
                <label className="arcade-field">
                  <span className="arcade-label">YOUR STATEMENT</span>
                  <input
                    className="arcade-native-input"
                    placeholder="ONE LINE. NO EXACT KEYWORD."
                    value={statement}
                    onChange={(event) => onStatementChange(event.target.value)}
                    required
                  />
                </label>
                <Button
                  type="submit"
                  className="arcade-btn"
                  bg="var(--yellow-400)"
                  textColor="var(--neutral-black)"
                  borderColor="var(--neutral-black)"
                  shadow="var(--yellow-700)"
                >
                  SEND STATEMENT
                </Button>
              </form>
            )}
            {gameState.phase === Phase.ROUND_DISCUSSION && viewerHost && (
              <Button
                type="button"
                className="arcade-btn arcade-btn-primary"
                onClick={onStartVoting}
                bg="var(--pink-500)"
                textColor="var(--neutral-black)"
                borderColor="var(--neutral-black)"
                shadow="var(--pink-700)"
              >
                START VOTING
              </Button>
            )}
            {gameState.phase === Phase.ROUND_VOTING && viewer?.isAlive && (
              <div className="arcade-stack">
                {canViewerVote(gameState, viewer.id) ? (
                  <>
                    <p className="arcade-muted">CAST YOUR VOTE NOW.</p>
                    {viewerVotedForName && <p className="arcade-muted">CURRENT VOTE: {viewerVotedForName}</p>}
                    <div className="arcade-vote-grid">
                      {alivePlayers
                        .filter((player) => player.id !== playerId)
                        .map((player) => (
                          <Button
                            key={player.id}
                            type="button"
                            className="arcade-btn"
                            onClick={() => onSubmitVote(player.id)}
                            bg="var(--blue-400)"
                            textColor="var(--neutral-black)"
                            borderColor="var(--neutral-black)"
                            shadow="var(--blue-700)"
                          >
                            {player.name.toUpperCase()}
                          </Button>
                        ))}
                      {gameState.settings.mode === GameMode.CLASSIC && (
                        <Button
                          type="button"
                          className="arcade-btn"
                          onClick={() => onSubmitVote(null)}
                          bg="var(--blue-400)"
                          textColor="var(--neutral-black)"
                          borderColor="var(--neutral-black)"
                          shadow="var(--blue-700)"
                        >
                          SKIP
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="arcade-muted">IN HARDCORE, ONLY CITIZENS CAST REAL VOTES.</p>
                )}
              </div>
            )}
            {gameState.phase === Phase.GAME_ENDED && (
              <div className="arcade-status-box">
                <p className="arcade-kicker">FINAL REASON</p>
                <p className="arcade-guide-title">{(gameState.winnerReason ?? "NO REASON PROVIDED").toUpperCase()}</p>
              </div>
            )}
          </section>
        </Card>
      </main>
    </>
  );
};
