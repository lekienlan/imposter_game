import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { GameMode, GameState, Phase, RoomPreviewResponse } from "@imposter/shared";
import { JoinRoom } from "../application/JoinRoom";
import { PreviewRoom } from "../application/PreviewRoom";
import { SubmitStatement } from "../application/SubmitStatement";
import { SubmitVote } from "../application/SubmitVote";
import { HandlePhaseUpdate } from "../application/HandlePhaseUpdate";
import { parseWordPairs } from "../application/parseWordPairs";
import { alivePlayers, getViewer } from "../domain/gameSelectors";
import { buildShareUrl, parseShareInvite, resolveShareOrigin } from "../domain/ShareLink";
import { SocketGateway } from "../infrastructure/socketGateway";
import { GameScreen } from "./GameScreen";
import { LobbyScreen } from "./LobbyScreen";

const gateway = new SocketGateway(import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001");

type EntryMode = "CREATE_ONLY" | "JOIN_ONLY";

const consumeCodeParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("code")) {
    return;
  }
  url.searchParams.delete("code");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
};

export const App = () => {
  const [roomId, setRoomId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("playerNameDraft") ?? "");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState("");
  const [statement, setStatement] = useState("");
  const [pairsInput, setPairsInput] = useState("Apple | Pear\nDoctor | Nurse\nCat | Tiger");
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [whiteEnabled, setWhiteEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isWordPopupOpen, setIsWordPopupOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>("CREATE_ONLY");
  const [previewData, setPreviewData] = useState<RoomPreviewResponse | null>(null);
  const shownWordMarkerRef = useRef("");
  const inviteHandledRef = useRef(false);

  const joinRoomUseCase = useMemo(() => new JoinRoom(gateway), []);
  const previewRoomUseCase = useMemo(() => new PreviewRoom(gateway), []);
  const submitStatementUseCase = useMemo(() => new SubmitStatement(gateway), []);
  const submitVoteUseCase = useMemo(() => new SubmitVote(gateway), []);
  const handlePhaseUpdate = useMemo(() => new HandlePhaseUpdate(), []);

  const clearSessionState = () => {
    localStorage.removeItem("roomId");
    localStorage.removeItem("playerId");
    setRoomId("");
    setPlayerId("");
    setGameState(null);
    setStatement("");
    setIsWordPopupOpen(false);
    shownWordMarkerRef.current = "";
  };

  useEffect(() => {
    gateway.onRoomCreated((payload) => {
      setRoomId(payload.roomId);
      setPlayerId(payload.playerId);
      setGameState(payload.gameState);
      setIsWordPopupOpen(false);
      shownWordMarkerRef.current = "";
      localStorage.setItem("roomId", payload.roomId);
      localStorage.setItem("playerId", payload.playerId);
      setError("");
    });

    gateway.onRoomJoined((payload) => {
      setRoomId(payload.roomId);
      setPlayerId(payload.playerId);
      setGameState(payload.gameState);
      setIsWordPopupOpen(false);
      shownWordMarkerRef.current = "";
      localStorage.setItem("roomId", payload.roomId);
      localStorage.setItem("playerId", payload.playerId);
      setError("");
    });

    gateway.onRoomPreviewed((payload) => {
      setPreviewData(payload);
      setError("");
    });

    gateway.onStateUpdate((payload) => {
      const updated = handlePhaseUpdate.execute(payload);
      const viewer = updated.gameState.players.find((player) => player.id === payload.viewerPlayerId);
      const wordMarker = viewer?.word ? `${payload.viewerPlayerId}:${updated.gameState.round}:${viewer.word}` : "";
      setRoomId(payload.gameState.roomId);
      setPlayerId(payload.viewerPlayerId);
      localStorage.setItem("roomId", payload.gameState.roomId);
      localStorage.setItem("playerId", payload.viewerPlayerId);
      setGameState(updated.gameState);
      if (wordMarker && shownWordMarkerRef.current !== wordMarker) {
        shownWordMarkerRef.current = wordMarker;
        setIsWordPopupOpen(true);
      }
      if (updated.gameState.phase === Phase.WAITING_FOR_PLAYERS || updated.gameState.phase === Phase.GAME_CREATION) {
        setStatement("");
        setIsWordPopupOpen(false);
        shownWordMarkerRef.current = "";
      }
    });

    gateway.onError((payload) => {
      setError(payload.message);
    });

    const invite = parseShareInvite(window.location.search);
    if (invite && !inviteHandledRef.current) {
      inviteHandledRef.current = true;
      consumeCodeParam();
      clearSessionState();
      gateway.resetConnection();
      setRoomId(invite.roomId);
      setEntryMode("JOIN_ONLY");
      previewRoomUseCase.execute({ roomId: invite.roomId });
      return;
    }

    const storedRoomId = localStorage.getItem("roomId");
    const storedPlayerId = localStorage.getItem("playerId");

    if (storedRoomId && storedPlayerId) {
      setRoomId(storedRoomId);
      setPlayerId(storedPlayerId);
      gateway.reconnect({ roomId: storedRoomId, playerId: storedPlayerId });
    }
  }, [handlePhaseUpdate, joinRoomUseCase, previewRoomUseCase]);

  const handleNameChange = (value: string) => {
    setName(value);
    localStorage.setItem("playerNameDraft", value);
  };

  const createRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    gateway.createRoom({
      playerName: name,
      settings: {
        mode,
        whiteEnabled,
        wordPairs: parseWordPairs(pairsInput)
      }
    });
  };

  const joinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    joinRoomUseCase.execute({ roomId, playerName: name });
  };

  const submitStatement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roomId || !playerId) return;
    submitStatementUseCase.execute({ roomId, playerId, statement });
    setStatement("");
  };

  const copyRoomCode = async () => {
    if (!gameState) return;

    try {
      await navigator.clipboard.writeText(gameState.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const shareGame = async () => {
    if (!gameState) return;

    const { origin, error: shareOriginError } = resolveShareOrigin(
      window.location.origin,
      import.meta.env.VITE_SHARE_ORIGIN as string | undefined
    );

    if (shareOriginError) {
      setError(shareOriginError);
      setShareCopied(false);
      return;
    }

    const shareUrl = buildShareUrl(origin, gameState.roomId);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
      setError("");
    } catch {
      setShareCopied(false);
      setError("Không thể copy link share. Hãy thử lại.");
    }
  };

  if (!gameState || gameState.phase === Phase.GAME_CREATION) {
    return (
      <LobbyScreen
        error={error}
        name={name}
        roomId={roomId}
        pairsInput={pairsInput}
        mode={mode}
        whiteEnabled={whiteEnabled}
        entryMode={entryMode}
        previewData={previewData}
        onNameChange={handleNameChange}
        onRoomIdChange={setRoomId}
        onPairsInputChange={setPairsInput}
        onModeChange={setMode}
        onWhiteEnabledChange={setWhiteEnabled}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    );
  }

  const viewer = getViewer(gameState, playerId);
  const alive = alivePlayers(gameState);
  const viewerVotedForName =
    viewer?.votedFor ? gameState.players.find((player) => player.id === viewer.votedFor)?.name : undefined;

  return (
    <GameScreen
      roomId={roomId}
      playerId={playerId}
      gameState={gameState}
      error={error}
      copied={copied}
      shareCopied={shareCopied}
      isWordPopupOpen={isWordPopupOpen}
      statement={statement}
      alivePlayers={alive}
      viewer={viewer}
      viewerVotedForName={viewerVotedForName}
      onCopyRoomCode={copyRoomCode}
      onShareGame={shareGame}
      onCloseWordPopup={() => setIsWordPopupOpen(false)}
      onStatementChange={setStatement}
      onSubmitStatement={submitStatement}
      onStartGame={() => gateway.startGame({ roomId, playerId })}
      onResetGame={() => gateway.resetGame({ roomId, playerId })}
      onStartVoting={() => gateway.startVoting({ roomId, playerId })}
      onSubmitVote={(targetPlayerId) => submitVoteUseCase.execute({ roomId, playerId, targetPlayerId })}
    />
  );
};
