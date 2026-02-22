# Host-Controlled UX Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chuyển game về mô hình host-controlled: host nhập statement hộ người đang đến lượt, host vote/chốt kết quả thay vì mọi người tự vote; non-host chỉ quan sát; thêm retry socket 30s phía client; sửa locale mặc định sang `vi`; sửa thứ tự language switcher VI → EN → KO; thêm luồng reveal role cá nhân trước khi Game Over modal.

**Architecture:**
- Server: bổ sung `isHost` guard vào `SubmitStatementUseCase` và `SubmitVoteUseCase`; `canSubmitStatement` vẫn check turn-based speaker nhưng **người gọi phải là host**; `resolveVoting` giữ nguyên logic nhưng chỉ host mới được emit `vote:submit`.
- Frontend: tách `hostActions` (form statement, vote panel) khỏi `viewerInfo` (read-only state); bổ sung disconnect/reconnect handlers vào `SocketGateway` với timeout 30s; thêm `RoleRevealPopup` phase cuối game; sửa i18n default + language order.
- Shared: không cần thay đổi types.

**Tech Stack:** TypeScript, Socket.IO, React, i18next, Vitest

---

## Task 1: Guard `isHost` trong `SubmitStatementUseCase` (server)

**Files:**
- Modify: `apps/server/src/application/usecases/SubmitStatementUseCase.ts`
- Modify: `apps/server/src/domain/gameRules.ts` (cập nhật `canSubmitStatement`)
- Test: `apps/server/src/application/__tests__/SubmitStatementUseCase.test.ts` (tạo mới)

**Step 1: Viết failing test**

Tạo file `apps/server/src/application/__tests__/SubmitStatementUseCase.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { GameMode, GameState, Phase, Winner } from "@imposter/shared";
import { GameStateRepository } from "../model/GameStateRepository";
import { SubmitStatementUseCase } from "../usecases/SubmitStatementUseCase";

class InMemoryRepo implements GameStateRepository {
  private store = new Map<string, GameState>();
  async getByRoomId(roomId: string) { return this.store.get(roomId) ?? null; }
  async save(gameState: GameState) { this.store.set(gameState.roomId, gameState); }
  async touch(_roomId: string) {}
}

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  roomId: "R1", hostPlayerId: "host",
  phase: Phase.ROUND_DESCRIPTION,
  players: [
    { id: "host", name: "Host", isHost: true, isAlive: true, joinedAt: 1, role: null, word: null, statement: null, votedFor: null },
    { id: "p2",   name: "Bob",  isHost: false, isAlive: true, joinedAt: 2, role: null, word: null, statement: null, votedFor: null },
  ],
  round: 1, activeWordPair: null,
  speakingOrder: ["p2"], pendingSpeakerIds: ["p2"],
  votes: [], voteRound: 1, firstRoundTopTargetIds: [],
  eliminatedPlayerId: null, winner: Winner.NONE, winnerReason: null,
  settings: { mode: GameMode.CLASSIC, whiteEnabled: false, wordPairs: [] },
  createdAt: 1, updatedAt: 1,
  ...overrides,
});

describe("SubmitStatementUseCase – host authorization", () => {
  test("host can submit statement on behalf of current speaker", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState());
    const useCase = new SubmitStatementUseCase(repo);
    const result = await useCase.execute({ roomId: "R1", playerId: "host", targetSpeakerId: "p2", statement: "hello" });
    const p2 = result.players.find(p => p.id === "p2");
    expect(p2?.statement).toBe("hello");
  });

  test("non-host cannot submit statement", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState());
    const useCase = new SubmitStatementUseCase(repo);
    await expect(
      useCase.execute({ roomId: "R1", playerId: "p2", targetSpeakerId: "p2", statement: "hello" })
    ).rejects.toThrow("Only host can submit statements");
  });

  test("host cannot submit for a player who is not the current speaker", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeState({ pendingSpeakerIds: ["p2"] }));
    const useCase = new SubmitStatementUseCase(repo);
    await expect(
      useCase.execute({ roomId: "R1", playerId: "host", targetSpeakerId: "host", statement: "hello" })
    ).rejects.toThrow("Not your speaking turn");
  });
});
```

