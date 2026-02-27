# Testing Patterns

**Analysis Date:** 2026-02-28

## Test Framework

**Runner:**
- **vitest** 3.0.8 (both server and web)
- Config: Implicit Vitest config (uses defaults, no explicit config file in repo)
- Both `apps/server` and `apps/web` use vitest

**Assertion Library:**
- `vitest` built-in `expect()` - Used for assertions in all test files

**Run Commands:**
```bash
npm run test                    # Run tests in server workspace
npm run test --workspace @imposter/web  # Run tests in web workspace
```

**Available in package.json:**
- Server: `"test": "vitest run"`
- Web: `"test": "vitest run"`

## Test File Organization

**Location:**
- **Co-located in `__tests__` subdirectories** parallel to source files
- Pattern: `src/[layer]/__tests__/FileName.test.ts`

**Naming:**
- `FileName.test.ts` - Standard Vitest pattern
- Test file name matches source file name
- Examples:
  - `gameRules.ts` → `__tests__/gameRules.test.ts`
  - `ShareLink.ts` → `__tests__/ShareLink.test.ts`
  - `SubmitVoteUseCase.ts` → `__tests__/SubmitVoteUseCase.test.ts`

**Structure:**
```
apps/server/src/
├── utils/
│   ├── gameRules.ts
│   └── __tests__/
│       └── gameRules.test.ts
├── application/
│   ├── usecases/
│   │   └── SubmitVoteUseCase.ts
│   └── __tests__/
│       └── SubmitVoteUseCase.test.ts

apps/web/src/
├── domain/
│   ├── usecases/
│   │   └── ShareLink.ts
│   └── __tests__/
│       └── ShareLink.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
// From apps/server/src/utils/__tests__/gameRules.test.ts
import { describe, expect, test } from 'vitest';
import { GameMode, Phase, Role, Winner, type GameState } from '@imposter/shared';
import { assignRoles, applyRoundResult, advanceAfterRound } from '../gameRules';

describe('resolveVoting', () => {
  test('starts a re-vote on first tie', () => {
    // Arrange
    const state = baseState(GameMode.CLASSIC);
    state.votes = [...];

    // Act
    const result = resolveVoting(state);

    // Assert
    expect(result.status).toBe('REVOTE');
  });
});
```

**Patterns:**
- **Setup:** Helper factory functions create base state objects (e.g., `baseState()`, `makeVotingState()`)
- **Teardown:** None explicit - tests are isolated with fresh state each run
- **Assertion:** Direct `expect()` checks on return values and mutated state

## Mocking

**Framework:**
- No explicit mocking library detected (jest.mock, vitest.mock)
- **Manual mock implementations** using class implementations

**Patterns:**
```typescript
// From apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
class InMemoryRepo implements GameStateRepository {
  private store = new Map<string, GameState>();
  async getByRoomId(roomId: string) {
    return this.store.get(roomId) ?? null;
  }
  async save(gameState: GameState) {
    this.store.set(gameState.roomId, gameState);
  }
  async touch(_roomId: string) {}
  async delete(_roomId: string) {}
}
```

**Example in test:**
```typescript
// Use case test creates mock repository
const repo = new InMemoryRepo();
await repo.save(makeVotingState());
const useCase = new SubmitVoteUseCase(repo);
const result = await useCase.execute({ roomId: 'R1', ... });
```

**What to Mock:**
- External dependencies (repositories, gateways)
- Time-dependent operations (use `random: () => number` function parameter)
- Network calls (handled through gateway abstraction)

**What NOT to Mock:**
- Pure business logic functions (test them directly)
- Game rule calculations (test with real data)
- Game state transformations

## Fixtures and Factories

**Test Data:**
```typescript
// Factory pattern - from apps/server/src/utils/__tests__/gameRules.test.ts
const baseState = (mode: GameMode): GameState => ({
  roomId: 'ROOM1',
  createdAt: 1,
  updatedAt: 1,
  hostPlayerId: 'p1',
  phase: Phase.ROUND_VOTING,
  // ... full state initialization
  players: [ /* full player setup */ ],
});

// Specific setup helper
const makeVotingState = (): GameState => ({
  // ... specific to voting phase tests
});
```

**Location:**
- Fixture factories defined in test file itself (at top, before describe blocks)
- No separate fixtures directory
- One factory per test suite or shared factory for common setup

