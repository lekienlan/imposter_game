import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameMode, GameState, Phase, RoomPreviewResponse } from '@imposter/shared';
import { JoinRoom } from '../domain/usecases/JoinRoom';
import { PreviewRoom } from '../domain/usecases/PreviewRoom';
import { SubmitStatement } from '../domain/usecases/SubmitStatement';
import { SubmitVote } from '../domain/usecases/SubmitVote';
import { HandlePhaseUpdate } from '../domain/usecases/HandlePhaseUpdate';
import { parseWordPairs } from '../domain/utils/parseWordPairs';
import { generateWordPairs } from '../domain/utils/wordPairBank';
import { alivePlayers, getViewer } from '../domain/utils/gameSelectors';
import { SocketGateway } from '../data/socketGateway';
import { useGatewayEvents } from '../domain/hooks/useGatewayEvents';
import { GameScreen } from './game/GameScreen';
import { GameOverModal } from './game-over/GameOverModal';
import { GameEndRoleRevealModal } from './game-over/GameEndRoleRevealModal';
import { LobbyScreen } from './lobby/LobbyScreen';
import { LanguageSwitcher } from './shared/LanguageSwitcher';
import { WordRevealPopup } from './word-reveal/WordRevealPopup';
import { RoomDisbandedBanner } from './shared/RoomDisbandedBanner';

const gateway = new SocketGateway(import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001');

type EntryMode = 'CREATE_ONLY' | 'JOIN_ONLY';

const consumeCodeParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('code')) return;
  url.searchParams.delete('code');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