**Step 2: Chạy test để xác nhận FAIL**

```bash
yarn workspace @imposter/server test --run apps/server/src/application/__tests__/SubmitStatementUseCase.test.ts
```

Expected: FAIL – `targetSpeakerId` không tồn tại trong `Input`.

**Step 3: Cập nhật `SubmitStatementUseCase.ts`**

Thay toàn bộ nội dung file:

```typescript
import { canSubmitStatement, markStatementSubmitted } from "../../domain/gameRules";
import { GameStateRepository } from "../model/GameStateRepository";

interface Input {
  roomId: string;
  playerId: string;        // phải là host
  targetSpeakerId: string; // player đang đến lượt nói
  statement: string;
}

export class SubmitStatementUseCase {
  constructor(private readonly repository: GameStateRepository) {}

  async execute(input: Input) {
    const gameState = await this.repository.getByRoomId(input.roomId);
    if (!gameState) throw new Error("Room not found");

    if (gameState.hostPlayerId !== input.playerId) {
      throw new Error("Only host can submit statements");
    }

    if (!canSubmitStatement(gameState, input.targetSpeakerId)) {
      throw new Error("Not your speaking turn");
    }

    markStatementSubmitted(gameState, input.targetSpeakerId, input.statement);
    gameState.updatedAt = Date.now();
    await this.repository.save(gameState);
    return gameState;
  }
}
```

**Step 4: Chạy lại test**

```bash
yarn workspace @imposter/server test --run apps/server/src/application/__tests__/SubmitStatementUseCase.test.ts
```

Expected: PASS (3 tests).

**Step 5: Cập nhật shared type `SubmitStatementRequest`**

Mở file `packages/shared/src/index.ts` (hoặc nơi định nghĩa `SubmitStatementRequest`), tìm interface và thêm field:

```typescript
export interface SubmitStatementRequest {
  roomId: string;
  playerId: string;
  targetSpeakerId: string; // thêm mới
  statement: string;
}
```

> **Lưu ý:** Sau bước này TypeScript sẽ báo lỗi ở các nơi gọi `submitStatement(...)` trên client – sẽ fix ở Task 4.

**Step 6: Commit**

```bash
git add apps/server/src/application/usecases/SubmitStatementUseCase.ts \
        apps/server/src/application/__tests__/SubmitStatementUseCase.test.ts \
        packages/shared/src/index.ts
git commit -m "feat(server): host-only submit statement with targetSpeakerId"
```

---

## Task 2: Guard `isHost` trong `SubmitVoteUseCase` (server)

**Files:**
- Modify: `apps/server/src/application/usecases/SubmitVoteUseCase.ts`
- Test: `apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts` (tạo mới)

**Step 1: Viết failing test**

Tạo file `apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts`:

