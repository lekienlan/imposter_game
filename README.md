# Imposter Game Monorepo

Multiplayer Undercover-style social deduction game built with React + Vite + Tailwind (web), Node + Socket.IO + Redis (server), and a shared TypeScript contract package.

## Monorepo Tree

```text
.
├── apps
│   ├── server
│   │   ├── src
│   │   │   ├── application
│   │   │   │   ├── CheckWinConditionUseCase.ts
│   │   │   │   ├── CreateRoomUseCase.ts
│   │   │   │   ├── EliminatePlayerUseCase.ts
│   │   │   │   ├── GameStateRepository.ts
│   │   │   │   ├── JoinRoomUseCase.ts
│   │   │   │   ├── ReconnectPlayerUseCase.ts
│   │   │   │   ├── StartGameUseCase.ts
│   │   │   │   ├── StartVotingUseCase.ts
│   │   │   │   ├── SubmitClueUseCase.ts
│   │   │   │   └── SubmitVoteUseCase.ts
│   │   │   ├── domain
│   │   │   │   ├── __tests__/gameRules.test.ts
│   │   │   │   └── gameRules.ts
│   │   │   ├── infrastructure
│   │   │   │   ├── RedisGameStateRepository.ts
│   │   │   │   └── socketServer.ts
│   │   │   ├── interfaces
│   │   │   │   └── socketHandlers.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web
│       ├── src
│       │   ├── application
│       │   │   ├── GameGateway.ts
│       │   │   ├── HandlePhaseUpdate.ts
│       │   │   ├── JoinRoom.ts
│       │   │   ├── SubmitClue.ts
│       │   │   └── SubmitVote.ts
│       │   ├── domain
│       │   │   └── gameSelectors.ts
│       │   ├── infrastructure
│       │   │   └── socketGateway.ts
│       │   ├── presentation
│       │   │   ├── App.tsx
│       │   │   └── index.css
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages
│   └── shared
│       ├── src
│       │   ├── dto/socket.ts
│       │   ├── enums
│       │   │   ├── Phase.ts
│       │   │   ├── Role.ts
│       │   │   └── Winner.ts
│       │   ├── models
│       │   │   ├── GameSettings.ts
│       │   │   ├── GameState.ts
│       │   │   ├── Player.ts
│       │   │   ├── Vote.ts
│       │   │   └── WordPair.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── tsconfig.base.json
└── README.md
```

## Clean Architecture Implementation

### Backend (`apps/server`)
- `domain`: pure rules (`assignRoles`, elimination tie-break, win checks, phase-related guards), no Socket.IO/Redis imports.
- `application`: explicit use cases (`CreateRoom`, `JoinRoom`, `StartGame`, `SubmitClue`, `StartVoting`, `SubmitVote`, `EliminatePlayer`, `CheckWinCondition`) plus `ReconnectPlayer`.
- `interfaces`: Socket.IO handlers only map events to use cases and send shared DTO payloads.
- `infrastructure`: Redis repository persistence (`room:{roomId}` with TTL), Socket.IO/bootstrap wiring.

### Frontend (`apps/web`)
- `domain`: UI-independent selectors (no React/socket imports).
- `application`: frontend use cases (`JoinRoom`, `SubmitClue`, `SubmitVote`, `HandlePhaseUpdate`) and `GameGateway` contract.
- `infrastructure`: Socket.IO adapter implementing gateway with shared DTOs and event names.
- `presentation`: React/Tailwind UI only, no game rule computation.

### Shared Contracts (`packages/shared`)
- Single source of truth for models, enums, and DTOs.
- Both FE and BE import directly from `@imposter/shared`.
- No duplicated model definitions in app layers.

## Game Rules Covered

- Room create/join with host + configurable role counts and word pairs.
- Server-authoritative random role + word assignment.
- Phases: `LOBBY -> REVEAL -> DESCRIPTION -> DISCUSSION -> VOTING -> ELIMINATION -> GAME_OVER`.
- Voting validation: one vote per alive player.
- Deterministic tie handling: earliest `joinedAt` among tied highest votes is eliminated.
- Win conditions:
  - Civilians win when all Undercover + Mr. White are eliminated.
  - Undercover wins on parity with civilians.
  - Mr. White wins if eliminated and correctly guesses civilian word.
- Reconnect via `roomId + playerId` restores state from Redis.

## Redis Design

- Key: `room:{roomId}`
- Value: serialized `GameState` (shared model)
- TTL: 4 hours (auto cleanup)

## Run Locally

### Prerequisites
- Node.js 20+
- Redis running locally on `redis://127.0.0.1:6379`

### Install + run

```bash
npm install
npm run dev
```

If you prefer Yarn workspaces:

```bash
yarn install
yarn dev
```

### App URLs
- Web: [http://localhost:5173](http://localhost:5173)
- Socket server: [http://localhost:3001](http://localhost:3001)

### Share game sang máy khác trong LAN (local)

Khi chạy web bằng `localhost`, link share mặc định không mở được từ máy khác.
Hãy cấu hình origin public của máy host:

```bash
VITE_SHARE_ORIGIN=http://<LAN_IP>:5173
```

Ví dụ:

```bash
VITE_SHARE_ORIGIN=http://192.168.1.23:5173
```

Sau đó host có thể bấm `Share Game` ở phase `WAITING_FOR_PLAYERS` để copy link chứa `roomId` + `hostName`.

## Notes

- All game outcomes are computed on server-side use cases/domain rules.
- Client only renders server-provided `GameState` and submits player actions.
- Domain logic is unit-testable independently (`apps/server/src/domain/__tests__/gameRules.test.ts`).
