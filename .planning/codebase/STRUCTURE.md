# Codebase Structure

**Analysis Date:** 2026-02-28

## Directory Layout

```
imposter_game/
├── apps/
│   ├── server/                          # Backend: Socket.IO server + game logic
│   │   └── src/
│   │       ├── application/
│   │       │   ├── usecases/           # Use case orchestrators
│   │       │   └── __tests__/          # Use case tests
│   │       ├── infrastructure/
│   │       │   ├── socketServer.ts     # Socket.IO server setup
│   │       │   ├── socketHandlers.ts   # Event handlers
│   │       │   └── model/
│   │       │       ├── GameStateRepository.ts        # Interface
│   │       │       └── RedisGameStateRepository.ts   # Implementation
│   │       ├── utils/                  # Game rules (domain logic)
│   │       │   ├── gameRules.ts
│   │       │   ├── resetGameState.ts
│   │       │   ├── resolvePlayerName.ts
│   │       │   └── __tests__/
│   │       └── index.ts                # Entry point
│   │
│   └── web/                             # Frontend: React + Tailwind
│       └── src/
│           ├── main.tsx                # React entry point
│           ├── data/                   # Gateway/Infrastructure adapters
│           │   ├── GameGateway.ts      # Interface
│           │   ├── socketGateway.ts    # Socket.IO implementation
│           │   └── i18nSetup.ts
│           ├── domain/                 # Business logic & selectors
│           │   ├── hooks/
│           │   │   └── useGatewayEvents.ts    # Central event listener
│           │   ├── usecases/           # Thin orchestrators
│           │   │   ├── JoinRoom.ts
│           │   │   ├── PreviewRoom.ts
│           │   │   ├── SubmitVote.ts
│           │   │   ├── SubmitStatement.ts
│           │   │   ├── ShareLink.ts
│           │   │   └── HandlePhaseUpdate.ts
│           │   ├── utils/
│           │   │   ├── gameSelectors.ts       # Derived state functions
│           │   │   ├── parseWordPairs.ts
│           │   │   ├── wordPairBank.ts
│           │   │   └── useLocale.ts
│           │   └── __tests__/
│           └── presentation/           # React UI components
│               ├── App.tsx             # Root component
│               ├── design-system/      # Design tokens
│               ├── game/               # In-game screens
│               ├── lobby/              # Room creation/join
│               ├── voting/             # Voting interface
│               ├── word-reveal/        # Word reveal popup
│               ├── game-over/          # End game screens
│               ├── round/              # Round description
│               ├── shared/             # Shared UI components
│               ├── styles/             # CSS files
│               ├── locales/            # i18n translations
│               └── index.css
│
├── packages/
│   └── shared/                          # Shared types and enums
│       └── src/
│           ├── models/                 # GameState, Player, Vote, etc.
│           ├── enums/                  # Role, Phase, GameMode, Winner
│           ├── dto/                    # Socket event payloads
│           └── index.ts                # Barrel export
│
└── .planning/
    └── codebase/                        # Planning documents
```

## Directory Purposes

**`apps/server/src/application/usecases/`:**
- Purpose: Application layer - orchestrate domain logic
- Contains: Use case classes (CreateRoom, StartGame, SubmitVote, etc.)
- Each file: One use case class with constructor-injected repository
- Pattern: Class with `execute(input): Promise<output>`
- Key files: `CreateRoomUseCase.ts`, `StartGameUseCase.ts`, `SubmitVoteUseCase.ts`, `EliminatePlayerUseCase.ts`

**`apps/server/src/application/__tests__/`:**
- Purpose: Unit tests for use cases
- Contains: Test files for each use case
- Naming: `{UseCaseName}.test.ts`

**`apps/server/src/infrastructure/`:**
- Purpose: Concrete implementations of abstractions (repositories, frameworks)
- Contains: Socket.IO setup, event handlers, Redis repository implementation
- Key files: `socketServer.ts` (bootstrap), `socketHandlers.ts` (event routing), `RedisGameStateRepository.ts`

**`apps/server/src/utils/`:**
- Purpose: Domain layer - pure game rules and utilities
- Contains: Game logic functions (no framework dependencies)
- Key files: `gameRules.ts` (largest file, contains all rule implementations), `resetGameState.ts`
- Pattern: Pure functions that modify GameState or return derived values