```typescript
import { describe, expect, test } from "vitest";
import { GameMode, GameState, Phase, Role, Winner } from "@imposter/shared";
import { GameStateRepository } from "../model/GameStateRepository";
import { SubmitVoteUseCase } from "../usecases/SubmitVoteUseCase";

class InMemoryRepo implements GameStateRepository {
  private store = new Map<string, GameState>();
  async getByRoomId(roomId: string) { return this.store.get(roomId) ?? null; }
  async save(gameState: GameState) { this.store.set(gameState.roomId, gameState); }
  async touch(_roomId: string) {}
}

const makeVotingState = (): GameState => ({
  roomId: "R1", hostPlayerId: "host",
  phase: Phase.ROUND_VOTING,
  players: [
    { id: "host", name: "Host", isHost: true,  isAlive: true, joinedAt: 1, role: Role.CITIZEN, word: "apple", statement: null, votedFor: null },
    { id: "p2",   name: "Bob",  isHost: false, isAlive: true, joinedAt: 2, role: Role.SPY,     word: "pear",  statement: null, votedFor: null },
    { id: "p3",   name: "Cat",  isHost: false, isAlive: true, joinedAt: 3, role: Role.CITIZEN, word: "apple", statement: null, votedFor: null },
  ],
  round: 1, activeWordPair: { citizen: "apple", spy: "pear" },
  speakingOrder: [], pendingSpeakerIds: [],
  votes: [], voteRound: 1, firstRoundTopTargetIds: [],
  eliminatedPlayerId: null, winner: Winner.NONE, winnerReason: null,
  settings: { mode: GameMode.CLASSIC, whiteEnabled: false, wordPairs: [] },
  createdAt: 1, updatedAt: 1,
});

describe("SubmitVoteUseCase – host authorization", () => {
  test("host can cast vote on behalf of all players", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeVotingState());
    const useCase = new SubmitVoteUseCase(repo);
    const { gameState } = await useCase.execute({ roomId: "R1", playerId: "host", targetPlayerId: "p2" });
    expect(gameState.votes.some(v => v.voterId === "host" && v.targetPlayerId === "p2")).toBe(true);
  });

  test("non-host cannot cast vote", async () => {
    const repo = new InMemoryRepo();
    await repo.save(makeVotingState());
    const useCase = new SubmitVoteUseCase(repo);
    await expect(
      useCase.execute({ roomId: "R1", playerId: "p2", targetPlayerId: "p3" })
    ).rejects.toThrow("Only host can submit votes");
  });
});
```

**Step 2: Chạy test để xác nhận FAIL**

```bash
yarn workspace @imposter/server test --run apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
```

Expected: FAIL – `p2` hiện tại không bị chặn.

**Step 3: Cập nhật `SubmitVoteUseCase.ts`**

Thêm guard ngay sau khi lấy `gameState`:

```typescript
// Thêm ngay sau dòng check phase
if (gameState.hostPlayerId !== input.playerId) {
  throw new Error("Only host can submit votes");
}
```

Xóa đoạn check `GameMode.HARDCORE` – cũ check `voter.role !== Role.CITIZEN`, không còn cần thiết vì chỉ host vote.

> **Lưu ý:** Giữ nguyên phần `resolveVoting` và `upsertVote`/`retractVote` logic – chỉ thay đổi authorization.

**Step 4: Chạy lại test**

```bash
yarn workspace @imposter/server test --run apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
```

Expected: PASS (2 tests).

**Step 5: Chạy toàn bộ test server để đảm bảo không regression**

```bash
yarn workspace @imposter/server test --run
```

Expected: tất cả pass.

**Step 6: Commit**

```bash
git add apps/server/src/application/usecases/SubmitVoteUseCase.ts \
        apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
git commit -m "feat(server): host-only vote submission"
```

---

## Task 3: Cập nhật `VotingPanel` – host-only controls, hiển thị tất cả players kể cả host

**Files:**
- Modify: `apps/web/src/presentation/voting/VotingPanel.tsx`
- Modify: `apps/web/src/domain/gameSelectors.ts`

**Bối cảnh:**
- Hiện tại `VotingPanel` dùng `canViewerVote` (check role CITIZEN/SPY) và filter `player.id !== playerId`.
- Mới: chỉ host thấy vote controls; non-host thấy "đang chờ host chốt"; danh sách vote hiển thị **tất cả** alive players (bao gồm host).

**Step 1: Cập nhật `gameSelectors.ts`**

Thay hàm `canViewerVote` bằng `isHostSelector` (đã có `isHost`) và xóa hàm `canViewerVote` nếu không dùng ở chỗ nào khác. Kiểm tra references trước:

```bash
grep -r "canViewerVote" apps/web/src
```

Nếu chỉ dùng ở `VotingPanel.tsx`, xóa khỏi `gameSelectors.ts` và update import ở `VotingPanel`.

**Step 2: Cập nhật `VotingPanel.tsx`**

