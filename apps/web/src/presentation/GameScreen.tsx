import { FormEvent } from "react";
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
    ? gameState.players.find((player) => player.id === currentSpeakerId)?.name ?? "Unknown"
    : "Completed";

  return (
    <>
      {isWordPopupOpen && viewer?.word && <WordRevealPopup word={viewer.word} role={viewer.role} onClose={onCloseWordPopup} />}
      <main className="screen-wrap">
        <header className="room-head panel">
        <div>
          <p className="panel-eyebrow">Room</p>
          <h1 className="room-title">{gameState.roomId}</h1>
        </div>
        <div className="space-y-2 text-right">
          <button className="btn btn-ghost btn-sm" onClick={onCopyRoomCode}>
            {copied ? "Copied" : "Copy room code"}
          </button>
          {isHost(gameState, playerId) && gameState.phase === Phase.WAITING_FOR_PLAYERS && (
            <button className="btn btn-ghost btn-sm" onClick={onShareGame}>
              {shareCopied ? "Link copied" : "Share Game"}
            </button>
          )}
          <p className={`status-badge ${phaseTone[gameState.phase]}`}>{gameState.phase}</p>
          {gameState.phase === Phase.GAME_ENDED && <p className="status-badge text-phase-over">Winner: {gameState.winner}</p>}
        </div>
        </header>

        {error && (
          <p className="error-banner mt-4" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <div className="layout-grid game-grid">
          <section className="panel compact-panel space-y-4">
            <h2 className="panel-title">You</h2>
            {viewer ? (
              <div className="space-y-3 text-sm">
                <p className="you-role-card">
                  <span className="label">Role</span>
                  <span className="role-value">{viewer.role ?? "Hidden"}</span>
                </p>
                <p>
                  <span className="label">Name</span>
                  <span>{viewer.name}</span>
                </p>
                <p>
                  <span className="label">Keyword</span>
                  <span>{viewer.word ?? "No keyword yet"}</span>
                </p>
              </div>
            ) : (
              <p className="muted">Viewer state unavailable.</p>
            )}
          </section>

          <section className="panel players-panel space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="panel-title">Players</h2>
              <p className="alive-pill">Alive: {alivePlayers.length}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {gameState.players.map((player) => (
                <article key={player.id} className="player-card">
                  <p className="player-name">{player.name}</p>
                  <p className={`player-status ${player.isAlive ? "player-alive" : "player-out"}`}>
                    {player.isAlive ? "Alive" : "Eliminated"}
                  </p>
                  <p className="mt-2 text-xs muted">Statement: {player.statement ?? "-"}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="panel mt-4 space-y-3">
          <h2 className="panel-title">Actions</h2>
          <div className="status-block">
            <p className="panel-eyebrow">What to do now</p>
            <p className="guide-title">{phaseGuide[gameState.phase].title}</p>
            <p className="muted">{phaseGuide[gameState.phase].description}</p>
            {gameState.phase === Phase.ROUND_DESCRIPTION && <p className="muted">Current speaker: {currentSpeakerName}</p>}
            {gameState.phase === Phase.ROUND_VOTING && <p className="muted">Vote round: {gameState.voteRound}</p>}
          </div>

          {isHost(gameState, playerId) &&
            (gameState.phase === Phase.WAITING_FOR_PLAYERS || gameState.phase === Phase.GAME_CREATION) && (
            <button className="btn btn-primary" onClick={onStartGame}>
              Start Game
            </button>
            )}

          {isHost(gameState, playerId) && (
            <button className="btn btn-ghost" onClick={onResetGame}>
              Reset Game
            </button>
          )}

          {gameState.phase === Phase.ROUND_DESCRIPTION && viewer?.isAlive && currentSpeakerId === viewer.id && (
            <form className="stack" onSubmit={onSubmitStatement}>
              <label className="field">
                <span>Your statement</span>
                <input
                  placeholder="Say one sentence without the exact keyword"
                  value={statement}
                  onChange={(e) => onStatementChange(e.target.value)}
                  required
                />
              </label>
              <button className="btn btn-secondary">Send statement</button>
            </form>
          )}

          {gameState.phase === Phase.ROUND_DISCUSSION && isHost(gameState, playerId) && (
            <button className="btn btn-primary" onClick={onStartVoting}>
              Start Voting
            </button>
          )}

          {gameState.phase === Phase.ROUND_VOTING && viewer?.isAlive && (
            <div className="stack">
              {canViewerVote(gameState, viewer.id) ? (
                <>
                  <p className="muted">Cast your vote. You can change it until all required votes are in.</p>
                  {viewerVotedForName && <p className="muted">Current vote: {viewerVotedForName}</p>}
                  <div className="grid gap-2 sm:grid-cols-3">
                    {alivePlayers
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <button key={player.id} className="btn btn-ghost text-left" onClick={() => onSubmitVote(player.id)}>
                          {player.name}
                        </button>
                      ))}
                    {gameState.settings.mode === GameMode.CLASSIC && (
                      <button className="btn btn-ghost text-left" onClick={() => onSubmitVote(null)}>
                        Skip
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="muted">In HARDCORE, only citizens cast real votes.</p>
              )}
            </div>
          )}

          {gameState.phase === Phase.GAME_ENDED && (
            <div className="status-block">
              <p className="panel-eyebrow">Final reason</p>
              <p className="guide-title">{gameState.winnerReason ?? "No reason provided"}</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
};