**`apps/web/src/data/`:**
- Purpose: Infrastructure/adapter layer for client
- Contains: Gateway interface and Socket.IO implementation
- Key files: `GameGateway.ts` (interface), `socketGateway.ts` (implementation), `i18nSetup.ts`
- Pattern: Implements GameGateway interface with event registration and emission

**`apps/web/src/domain/`:**
- Purpose: Business logic and derived state selectors
- Contains: Use cases, hooks, utilities
- Structure:
  - `usecases/`: Thin orchestrators that call gateway methods (pattern: `execute()` calls gateway)
  - `hooks/useGatewayEvents.ts`: Registers all gateway event listeners in useEffect, updates state
  - `utils/gameSelectors.ts`: Pure projection functions (getViewer, alivePlayers, etc.)
  - `utils/wordPairBank.ts`: Word pair generation logic
- Pattern: No state management framework; uses React hooks + callback props

**`apps/web/src/presentation/`:**
- Purpose: React components and UI styling
- Contains: Component tree organized by feature
- Structure:
  - `App.tsx`: Root component managing session state and phase-based rendering
  - Feature directories (game/, lobby/, voting/, etc.): Feature-specific components
  - `design-system/`: Color tokens and design constants
  - `shared/`: Reusable UI components
  - `styles/`: CSS files for layout, theme, responsive design

**`packages/shared/src/models/`:**
- Purpose: Shared type definitions
- Contains: GameState, Player, Vote, WordPair, GameSettings interfaces
- Key files: `GameState.ts` (root aggregate), `Player.ts`, `Vote.ts`, `WordPair.ts`

**`packages/shared/src/enums/`:**
- Purpose: Shared enumeration values
- Contains: Role (CITIZEN, SPY, WHITE), Phase (GAME_CREATION, ROUND_DESCRIPTION, etc.), GameMode, Winner
- Pattern: Each enum in separate file for easy importing

**`packages/shared/src/dto/`:**
- Purpose: Socket.IO event payload types
- Contains: Request/response types (CreateRoomRequest, JoinRoomResponse, StateUpdatePayload, etc.)
- File: `socket.ts` - all Socket.IO types and event definitions

## Key File Locations

**Entry Points:**
- `apps/server/src/index.ts`: Server startup - loads env, creates Redis, bootstraps Socket server
- `apps/web/src/main.tsx`: React entry - initializes i18n, mounts App component
- `apps/server/src/infrastructure/socketServer.ts`: Socket.IO initialization, dependency injection setup

**Configuration:**
- Root: `package.json` (monorepo workspaces), `tsconfig.base.json`
- Server: `apps/server/package.json`, `tsconfig.json`, `jest.config.js`
- Web: `apps/web/package.json`, `vite.config.ts`, `tailwind.config.ts`

**Core Game Logic:**
- `apps/server/src/utils/gameRules.ts`: All game rule functions (assignRoles, resolveVoting, evaluateWinner, etc.)
- `apps/web/src/domain/utils/gameSelectors.ts`: Game state projection (getViewer, alivePlayers, etc.)

**UI/Presentation:**
- `apps/web/src/presentation/App.tsx`: Root React component (~235 lines)
- `apps/web/src/presentation/game/GameScreen.tsx`: Main game interface
- `apps/web/src/presentation/lobby/LobbyScreen.tsx`: Create/join room screen
- `apps/web/src/presentation/game-over/GameOverModal.tsx`: End game screen

**Event Handling:**
- `apps/server/src/infrastructure/socketHandlers.ts`: Server-side event listener registration and broadcast
- `apps/web/src/domain/hooks/useGatewayEvents.ts`: Client-side event listener registration (~160 lines)

**Gateway/Communication:**
- `apps/web/src/data/GameGateway.ts`: Interface definition for server communication contract
- `apps/web/src/data/socketGateway.ts`: Socket.IO client implementation

## Naming Conventions