```typescript
import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameMode, GameState, Player } from "@imposter/shared";
import { isHost } from "../../domain/gameSelectors";

interface Props {
  gameState: GameState;
  playerId: string;
  viewer: Player | undefined;
  alivePlayers: Player[];
  viewerVotedForId: string | null | undefined;
  onSubmitVote: (targetPlayerId: string | null) => void;
}

export const VotingPanel = ({
  gameState,
  playerId,
  viewer,
  alivePlayers,
  viewerVotedForId,
  onSubmitVote,
}: Props) => {
  const { t } = useTranslation();
  const viewerIsHost = isHost(gameState, playerId);
  const hasVoted = viewerVotedForId !== undefined;
  const votedForName =
    typeof viewerVotedForId === "string"
      ? alivePlayers.find((p) => p.id === viewerVotedForId)?.name
      : undefined;

  if (!viewer?.isAlive) return null;

  if (!viewerIsHost) {
    return (
      <p className="arcade-muted">{t("game.waitingForHostVote").toUpperCase()}</p>
    );
  }

  return (
    <div className="arcade-stack">
      <p className="arcade-muted">{t("game.castVote").toUpperCase()}</p>
      {hasVoted && (
        <p className="arcade-muted">
          {t("game.currentVote").toUpperCase()}:{" "}
          {votedForName ?? t("game.skip").toUpperCase()}
        </p>
      )}
      <div className="arcade-vote-grid">
        {alivePlayers.map((player) => {
          const isSelected = viewerVotedForId === player.id;
          return (
            <Button
              key={player.id}
              type="button"
              className="arcade-btn"
              onClick={() => onSubmitVote(player.id)}
              bg={isSelected ? "var(--yellow-400)" : "var(--blue-400)"}
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow={isSelected ? "var(--yellow-700)" : "var(--blue-700)"}
            >
              {player.name.toUpperCase()}
            </Button>
          );
        })}
        {gameState.settings.mode === GameMode.CLASSIC && (() => {
          const isSkipSelected = viewerVotedForId === null;
          return (
            <Button
              type="button"
              className="arcade-btn"
              onClick={() => onSubmitVote(null)}
              bg={isSkipSelected ? "var(--yellow-400)" : "var(--blue-400)"}
              textColor="var(--neutral-black)"
              borderColor="var(--neutral-black)"
              shadow={isSkipSelected ? "var(--yellow-700)" : "var(--blue-700)"}
            >
              {t("game.skip").toUpperCase()}
            </Button>
          );
        })()}
      </div>
    </div>
  );
};
```

> **Lưu ý quan trọng:** `alivePlayers` truyền vào **không filter host** nữa – sửa ở `App.tsx` (Task 4) khi truyền prop.

**Step 3: Thêm i18n key `game.waitingForHostVote`**

Thêm vào `apps/web/src/presentation/locales/vi.json`:
```json
"waitingForHostVote": "Đang chờ host chốt vote..."
```

Thêm vào `apps/web/src/presentation/locales/en.json`:
```json
"waitingForHostVote": "Waiting for host to vote..."
```

Thêm vào `apps/web/src/presentation/locales/ko.json`:
```json
"waitingForHostVote": "호스트가 투표 중입니다..."
```

**Step 4: Commit**

```bash
git add apps/web/src/presentation/voting/VotingPanel.tsx \
        apps/web/src/domain/gameSelectors.ts \
        apps/web/src/presentation/locales/vi.json \
        apps/web/src/presentation/locales/en.json \
        apps/web/src/presentation/locales/ko.json
git commit -m "feat(web): host-only vote panel, show all players including host"
```

---

## Task 4: Cập nhật `RoundActionPanel` – host nhập statement hộ speaker

**Files:**
- Modify: `apps/web/src/presentation/round/RoundActionPanel.tsx`
- Modify: `apps/web/src/application/usecases/SubmitStatement.ts`
- Modify: `apps/web/src/presentation/App.tsx` (cập nhật call site)