export const App = () => {
  const { t, i18n } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [name, setName] = useState(() => localStorage.getItem('playerNameDraft') ?? '');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState('');
  const [statement, setStatement] = useState('');
  const [pairsInput, setPairsInput] = useState(() => generateWordPairs(i18n.language));
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [whiteEnabled, setWhiteEnabled] = useState(false);
  const [isWordPopupOpen, setIsWordPopupOpen] = useState(false);
  const [isRoleRevealOpen, setIsRoleRevealOpen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isDisbanded, setIsDisbanded] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('CREATE_ONLY');
  const [previewData, setPreviewData] = useState<RoomPreviewResponse | null>(null);
  const [isLobbyLoading, setIsLobbyLoading] = useState(false);
  const shownWordMarkerRef = useRef('');
  const inviteHandledRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const joinRoomUseCase = useMemo(() => new JoinRoom(gateway), []);
  const previewRoomUseCase = useMemo(() => new PreviewRoom(gateway), []);
  const submitStatementUseCase = useMemo(() => new SubmitStatement(gateway), []);
  const submitVoteUseCase = useMemo(() => new SubmitVote(gateway), []);
  const handlePhaseUpdate = useMemo(() => new HandlePhaseUpdate(), []);

  const previousPhaseRef = useRef<Phase | null>(null);

  useEffect(() => {
    setPairsInput(generateWordPairs(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    if (gameState?.phase === Phase.GAME_ENDED && previousPhaseRef.current !== Phase.GAME_ENDED) {
      setIsRoleRevealOpen(true);
    }
    previousPhaseRef.current = gameState?.phase ?? null;
  }, [gameState?.phase]);

  const isViewerHost = gameState?.players.find((p) => p.id === playerId)?.isHost ?? false;

  useEffect(() => {
    if (!isDisbanded) return;
    const delay = isViewerHost ? 0 : 3000;
    const timer = setTimeout(() => {
      setIsDisbanded(false);
      localStorage.removeItem('roomId');
      localStorage.removeItem('playerId');
      setRoomId('');
      setPlayerId('');
      setGameState(null);
      setStatement('');
      setIsWordPopupOpen(false);
      setIsRoleRevealOpen(false);
      shownWordMarkerRef.current = '';
    }, delay);
    return () => clearTimeout(timer);
  }, [isDisbanded, isViewerHost]);

  const clearSessionState = () => {
    localStorage.removeItem('roomId');
    localStorage.removeItem('playerId');
    setRoomId('');
    setPlayerId('');
    setGameState(null);
    setStatement('');
    setIsWordPopupOpen(false);
    setIsRoleRevealOpen(false);
    shownWordMarkerRef.current = '';
  };

  useGatewayEvents(gateway, handlePhaseUpdate, previewRoomUseCase, {
    setIsLobbyLoading,
    setRoomId,
    setPlayerId,
    setGameState: setGameState as (
      updater: ((prev: GameState | null) => GameState) | GameState,
    ) => void,
    setIsWordPopupOpen,
    setError,
    setStatement,
    setPreviewData,
    setEntryMode,
    setIsReconnecting,
    setIsDisbanded,
    clearSessionState,
    shownWordMarkerRef,
    inviteHandledRef,
    reconnectTimeoutRef,
    consumeCodeParam,
  });

  const handleNameChange = (value: string) => {
    setName(value);
    localStorage.setItem('playerNameDraft', value);
  };

  const handlePairsInputChange = (value: string) => setPairsInput(value);

  const createRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLobbyLoading(true);
    gateway.createRoom({
      playerName: name,
      settings: { mode, whiteEnabled, wordPairs: parseWordPairs(pairsInput) },
    });
  };

  const joinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLobbyLoading(true);
    joinRoomUseCase.execute({ roomId, playerName: name });
  };

  const submitStatement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId || !playerId || !gameState) return;
    const targetSpeakerId = gameState.pendingSpeakerIds[0];
    if (!targetSpeakerId) return;
    submitStatementUseCase.execute({ roomId, playerId, targetSpeakerId, statement });
    setStatement('');
  };


  if (!gameState || gameState.phase === Phase.GAME_CREATION) {
    return (
      <>
        <LanguageSwitcher />
        <LobbyScreen
          error={error}
          name={name}
          roomId={roomId}
          pairsInput={pairsInput}
          mode={mode}
          whiteEnabled={whiteEnabled}
          entryMode={entryMode}
          isLoading={isLobbyLoading}
          previewData={previewData}
          onNameChange={handleNameChange}
          onRoomIdChange={setRoomId}
          onPairsInputChange={handlePairsInputChange}
          onModeChange={setMode}
          onWhiteEnabledChange={setWhiteEnabled}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      </>
    );
  }

  const viewer = getViewer(gameState, playerId);
  const alive = alivePlayers(gameState);
  const viewerVoteEntry = gameState.votes.find((v) => v.voterId === playerId);
  const viewerVotedForId: string | null | undefined =
    viewerVoteEntry !== undefined ? viewerVoteEntry.targetPlayerId : undefined;
  return (
    <>
      <LanguageSwitcher />
      {isReconnecting && (
        <div className="arcade-reconnect-banner" role="status" aria-live="polite">
          {t('app.reconnecting')}
        </div>
      )}
      {isDisbanded && <RoomDisbandedBanner />}
      <GameScreen
        playerId={playerId}
        gameState={gameState}
        error={error}
        isWordPopupOpen={isWordPopupOpen}
        statement={statement}
        alivePlayers={alive}
        viewer={viewer}
        viewerVotedForId={viewerVotedForId}
        onCloseWordPopup={() => setIsWordPopupOpen(false)}
        onStatementChange={setStatement}
        onSubmitStatement={submitStatement}
        onStartGame={() => gateway.startGame({ roomId, playerId })}
        onResetGame={() => gateway.resetGame({ roomId, playerId })}
        onExitGame={() => gateway.disbandRoom({ roomId, playerId })}
        onStartVoting={() => gateway.startVoting({ roomId, playerId })}
        onSubmitVote={(targetPlayerId) =>
          submitVoteUseCase.execute({ roomId, playerId, targetPlayerId })
        }
      />
      {gameState?.phase === Phase.GAME_ENDED && isRoleRevealOpen && (
        <GameEndRoleRevealModal
          gameState={gameState}
          viewer={viewer}
          onClose={() => setIsRoleRevealOpen(false)}
        />
      )}
      {gameState?.phase === Phase.GAME_ENDED && !isRoleRevealOpen && (
        <GameOverModal
          gameState={gameState}
          onRestart={() => gateway.resetGame({ roomId, playerId })}
        />
      )}
    </>
  );
};
