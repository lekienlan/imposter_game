# Architecture

**Analysis Date:** 2026-02-28

## Pattern Overview

**Overall:** Clean Architecture with Layered Design (Domain-Driven Design principles)

**Key Characteristics:**
- Clear separation of concerns across four layers: domain, application, infrastructure, presentation
- Use-case driven architecture where each use case is an isolated, composable unit
- Gateway pattern for abstracting external communications (Socket.IO, Redis)
- Repository pattern for data persistence abstraction
- Shared types across monorepo via `@imposter/shared` package

## Layers

**Domain Layer (Server):**
- Purpose: Pure game logic and rules, framework-agnostic
- Location: `apps/server/src/utils/` (gameRules.ts, resetGameState.ts)
- Contains: Game rule functions (assignRoles, resolveVoting, evaluateWinner, etc.), type definitions, business logic
- Depends on: `@imposter/shared` types only
- Used by: Application layer use cases

**Application Layer (Server):**
- Purpose: Orchestrate domain logic and coordinate use cases
- Location: `apps/server/src/application/usecases/`
- Contains: Use case classes (CreateRoomUseCase, StartGameUseCase, SubmitVoteUseCase, etc.)
- Each class: Single responsibility, follows input/output pattern
- Depends on: GameStateRepository interface, domain functions
- Used by: Socket handlers (infrastructure layer)

**Infrastructure Layer (Server):**
- Purpose: Implement concrete adapters and external integrations
- Location: `apps/server/src/infrastructure/`
  - `socketServer.ts`: HTTP/Socket.IO bootstrapping, server initialization
  - `socketHandlers.ts`: Socket event listeners and response emission
  - `model/GameStateRepository.ts`: Repository interface definition
  - `model/RedisGameStateRepository.ts`: Redis implementation of repository
- Depends on: Socket.IO, Redis, use cases
- Used by: index.ts (entry point)

**Presentation Layer (Web):**
- Purpose: Render UI and handle user interactions
- Location: `apps/web/src/presentation/`
- Contains: React components organized by feature (game, lobby, voting, word-reveal, game-over, shared)
- Depends on: Domain layer functions/selectors, data gateway interface
- Does NOT contain: Game rules, business logic, state management logic

**Data/Gateway Layer (Web):**
- Purpose: Adapter layer for server communication (acts as infrastructure)
- Location: `apps/web/src/data/`
  - `GameGateway.ts`: Interface for server communication contract
  - `socketGateway.ts`: Socket.IO client implementation
  - `i18nSetup.ts`: i18n initialization

**Domain Layer (Web):**
- Purpose: Business logic, use cases, selectors, and utilities (client-side)
- Location: `apps/web/src/domain/`
  - `usecases/`: Thin use cases that orchestrate gateway calls (JoinRoom, SubmitVote, ShareLink, etc.)
  - `hooks/useGatewayEvents.ts`: Central event listener registration and delegation
  - `utils/gameSelectors.ts`: Game state projection functions (getViewer, alivePlayers, etc.)
  - `utils/wordPairBank.ts`: Word pair generation and parsing logic

**Shared Layer:**
- Purpose: Type definitions, enums, DTOs shared across server and client
- Location: `packages/shared/src/`
  - `models/`: GameState, Player, Vote, WordPair, GameSettings
  - `enums/`: Role, Phase, GameMode, Winner
  - `dto/`: Socket.IO event payloads and request/response types

## Data Flow

**Game Creation Flow:**
1. User submits CreateRoomForm (presentation)
2. App calls `gateway.createRoom()` with payload (data layer)
3. Server receives 'room:create' event (infrastructure socket handler)
4. CreateRoomUseCase executes: calls `resolvePlayerName()`, creates GameState, saves to repository
5. broadcastState emits sanitized state to all players in room
6. Client receives 'room:created' event in useGatewayEvents hook
7. Hook updates App state (roomId, playerId, gameState)

**Game Start Flow:**
1. Host clicks start button → gateway.startGame()
2. StartGameUseCase: calls assignRoles, pickWordPair, applyRolesAndWords, beginRoundDescription
3. Phase transitions: WAITING_FOR_PLAYERS → LOBBY_READY → ROLE_DISTRIBUTION → ROUND_DESCRIPTION
4. broadcastState sends sanitized state (roles/words hidden from non-viewers)
5. sanitizeGameStateForViewer redacts player roles/words except for viewer
6. Client receives 'state:update' → HandlePhaseUpdate → App state update