**Bối cảnh:**
- Hiện tại: form statement chỉ hiện khi `viewer.id === currentSpeakerId`.
- Mới: form statement chỉ hiện khi `viewerIsHost`; label hiển thị tên của `currentSpeaker`; submit gửi thêm `targetSpeakerId`.

**Step 1: Cập nhật `RoundActionPanel.tsx`**

```typescript
import { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "pixel-retroui";
import { GameState, Phase, Player } from "@imposter/shared";

interface Props {
  gameState: GameState;
  viewerHost: boolean;
  currentSpeaker: Player | undefined;
  statement: string;
  onStatementChange: (value: string) => void;
  onSubmitStatement: (event: FormEvent<HTMLFormElement>) => void;
  onStartVoting: () => void;
}

export const RoundActionPanel = ({
  gameState,
  viewerHost,
  currentSpeaker,
  statement,
  onStatementChange,
  onSubmitStatement,
  onStartVoting,
}: Props) => {
  const { t } = useTranslation();

  return (
    <>
      {viewerHost && currentSpeaker && gameState.phase === Phase.ROUND_DESCRIPTION && (
        <form className="arcade-stack" onSubmit={onSubmitStatement}>
          <label className="arcade-field">
            <span className="arcade-label">
              {t("game.statementFor").toUpperCase()}: {currentSpeaker.name.toUpperCase()}
            </span>
            <input
              className="arcade-native-input"
              placeholder={t("game.statementPlaceholder")}
              value={statement}
              onChange={(event) => onStatementChange(event.target.value)}
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
            {t("game.sendStatement").toUpperCase()}
          </Button>
        </form>
      )}

      {viewerHost && gameState.phase === Phase.ROUND_DISCUSSION && (
        <Button
          type="button"
          className="arcade-btn arcade-btn-primary"
          onClick={onStartVoting}
          bg="var(--pink-500)"
          textColor="var(--neutral-black)"
          borderColor="var(--neutral-black)"
          shadow="var(--pink-700)"
        >
          {t("game.startVoting").toUpperCase()}
        </Button>
      )}
    </>
  );
};
```

**Step 2: Thêm i18n key `game.statementFor`**

```json
// vi.json
"statementFor": "Nhập lời cho"
// en.json
"statementFor": "Statement for"
// ko.json
"statementFor": "발언 입력 대상"
```

**Step 3: Cập nhật `SubmitStatement.ts` (use case frontend)**

Tìm file `apps/web/src/application/usecases/SubmitStatement.ts` và thêm `targetSpeakerId` vào payload:

```typescript
interface Input {
  roomId: string;
  playerId: string;
  targetSpeakerId: string;
  statement: string;
}

export class SubmitStatement {
  constructor(private readonly gateway: GameGateway) {}

  execute(input: Input) {
    this.gateway.submitStatement({
      roomId: input.roomId,
      playerId: input.playerId,
      targetSpeakerId: input.targetSpeakerId,
      statement: input.statement,
    });
  }
}
```

**Step 4: Cập nhật `ActionBoard.tsx` – truyền `currentSpeaker` thay vì `viewer`/`playerId`**

Trong `ActionBoard.tsx`, tìm nơi render `<RoundActionPanel>` và cập nhật props theo interface mới (bỏ `playerId`, `viewer`; thêm `currentSpeaker`).

**Step 5: Cập nhật `App.tsx`**

1. Hàm `submitStatement`: thêm `targetSpeakerId` = `gameState.pendingSpeakerIds[0]`.
2. Khi truyền `alivePlayers` vào `ActionBoard` → `VotingPanel`: **không filter host** – truyền toàn bộ `alive` array.

```typescript
// Trong hàm submitStatement:
const submitStatement = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (!roomId || !playerId || !gameState) return;
  const targetSpeakerId = gameState.pendingSpeakerIds[0];
  if (!targetSpeakerId) return;
  submitStatementUseCase.execute({ roomId, playerId, targetSpeakerId, statement });
  setStatement("");
};
```

**Step 6: Commit**

