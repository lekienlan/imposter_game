import { MutableRefObject, useEffect } from 'react';
import { Phase, RoomPreviewResponse, GameState } from '@imposter/shared';
import { GameGateway } from '../model/GameGateway';
import { HandlePhaseUpdate } from '../usecases/HandlePhaseUpdate';
import { PreviewRoom } from '../usecases/PreviewRoom';
import { parseShareInvite } from '../../domain/ShareLink';

interface GatewayEventCallbacks {
  setIsLobbyLoading: (v: boolean) => void;
  setRoomId: (v: string) => void;
  setPlayerId: (v: string) => void;
  setGameState: (updater: ((prev: GameState | null) => GameState) | GameState) => void;
  setIsWordPopupOpen: (v: boolean) => void;
  setError: (v: string) => void;
  setStatement: (v: string) => void;
  setPreviewData: (v: RoomPreviewResponse | null) => void;
  setEntryMode: (v: 'CREATE_ONLY' | 'JOIN_ONLY') => void;
  setIsReconnecting: (v: boolean) => void;
  setIsDisbanded: (v: boolean) => void;
  clearSessionState: () => void;
  shownWordMarkerRef: MutableRefObject<string>;
  inviteHandledRef: MutableRefObject<boolean>;
  reconnectTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  consumeCodeParam: () => void;
}

export const useGatewayEvents = (
  gateway: GameGateway,
  handlePhaseUpdate: HandlePhaseUpdate,
  previewRoomUseCase: PreviewRoom,
  callbacks: GatewayEventCallbacks,
) => {
  const {
    setIsLobbyLoading,
    setRoomId,
    setPlayerId,
    setGameState,
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
  } = callbacks;

  useEffect(() => {
    const onRoomCreated = (payload: { roomId: string; playerId: string; gameState: GameState }) => {
      setIsLobbyLoading(false);
      setRoomId(payload.roomId);
      setPlayerId(payload.playerId);
      setGameState(payload.gameState);
      setIsWordPopupOpen(false);
      shownWordMarkerRef.current = '';
      localStorage.setItem('roomId', payload.roomId);
      localStorage.setItem('playerId', payload.playerId);
      setError('');
    };

    const onRoomJoined = (payload: { roomId: string; playerId: string; gameState: GameState }) => {
      setIsLobbyLoading(false);
      setRoomId(payload.roomId);
      setPlayerId(payload.playerId);
      setGameState(payload.gameState);
      setIsWordPopupOpen(false);
      shownWordMarkerRef.current = '';
      localStorage.setItem('roomId', payload.roomId);
      localStorage.setItem('playerId', payload.playerId);
      setError('');
    };

    gateway.onRoomCreated(onRoomCreated);
    gateway.onRoomJoined(onRoomJoined);

    gateway.onRoomPreviewed((payload) => {
      setPreviewData(payload);
      setError('');
    });

    gateway.onStateUpdate((payload) => {
      const updated = handlePhaseUpdate.execute(payload);
      const viewer = updated.gameState.players.find((p) => p.id === payload.viewerPlayerId);
      const wordMarker = viewer?.word
        ? `${payload.viewerPlayerId}:${updated.gameState.round}:${viewer.word}`
        : '';
      setRoomId(payload.gameState.roomId);
      setPlayerId(payload.viewerPlayerId);
      localStorage.setItem('roomId', payload.gameState.roomId);
      localStorage.setItem('playerId', payload.viewerPlayerId);
      setGameState(updated.gameState);
      if (wordMarker && shownWordMarkerRef.current !== wordMarker) {
        shownWordMarkerRef.current = wordMarker;
        setIsWordPopupOpen(true);
      }
      if (
        updated.gameState.phase === Phase.WAITING_FOR_PLAYERS ||
        updated.gameState.phase === Phase.GAME_CREATION
      ) {
        setStatement('');
        setIsWordPopupOpen(false);
        shownWordMarkerRef.current = '';
      }
    });

    gateway.onError((payload) => {
      setIsLobbyLoading(false);
      setError(payload.message);
    });

    gateway.onRoomDisbanded(() => {
      setIsDisbanded(true);
    });

    gateway.onDisconnect(() => {
      setIsReconnecting(true);
      reconnectTimeoutRef.current = setTimeout(() => {
        clearSessionState();
        setIsReconnecting(false);
      }, 30_000);
    });

    gateway.onReconnected(() => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      const storedRoomId = localStorage.getItem('roomId');
      const storedPlayerId = localStorage.getItem('playerId');
      if (storedRoomId && storedPlayerId) {
        gateway.reconnect({ roomId: storedRoomId, playerId: storedPlayerId });
      }
      setIsReconnecting(false);
    });

    const invite = parseShareInvite(window.location.search);
    if (invite && !inviteHandledRef.current) {
      inviteHandledRef.current = true;
      consumeCodeParam();
      clearSessionState();
      gateway.resetConnection();
      setRoomId(invite.roomId);
      setEntryMode('JOIN_ONLY');
      previewRoomUseCase.execute({ roomId: invite.roomId });
      return;
    }

    const storedRoomId = localStorage.getItem('roomId');
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedRoomId && storedPlayerId) {
      setRoomId(storedRoomId);
      setPlayerId(storedPlayerId);
      gateway.reconnect({ roomId: storedRoomId, playerId: storedPlayerId });
    }
  }, [handlePhaseUpdate, previewRoomUseCase]);
};
