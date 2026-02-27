# Coding Conventions

**Analysis Date:** 2026-02-28

## Naming Patterns

**Files:**
- **Classes/Use Cases:** `PascalCase` - Examples: `CreateRoomUseCase.ts`, `SubmitVoteUseCase.ts`, `GameStateRepository.ts`, `GameGateway.ts`, `SocketGateway.ts`
- **Component files:** `PascalCase` - Examples: `VotingPanel.tsx`, `GameScreen.tsx`, `LobbyScreen.tsx`, `ShareModal.tsx`
- **Utility/helper files:** `camelCase` - Examples: `gameRules.ts`, `gameSelectors.ts`, `parseWordPairs.ts`, `socketGateway.ts`
- **Test files:** `__tests__` directory with `FileName.test.ts` or `FileName.spec.ts` suffix - Examples: `apps/server/src/utils/__tests__/gameRules.test.ts`, `apps/web/src/domain/__tests__/ShareLink.test.ts`

**Functions:**
- **All functions:** `camelCase` - Examples: `assignRoles()`, `evaluateWinner()`, `sanitizeGameStateForViewer()`, `parseShareInvite()`, `buildShareUrl()`, `resolvePlayerName()`
- **Selector functions (domain):** Descriptive verbs or noun phrases: `getViewer()`, `alivePlayers()`, `isHost()`, `markStatementSubmitted()`

**Variables:**
- **All variables:** `camelCase` - Examples: `roomId`, `playerId`, `gameState`, `existingVote`, `isSameTarget`, `votedForName`, `selectedTarget`
- **Constants:** `UPPER_SNAKE_CASE` - Examples: `LOCALHOST_HOSTS = new Set([...])`, shared enums follow this pattern

**Types & Interfaces:**
- **Interfaces:** `PascalCase`, descriptive of responsibility - Examples: `Input`, `Output`, `Props`, `GameGateway`, `GatewayEventCallbacks`, `VoteResolution`
- **Classes:** `PascalCase` - Examples: `SubmitVoteUseCase`, `InMemoryRepo`, `SocketGateway`

## Code Style

**Formatting:**
- Tool: **Prettier** 3.8.1
- Config file: `.prettierrc`
- Key settings:
  - `semi: true` - Require semicolons
  - `singleQuote: true` - Use single quotes for strings
  - `tabWidth: 2` - 2 spaces for indentation
  - `trailingComma: 'all'` - Trailing commas in multi-line arrays/objects
  - `printWidth: 100` - Line length limit

**Linting:**
- No ESLint config found - code style enforced via Prettier + TypeScript strict mode

**TypeScript Strict Mode:**
- **Enabled:** Full strict mode (`"strict": true` in `tsconfig.base.json`)
- **Target:** ES2022
- **Module:** ESNext
- **Resolution:** Bundler
- Enforces: null/undefined checks, explicit types, consistent casing

## Import Organization

**Order:**
1. External dependencies from `node_modules` (React, shared types, etc.)
2. Absolute path imports using path aliases (`@imposter/shared`)
3. Relative imports from same codebase (domain, infrastructure, presentation)

**Examples from codebase:**
```typescript
// app/server/src/infrastructure/socketHandlers.ts
import { ClientToServerEvents, ... } from '@imposter/shared';  // External + shared
import { Server, Socket } from 'socket.io';                     // External
import { CreateRoomUseCase } from '../application/usecases/CreateRoomUseCase';  // Relative
```

**Path Aliases:**
- `@imposter/shared` → `packages/shared/src/index.ts`
- `@imposter/shared/*` → `packages/shared/src/*`
- Defined in `tsconfig.base.json`

## Error Handling

**Patterns:**
- **Throw errors with descriptive messages:** `throw new Error('Room not found')`, `throw new Error('Not voting phase')`
- **Use try-catch for async operations:** Wrapped in socket handlers and use cases
- **Validation before state changes:** Check player alive status, room existence, phase validity before executing operations
- **Guard clauses:** Early returns for invalid states (example in `SubmitVoteUseCase.ts` lines 24-38)

**Error propagation:**
```typescript
// Socket handlers catch and emit errors to client
socket.on('room:create', async (payload) => {
  try {
    // operation
  } catch (error) {
    sendError((error as Error).message);
  }
});
```

## Logging

**Framework:** `console` (implicit in Node.js/browser)

**Patterns:**
- No explicit logging library detected
- Console output available but not heavily instrumented in visible code
- Error messages propagated through socket `server:error` events to client

## Comments

**When to Comment:**
- Comments are minimal in codebase (follows clean code principle)
- Logic is expressed through clear naming rather than comments
- Comments used for complex game rules or non-obvious calculations

**JSDoc/TSDoc:**
- Not extensively used
- TypeScript types serve as primary documentation
- Function signatures with clear Input/Output types provide documentation

## Function Design

**Size:**
- Target under 50 lines per function
- Complex game logic broken into smaller pure functions
- Example: `gameRules.ts` has many small focused functions (`alivePlayers`, `countAliveCitizens`, `countAliveSpies`, `shuffl`, `pickTieBreakCandidate`)

**Parameters:**
- Prefer **interface/type for input** when function takes multiple parameters
- Examples: `Input` interface in use cases contains roomId, playerId, etc.
- Functions accept (state, ...args) pattern for mutation: `assignRoles(players, settings, random)`

**Return Values:**
- Explicit return types in signatures
- Use interfaces for complex returns: `Output`, `VoteResolution`, `PostRoundOutcome`
- Pure functions return new state rather than mutating: `assignRoles` returns `Role[]`, mutation functions return `void`

## Module Design

**Exports:**
- Named exports for functions and classes (not default exports)
- Example: `export class SubmitVoteUseCase { ... }`, `export const parseShareInvite = (...) => {...}`
- Single class/main function per file

**Barrel Files:**
- Not heavily used in this codebase
- Each module imports directly from specific files
- Example: App.tsx imports from specific domain files, not from barrel `index.ts`

**Layer Structure (Mandatory):**
- **Server:**
  - `src/domain/` - Pure game logic (no framework dependencies)
  - `src/application/` - Use cases orchestrating domain/infrastructure
  - `src/infrastructure/` - Socket handlers, repository implementations
  - `src/utils/` - Pure utilities and helpers

- **Web:**
  - `src/domain/` - Business logic selectors, use cases, utilities
  - `src/data/` - Gateway implementations (Socket.IO client)
  - `src/presentation/` - React components and UI logic
  - `src/design-system/` - Design tokens and styles

## Dependency Direction

**Valid imports:**
- Presentation → Domain/Data
- Application → Domain/Infrastructure
- Infrastructure → Application/Utils
- Data → Domain

**Invalid imports (enforced by architecture):**
- Domain cannot import from Presentation, Infrastructure, or Application
- Infrastructure cannot import from Presentation

## Testing Conventions

**Naming patterns:**
- Test files colocated in `__tests__` directory parallel to source
- Naming: `SourceFile.test.ts` or `SourceFile.spec.ts`
- Examples: `gameRules.test.ts` for `gameRules.ts`, `ShareLink.test.ts` for `ShareLink.ts`

**Test organization:**
- Use `describe()` blocks for feature/function grouping
- Use `test()` for individual assertions
- Test names describe expected behavior: `'host vote resolves immediately to ELIMINATED'`

---

*Convention analysis: 2026-02-28*
