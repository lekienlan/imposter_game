import { FormEvent } from 'react';
import { GameState, Player } from '@imposter/shared';
import { isHost } from '../../domain/gameSelectors';
import { WordRevealPopup } from '../role-reveal/WordRevealPopup';
import { PlayersPanel } from './PlayersPanel';
import { ActionBoard } from './ActionBoard';
import { ViewerCard } from './ViewerCard';

interface Props {
  roomId: string;
  playerId: string;
  gameState: GameState;
  error: string;
  copied: boolean;
  shareCopied: boolean;
  shareUrl: string;
  isWordPopupOpen: boolean;
  statement: string;
  alivePlayers: Player[];
  viewer: Player | undefined;
  viewerVotedForId: string | null | undefined;
  onCopyRoomCode: () => Promise<void>;
  onShareGame: () => void;
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
  shareUrl,
  isWordPopupOpen,
  statement,
  alivePlayers,
  viewer,
  viewerVotedForId,
  onCopyRoomCode,
  onShareGame,
  onCloseWordPopup,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onStartVoting,
  onSubmitVote,
}: Props) => {
  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const viewerHost = isHost(gameState, playerId);

  return (
    <>
      {isWordPopupOpen && viewer?.word && gameState.round === 1 && (
        <WordRevealPopup
          word={viewer.word}
          role={viewer.role}
          onClose={onCloseWordPopup}
        />
      )}
      <main className='arcade-screen'>
        <div className='arcade-grid arcade-grid-game'>
          <ActionBoard
            gameState={gameState}
            playerId={playerId}
            viewerHost={viewerHost}
            viewer={viewer}
            alivePlayers={alivePlayers}
            viewerVotedForId={viewerVotedForId}
            statement={statement}
            copied={copied}
            shareCopied={shareCopied}
            shareUrl={shareUrl}
            error={error}
            onCopyRoomCode={onCopyRoomCode}
            onShareGame={onShareGame}
            onStatementChange={onStatementChange}
            onSubmitStatement={onSubmitStatement}
            onStartGame={onStartGame}
            onResetGame={onResetGame}
            onStartVoting={onStartVoting}
            onSubmitVote={onSubmitVote}
          />
          <ViewerCard viewer={viewer} />

          <PlayersPanel
            players={gameState.players}
            aliveCount={alivePlayers.length}
            phase={gameState.phase}
            currentSpeakerId={currentSpeakerId}
          />
        </div>
      </main>
    </>
  );
};