```bash
git add apps/web/src/presentation/round/RoundActionPanel.tsx \
        apps/web/src/application/usecases/SubmitStatement.ts \
        apps/web/src/presentation/game/ActionBoard.tsx \
        apps/web/src/presentation/App.tsx \
        apps/web/src/presentation/locales/vi.json \
        apps/web/src/presentation/locales/en.json \
        apps/web/src/presentation/locales/ko.json
git commit -m "feat(web): host enters statement on behalf of current speaker"
```

---

## Task 5: Sửa locale mặc định và thứ tự language switcher

**Files:**
- Modify: `apps/web/src/infrastructure/i18nSetup.ts`
- Modify: `apps/web/src/presentation/shared/LanguageSwitcher.tsx`
- Test: `apps/web/src/domain/__tests__/i18nDefaults.test.ts` (tạo mới)

**Step 1: Viết failing test**

```typescript
// apps/web/src/domain/__tests__/i18nDefaults.test.ts
import { describe, test, expect, beforeEach } from "vitest";

describe("i18n defaults", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("fallback locale is vi when no saved preference", () => {
    const saved = localStorage.getItem("imposter_locale");
    const resolved = saved ?? "vi";
    expect(resolved).toBe("vi");
  });

  test("language switcher order is VI, EN, KO", () => {
    const LOCALE_OPTIONS = [
      { value: "vi", label: "VI" },
      { value: "en", label: "EN" },
      { value: "ko", label: "KO" },
    ];
    expect(LOCALE_OPTIONS[0].value).toBe("vi");
    expect(LOCALE_OPTIONS[1].value).toBe("en");
    expect(LOCALE_OPTIONS[2].value).toBe("ko");
  });
});
```

**Step 2: Chạy test**

```bash
yarn workspace @imposter/web test --run apps/web/src/domain/__tests__/i18nDefaults.test.ts
```

Expected: FAIL test 1 (vì code hiện tại fallback `"en"`).

**Step 3: Sửa `i18nSetup.ts`**

Dòng:
```typescript
const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) ?? "en";
```
Đổi thành:
```typescript
const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) ?? "vi";
```

Và:
```typescript
fallbackLng: "en",
```
Đổi thành:
```typescript
fallbackLng: "vi",
```

**Step 4: Sửa `LanguageSwitcher.tsx`**

```typescript
const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "vi", label: "VI" },
  { value: "en", label: "EN" },
  { value: "ko", label: "KO" },
];
```

**Step 5: Chạy lại test**

```bash
yarn workspace @imposter/web test --run apps/web/src/domain/__tests__/i18nDefaults.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add apps/web/src/infrastructure/i18nSetup.ts \
        apps/web/src/presentation/shared/LanguageSwitcher.tsx \
        apps/web/src/domain/__tests__/i18nDefaults.test.ts
git commit -m "feat(web): default locale vi, reorder language switcher VI > EN > KO"
```

---

## Task 6: Luồng reveal role cuối game (popup cá nhân → Game Over modal)

**Files:**
- Modify: `apps/web/src/presentation/App.tsx`
- Modify: `apps/web/src/presentation/game/GameScreen.tsx` (nếu tồn tại logic liên quan)
- Tham khảo: `apps/web/src/presentation/role-reveal/WordRevealPopup.tsx` (component đã có, dùng lại)

**Bối cảnh:**
- `WordRevealPopup` hiện dùng để reveal word khi game bắt đầu round.
- Cuối game cần: popup riêng cho từng người hiển thị **role + word của họ** → sau khi đóng popup mới hiện `GameOverModal`.
- `sanitizeGameStateForViewer` ở server **đã** trả về `role` và `word` khi `phase === GAME_ENDED` – không cần sửa server.

**Step 1: Thêm state `isRoleRevealOpen` vào `App.tsx`**

```typescript
const [isRoleRevealOpen, setIsRoleRevealOpen] = useState(false);
```

**Step 2: Trigger role reveal khi phase chuyển sang `GAME_ENDED`**