**Files:**
- Use case files: `{UseCaseName}UseCase.ts` (e.g., `CreateRoomUseCase.ts`, `SubmitVoteUseCase.ts`)
- Component files: `{ComponentName}.tsx` (PascalCase, e.g., `GameScreen.tsx`, `LobbyScreen.tsx`)
- Utility files: `{functionName}.ts` (camelCase, e.g., `gameRules.ts`, `gameSelectors.ts`)
- Hook files: `use{HookName}.ts` (e.g., `useGatewayEvents.ts`, `useLocale.ts`)
- Test files: `{TargetName}.test.ts` or `.spec.ts`

**Directories:**
- Feature directories: lowercase hyphenated (e.g., `game-over/`, `word-reveal/`, `round/`)
- Layer directories: lowercase (e.g., `application/`, `infrastructure/`, `domain/`)
- Subdirectories: lowercase (e.g., `usecases/`, `utils/`, `hooks/`)

**Functions/Variables:**
- camelCase (e.g., `assignRoles`, `getViewer`, `sanitizeGameStateForViewer`, `playerId`)
- Private class methods: `#privateMethod()` or `private privateMethod()`

**Types/Interfaces:**
- PascalCase (e.g., `GameState`, `Player`, `GameGateway`, `GameStateRepository`)
- Enums: PascalCase with UPPER_SNAKE_CASE values (e.g., `Phase.GAME_CREATION`, `Role.CITIZEN`)

## Where to Add New Code

**New Feature (e.g., Power-up System):**
- Server logic: Create new use case in `apps/server/src/application/usecases/PowerUpUseCase.ts`
- Game rules: Add helper functions to `apps/server/src/utils/gameRules.ts`
- Client orchestration: Add use case in `apps/web/src/domain/usecases/UsePowerUp.ts`
- UI component: Create new directory `apps/web/src/presentation/power-up/PowerUpPanel.tsx`
- Shared types: Add to `packages/shared/src/models/` or `packages/shared/src/dto/`

**New Component:**
- Implementation: `apps/web/src/presentation/{feature}/{ComponentName}.tsx`
- Logic: Call functions from `apps/web/src/domain/` (use cases, selectors)
- Styling: Add CSS to `apps/web/src/presentation/styles/` or co-locate in component file

**New Game Rule:**
- Add pure function to `apps/server/src/utils/gameRules.ts`
- Import and call from relevant use case
- Add unit test to `apps/server/src/utils/__tests__/gameRules.test.ts`
- Update TypeScript types in `packages/shared/src/models/GameState.ts` if needed

**New Shared Type:**
- Interface: `packages/shared/src/models/{TypeName}.ts`
- Enum: `packages/shared/src/enums/{EnumName}.ts`
- Socket DTO: Add to `packages/shared/src/dto/socket.ts`
- Export from `packages/shared/src/index.ts`

**Utilities/Helpers:**
- Server domain utility: `apps/server/src/utils/{helperName}.ts`
- Client selector/utility: `apps/web/src/domain/utils/{helperName}.ts`
- Shared utility: `packages/shared/src/` (if multi-use)

## Special Directories

**`apps/server/src/application/__tests__/`:**
- Purpose: Unit tests for use cases
- Generated: No (manually written)
- Committed: Yes (essential for game logic verification)

**`apps/web/src/domain/__tests__/`:**
- Purpose: Unit tests for selectors and utilities
- Generated: No
- Committed: Yes

**`apps/web/src/presentation/design-system/`:**
- Purpose: Design tokens and visual constants
- Key file: `AppColor.ts` (single source of truth for colors)
- Generated: No
- Committed: Yes

**`apps/web/src/presentation/styles/`:**
- Purpose: Global and layout CSS
- Files: theme.css, layout.css, components.css, responsive.css, etc.
- Generated: No
- Committed: Yes

**`apps/web/src/presentation/locales/`:**
- Purpose: i18n translation files
- Generated: No (manual translations)
- Committed: Yes

**`apps/{server,web}/dist/`:**
- Purpose: Compiled output (TypeScript → JavaScript)
- Generated: Yes (from `npm run build`)
- Committed: No (.gitignored)

**`node_modules/`, `yarn.lock`:**
- Purpose: Installed dependencies
- Generated: Yes (from `yarn install`)
- Committed: yarn.lock is committed; node_modules is .gitignored

---

*Structure analysis: 2026-02-28*