**Voting Flow:**
1. User selects target player → gateway.submitVote()
2. SubmitVoteUseCase: validates phase/player, calls upsertVote() or retractVote()
3. resolveVoting() checks if all required votes submitted, determines elimination
4. If tie: sets voteRound=2 for revote, returns REVOTE status
5. If resolved: EliminatePlayerUseCase marks player dead, evaluateWinner checks win condition
6. Phase transitions: ROUND_VOTING → ROUND_RESULT → WIN_LOSE_CHECK → GAME_ENDED (or next round)
7. broadcastState updates all clients with new state

**Reconnect Flow:**
1. Client detects disconnect, starts reconnect banner
2. On reconnect: gateway.reconnect() with stored roomId/playerId
3. ReconnectPlayerUseCase retrieves game state and verifies player
4. Emits sanitized state update to reconnected player
5. Client hook cancels timeout, clears reconnect banner, restores session from localStorage

**State Management:**
- Server: Single source of truth is Redis-persisted GameState
- Client: React component state in App.tsx holds:
  - roomId, playerId (session identifiers)
  - gameState (full game state, sanitized per viewer)
  - UI-only state: isWordPopupOpen, isRoleRevealOpen, statement, error, etc.
- No Redux/Zustand: Direct use of useState + callback props
- localStorage persists roomId/playerId for reconnection

## Key Abstractions

**GameStateRepository:**
- Purpose: Abstract game state persistence
- Examples: `RedisGameStateRepository` (implementation)
- Pattern: Async interface with save/get/delete/touch operations
- File: `apps/server/src/infrastructure/model/GameStateRepository.ts`

**GameGateway:**
- Purpose: Abstract server communication
- Examples: `SocketGateway` (Socket.IO implementation)
- Pattern: Event emitter/listener interface for all server interactions
- File: `apps/web/src/data/GameGateway.ts`

**Game Rules Functions:**
- Purpose: Encapsulate complex game logic
- Examples: `assignRoles()`, `resolveVoting()`, `evaluateWinner()`, `beginRoundDescription()`
- Pattern: Pure functions that mutate GameState or return new values
- File: `apps/server/src/utils/gameRules.ts`

**Use Cases:**
- Purpose: Orchestrate a single business operation
- Examples: CreateRoomUseCase, SubmitVoteUseCase, StartGameUseCase
- Pattern: Constructor dependency injection, single execute() method
- Server pattern: async execute(input) → Promise<output>, saves to repository, returns state
- Web pattern: execute() calls gateway method, no return (event-driven)

**Game Selectors:**
- Purpose: Derive computed state from GameState
- Examples: `getViewer()`, `alivePlayers()`, `isHost()`
- Pattern: Pure functions that filter/project GameState
- File: `apps/web/src/domain/utils/gameSelectors.ts`

## Entry Points

**Server:**
- Location: `apps/server/src/index.ts`
- Triggers: Node process startup
- Responsibilities: Load environment variables, create Redis connection, bootstrap Socket server with dependency injection

**Web:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Initialize i18n, mount React root with App component

**Server Socket Handler:**
- Location: `apps/server/src/infrastructure/socketHandlers.ts`
- Triggers: Socket connection and per-socket events (room:create, game:start, vote:submit, etc.)
- Responsibilities: Validate request, execute use case, handle errors, broadcast state updates

**App Component (Main React Component):**
- Location: `apps/web/src/presentation/App.tsx`
- Triggers: Initial mount, gateway events, user interactions
- Responsibilities: Manage session state (roomId, playerId), render screens based on phase, delegate actions to use cases

## Error Handling

**Strategy:** Try-catch blocks with descriptive error messages, emitted to client

**Patterns:**
- **Server:** Use cases throw Error with descriptive message → socket handler catches → emits 'server:error' event
- **Client:** Gateway error handler sets error state → displayed in UI via error banner
- **Validation:** Early returns with guard clauses in use cases (check phase, player existence, permissions)
- **Recovery:** Client automatically reconnects on disconnect; user can manually exit and restart

## Cross-Cutting Concerns

**Logging:**
- Server: Only startup message (console.log)
- Client: No explicit logging (browser console available for debugging)

**Validation:**
- Server-side: Every use case validates input (room exists, phase valid, player alive, permission checks)
- Client-side: No validation (trust server responses)

**Authentication:**
- Implicit via playerId: Players identified by stored playerId in localStorage
- No auth tokens or password; session purely via roomId + playerId

**Data Sanitization:**
- Server: sanitizeGameStateForViewer() redacts roles/words for non-viewers before broadcast
- Client: None needed (sanitization happens server-side)

**Word/Role Reveal Logic:**
- Server: sanitizeGameStateForViewer hides roles except at GAME_ENDED phase
- Client: WordRevealPopup only shows word (not role); GameEndRoleRevealModal shows role only at game end

---

*Architecture analysis: 2026-02-28*