Trong handler `onStateUpdate`, sau khi `setGameState(updated.gameState)`:

```typescript
if (updated.gameState.phase === Phase.GAME_ENDED && gameState?.phase !== Phase.GAME_ENDED) {
  setIsRoleRevealOpen(true);
}
```

> Điều kiện `gameState?.phase !== Phase.GAME_ENDED` đảm bảo chỉ trigger một lần khi vừa chuyển phase, không trigger lại khi reconnect vào game đã kết thúc.

**Step 3: Cập nhật render trong `App.tsx`**

```tsx
{gameState?.phase === Phase.GAME_ENDED && isRoleRevealOpen && viewer?.word && (
  <WordRevealPopup
    word={viewer.word}
    role={viewer.role}
    onClose={() => setIsRoleRevealOpen(false)}
  />
)}

{gameState?.phase === Phase.GAME_ENDED && !isRoleRevealOpen && (
  <GameOverModal
    gameState={gameState}
    onRestart={() => gateway.resetGame({ roomId, playerId })}
  />
)}
```

> `WordRevealPopup` đã có countdown 3 giây – không cần sửa.

**Step 4: Viết test logic cho trigger**

```typescript
// apps/web/src/domain/__tests__/roleRevealTrigger.test.ts
import { describe, test, expect } from "vitest";
import { Phase } from "@imposter/shared";

const shouldTriggerRoleReveal = (newPhase: Phase, prevPhase: Phase | undefined) =>
  newPhase === Phase.GAME_ENDED && prevPhase !== Phase.GAME_ENDED;

describe("role reveal trigger", () => {
  test("triggers when transitioning to GAME_ENDED", () => {
    expect(shouldTriggerRoleReveal(Phase.GAME_ENDED, Phase.ROUND_RESULT)).toBe(true);
  });
  test("does not trigger on reconnect to already ended game", () => {
    expect(shouldTriggerRoleReveal(Phase.GAME_ENDED, Phase.GAME_ENDED)).toBe(false);
  });
  test("does not trigger on other phase transitions", () => {
    expect(shouldTriggerRoleReveal(Phase.ROUND_VOTING, Phase.ROUND_DISCUSSION)).toBe(false);
  });
});
```

**Step 5: Chạy test**

```bash
yarn workspace @imposter/web test --run apps/web/src/domain/__tests__/roleRevealTrigger.test.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add apps/web/src/presentation/App.tsx \
        apps/web/src/domain/__tests__/roleRevealTrigger.test.ts
git commit -m "feat(web): role reveal popup before game over modal on GAME_ENDED"
```

---

## Task 7: Socket retry 30s phía client khi mất kết nối

**Files:**
- Modify: `apps/web/src/infrastructure/socketGateway.ts`
- Modify: `apps/web/src/application/model/GameGateway.ts`
- Modify: `apps/web/src/presentation/App.tsx`
- Test: `apps/web/src/domain/__tests__/reconnectLogic.test.ts` (tạo mới – pure logic test)

**Bối cảnh:**
- Socket.IO **tự động retry** connect khi bị ngắt (exponential backoff).
- Cần: expose event `disconnect` và `connect` ra ngoài `SocketGateway` để `App.tsx` có thể:
  1. Hiển thị banner "Đang kết nối lại..." khi disconnect.
  2. Tự động gọi `gateway.reconnect(...)` khi socket `connect` lại.
  3. Nếu sau 30s chưa reconnect thành công → clear session (về lobby).

**Step 1: Cập nhật `GameGateway.ts` interface**

```typescript
// Thêm vào interface GameGateway:
onDisconnect(handler: () => void): void;
onReconnected(handler: () => void): void;
```

**Step 2: Implement trong `SocketGateway.ts`**