**Strategy:**
- Create minimal valid state that tests can override
- Use simple defaults: `id: 'p1'`, `name: 'A'`, `joinedAt: 1`
- Allow partial overrides: `baseState(GameMode.CLASSIC)` or `makeGameState(overrides: Partial<GameState>)`

## Coverage

**Requirements:**
- No coverage threshold enforced in codebase
- Core game logic prioritized for testing (domain and game rules)

**View Coverage:**
```bash
vitest run --coverage  # If coverage reporters configured
```

**Current test focus:**
- Server-side game rules: `apps/server/src/utils/__tests__/` (comprehensive)
- Use cases: `apps/server/src/application/__tests__/` (comprehensive)
- Web domain logic: `apps/web/src/domain/__tests__/` (selective)

## Test Types

**Unit Tests:**
- **Scope:** Pure functions and class methods with injected dependencies
- **Approach:** Test single responsibility per test
- **Examples:**
  - `resolveVoting()` - Vote tallying logic
  - `assignRoles()` - Role distribution
  - `parseShareInvite()` - URL parsing
  - `buildShareUrl()` - URL building
- **Location:** Colocated with source files in `__tests__/`

**Integration Tests:**
- **Scope:** Use cases with mocked repositories
- **Approach:** Test full use case execution with state mutations
- **Examples:**
  - `SubmitVoteUseCase.execute()` - Vote submission flow
  - `PreviewRoomUseCase.execute()` - Room preview flow
  - `SubmitStatementUseCase.execute()` - Statement submission
- **Mocking:** Repository is mocked, domain logic is real

**E2E Tests:**
- **Framework:** Not used
- **Approach:** All end-to-end testing currently manual or through UI

## Common Patterns

**Async Testing:**
```typescript
// From apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
test('host vote resolves immediately to ELIMINATED', async () => {
  const repo = new InMemoryRepo();
  await repo.save(makeVotingState());
  const useCase = new SubmitVoteUseCase(repo);

  const { gameState, resolution } = await useCase.execute({
    roomId: 'R1',
    playerId: 'host',
    targetPlayerId: 'p2',
  });

  expect(gameState.votes.some(v => v.voterId === 'host')).toBe(true);
  expect(resolution.status).toBe('ELIMINATED');
});
```

**Error Testing:**
```typescript
// From apps/server/src/application/__tests__/SubmitVoteUseCase.test.ts
test('non-host cannot cast vote', async () => {
  const repo = new InMemoryRepo();
  await repo.save(makeVotingState());
  const useCase = new SubmitVoteUseCase(repo);

  await expect(
    useCase.execute({ roomId: 'R1', playerId: 'p2', targetPlayerId: 'p3' })
  ).rejects.toThrow('Only host can submit votes');
});
```

**State Mutation Testing:**
```typescript
// From apps/server/src/utils/__tests__/gameRules.test.ts
test('removes the vote from votes array', () => {
  const state = baseState(GameMode.CLASSIC);
  upsertVote(state, { voterId: 'p1', targetPlayerId: 'p2', submittedAt: 1 });
  expect(state.votes).toHaveLength(1);

  retractVote(state, 'p1');
  expect(state.votes).toHaveLength(0);
});
```

**Phase Transition Testing:**
```typescript
// From apps/server/src/utils/__tests__/gameRules.test.ts
test('classic loses immediately when white is eliminated in round 1-2', () => {
  const state = baseState(GameMode.CLASSIC);
  state.round = 2;

  const eliminatedRole = applyRoundResult(state, 'p3');
  advanceAfterRound(state, eliminatedRole, () => 0.2);

  expect(state.winner).toBe(Winner.SPIES);
  expect(state.phase).toBe(Phase.GAME_ENDED);
});
```

## Test Execution

**Development:**
```bash
yarn test                  # Run tests once (from root)
```

**CI/CD:**
- No CI config detected in visible files
- Tests can be run with `yarn test` from root workspace
- Both server and web workspaces configured with vitest

## Testing Best Practices (from codebase)

**Observed conventions:**
1. **Descriptive test names** - Test name explains what is being tested and expected outcome
2. **Arrange-Act-Assert pattern** - Clear separation between setup, execution, and verification
3. **Factory-based fixtures** - Reduce duplication with helper functions that create common test data
4. **Pure function priority** - Game logic functions are tested as pure functions with seeded randomness
5. **One concern per test** - Each test validates a single behavior or edge case
6. **No test interdependence** - Tests run in any order without side effects
7. **Clear error assertions** - Test both success and error paths with meaningful error messages

---

*Testing analysis: 2026-02-28*
