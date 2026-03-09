import { FormEvent, useState, useRef, useEffect } from 'react';
import { GameState, Player } from '@imposter/shared';
import { isHost, isGameOver, canViewerSeeWord } from '../../domain/utils/gameSelectors';
import { WordRevealPopup } from '../word-reveal/WordRevealPopup';
import { PlayersPanel } from './PlayersPanel';
import { ActionBoard } from './ActionBoard';
import { ViewerCard } from './ViewerCard';

interface Props {
  playerId: string;
  gameState: GameState;
  error: string;
  isWordPopupOpen: boolean;
  statement: string;
  alivePlayers: Player[];
  viewer: Player | undefined;
  viewerVotedForId: string | null | undefined;
  onCloseWordPopup: () => void;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  onExitGame: () => void;
  onStartVoting: () => void;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const GameScreen = ({
  playerId,
  gameState,
  error,
  isWordPopupOpen,
  statement,
  alivePlayers,
  viewer,
  viewerVotedForId,
  onCloseWordPopup,
  onStatementChange,
  onSubmitStatement,
  onStartGame,
  onResetGame,
  onExitGame,
  onStartVoting,
  onSubmitVote,
}: Props) => {
  const [wordJustRevealed, setWordJustRevealed] = useState(false);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const currentSpeakerId = gameState.pendingSpeakerIds[0] ?? null;
  const viewerHost = isHost(gameState, playerId);
  const gameIsOver = isGameOver(gameState);
  const canSeeWord = canViewerSeeWord(viewer, gameState);

  const handleCloseWordPopup = () => {
    onCloseWordPopup();
    setWordJustRevealed(true);
    pulseTimerRef.current = setTimeout(() => setWordJustRevealed(false), 1500);
  };

  return (
    <>
      {isWordPopupOpen && viewer?.word && gameState.round === 1 && (
        <WordRevealPopup word={viewer.word} onClose={handleCloseWordPopup} />
      )}
      <main className="arcade-screen">
        <div className="arcade-grid arcade-grid-game">
          <ActionBoard
            gameState={gameState}
            playerId={playerId}
            viewerHost={viewerHost}
            viewer={viewer}
            alivePlayers={alivePlayers}
            viewerVotedForId={viewerVotedForId}
            statement={statement}
            error={error}
            onStatementChange={onStatementChange}
            onSubmitStatement={onSubmitStatement}
            onStartGame={onStartGame}
            onResetGame={onResetGame}
            onExitGame={onExitGame}
            onStartVoting={onStartVoting}
            onSubmitVote={onSubmitVote}
          />
          <ViewerCard
            viewer={viewer}
            isGameOver={gameIsOver}
            canSeeWord={canSeeWord}
            wordJustRevealed={wordJustRevealed}
          />

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