```typescript
private readonly disconnectHandlers: (() => void)[] = [];
private readonly reconnectedHandlers: (() => void)[] = [];

// Trong createSocket(), sau các handler hiện tại:
this.disconnectHandlers.forEach(h => socket.on("disconnect", h));
this.reconnectedHandlers.forEach(h => socket.on("connect", h));

// Thêm methods:
onDisconnect(handler: () => void): void {
  this.disconnectHandlers.push(handler);
  this.socket.on("disconnect", handler);
}

onReconnected(handler: () => void): void {
  this.reconnectedHandlers.push(handler);
  this.socket.on("connect", handler);
}
```

**Step 3: Thêm state và logic retry vào `App.tsx`**

```typescript
const [isReconnecting, setIsReconnecting] = useState(false);
const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Trong useEffect setup:
gateway.onDisconnect(() => {
  if (!roomId || !playerId) return; // chưa vào game, không cần retry
  setIsReconnecting(true);
  reconnectTimeoutRef.current = setTimeout(() => {
    // 30s không reconnect được → về lobby
    clearSessionState();
    setIsReconnecting(false);
  }, 30_000);
});

gateway.onReconnected(() => {
  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    reconnectTimeoutRef.current = null;
  }
  const storedRoomId = localStorage.getItem("roomId");
  const storedPlayerId = localStorage.getItem("playerId");
  if (storedRoomId && storedPlayerId) {
    gateway.reconnect({ roomId: storedRoomId, playerId: storedPlayerId });
  }
  setIsReconnecting(false);
});
```

**Step 4: Hiển thị banner reconnecting**

Thêm vào render (trước `<LanguageSwitcher />`):

```tsx
{isReconnecting && (
  <div className="arcade-reconnect-banner" role="status" aria-live="polite">
    {t("app.reconnecting")}
  </div>
)}
```

Thêm i18n key:
```json
// vi.json
"reconnecting": "Đang kết nối lại..."
// en.json
"reconnecting": "Reconnecting..."
// ko.json
"reconnecting": "재연결 중..."
```

**Step 5: Viết test pure logic**

```typescript
// apps/web/src/domain/__tests__/reconnectLogic.test.ts
import { describe, test, expect, vi } from "vitest";

const createReconnectManager = (timeoutMs: number, onTimeout: () => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    onDisconnect() {
      timer = setTimeout(onTimeout, timeoutMs);
    },
    onReconnected() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
    getTimer() { return timer; },
  };
};

describe("reconnect logic", () => {
  test("clears timeout on successful reconnect", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const manager = createReconnectManager(30_000, onTimeout);
    manager.onDisconnect();
    manager.onReconnected();
    vi.advanceTimersByTime(30_000);
    expect(onTimeout).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test("calls onTimeout after 30s without reconnect", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const manager = createReconnectManager(30_000, onTimeout);
    manager.onDisconnect();
    vi.advanceTimersByTime(30_000);
    expect(onTimeout).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
```

**Step 6: Chạy test**

```bash
yarn workspace @imposter/web test --run apps/web/src/domain/__tests__/reconnectLogic.test.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add apps/web/src/infrastructure/socketGateway.ts \
        apps/web/src/application/model/GameGateway.ts \
        apps/web/src/presentation/App.tsx \
        apps/web/src/domain/__tests__/reconnectLogic.test.ts \
        apps/web/src/presentation/locales/vi.json \
        apps/web/src/presentation/locales/en.json \
        apps/web/src/presentation/locales/ko.json
git commit -m "feat(web): socket disconnect detection with 30s retry timeout"
```

---

## Task 8: Kiểm tra toàn bộ, build, và final commit

**Step 1: Chạy toàn bộ test**

```bash
yarn workspace @imposter/server test --run
yarn workspace @imposter/web test --run
```

Expected: tất cả PASS, không có test bị skip hoặc fail.

**Step 2: Build**

```bash
yarn workspace @imposter/web build
yarn workspace @imposter/server build
```

Expected: không có TypeScript error.

**Step 3: Kiểm tra file size**

```bash
find apps packages -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
```

Expected: không file nào > 300 dòng (ngoại trừ các file được miễn).

**Step 4: Commit cuối**

```bash
git add .
git commit -m "chore: all tests pass, build clean for host-controlled UX update"
```
